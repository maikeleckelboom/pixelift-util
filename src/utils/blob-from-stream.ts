import { createError, PixeliftError } from '@/shared/error';
import type { DecoderInput } from '@/core/types';

export interface StreamToBlobOptions {
  /**
   * Optional AbortSignal to cancel the stream-to-blob conversion.
   */
  signal?: AbortSignal;

  /**
   * MIME type for the resulting Blob (e.g., 'image/png', 'application/octet-stream').
   * Defaults to 'application/octet-stream' if not provided.
   */
  mimeType?: string;

  /**
   * Maximum number of bytes to process before aborting with an error.
   * If exceeded, a MaxBytesExceededError is thrown.
   */
  maxBytes?: number;

  /**
   * Optional callback invoked with the number of bytes processed so far.
   */
  onProgress?: (bytesProcessed: number) => void;

  /**
   * Optional size in bytes to control how large chunks should be when buffering.
   * Can impact memory usage and progress reporting frequency.
   */
  chunkSize?: number;
}

function validate(
  input: DecoderInput,
  options: StreamToBlobOptions = {},
): asserts input is ReadableStream {
  if (!(input instanceof ReadableStream)) {
    throw createError.invalidOption('Stream is required');
  }

  if (input.locked) {
    throw createError.runtimeError('ReadableStream is already locked');
  }

  if (options.chunkSize !== undefined && options.chunkSize <= 0) {
    throw createError.invalidOption('chunkSize must be a positive integer');
  }

  if (options.maxBytes !== undefined && options.maxBytes <= 0) {
    throw createError.invalidOption('maxBytes must be a positive integer');
  }
}

export async function blobFromStream(
  stream: DecoderInput,
  options?: StreamToBlobOptions,
): Promise<Blob> {
  validate(stream, options);

  const { signal, mimeType, maxBytes, onProgress, chunkSize } = options || {};

  if (signal?.aborted) {
    throw createError.aborted('Operation was already aborted');
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let bytesProcessed = 0;
  let abortHandler: (() => void) | null = null;

  let chunkBuffer: Uint8Array | null = chunkSize
    ? new Uint8Array(chunkSize)
    : null;
  let bufferOffset = 0;

  const updateProgress = () => {
    if (onProgress) {
      onProgress(bytesProcessed);
    }
  };

  const checkSizeLimit = (nextChunkSize: number) => {
    if (maxBytes && bytesProcessed + nextChunkSize > maxBytes) {
      throw createError.maxBytesExceeded(
        maxBytes,
        bytesProcessed + nextChunkSize,
      );
    }
  };

  try {
    const abortPromise = new Promise<never>((_, reject) => {
      if (!signal) return;
      abortHandler = () =>
        reject(new DOMException('Operation aborted by user', 'AbortError'));
      signal.addEventListener('abort', abortHandler, { once: true });
    });

    while (true) {
      const readPromise = reader.read();
      const { done, value } = signal
        ? await Promise.race([readPromise, abortPromise])
        : await readPromise;

      if (done) break;

      if (value) {
        let dataToProcess = value;

        if (chunkBuffer && chunkSize) {
          while (dataToProcess.byteLength > 0) {
            signal?.throwIfAborted();

            const spaceRemaining = chunkBuffer.length - bufferOffset;
            const copySlice = dataToProcess.subarray(
              0,
              Math.min(dataToProcess.byteLength, spaceRemaining),
            );

            chunkBuffer.set(copySlice, bufferOffset);
            bufferOffset += copySlice.byteLength;
            dataToProcess = dataToProcess.subarray(copySlice.byteLength);

            if (bufferOffset === chunkBuffer.length) {
              checkSizeLimit(chunkBuffer.length);
              chunks.push(chunkBuffer);
              bytesProcessed += chunkBuffer.length;
              updateProgress();
              chunkBuffer = new Uint8Array(chunkSize);
              bufferOffset = 0;
            }
          }
        } else {
          checkSizeLimit(value.byteLength);
          chunks.push(value);
          bytesProcessed += value.byteLength;
          updateProgress();
        }
      }
    }

    if (chunkBuffer && bufferOffset > 0) {
      const remainder = chunkBuffer.subarray(0, bufferOffset);
      checkSizeLimit(remainder.length);
      chunks.push(remainder);
      bytesProcessed += remainder.length;
      updateProgress();
    }

    signal?.throwIfAborted();

    return new Blob(chunks, { type: mimeType ?? 'application/octet-stream' });
  } catch (error) {
    if (
      reader &&
      !(error instanceof DOMException && error.name === 'AbortError')
    ) {
      reader.cancel(error).catch(() => {});
    }

    if (error instanceof PixeliftError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createError.aborted('Stream processing was aborted', error);
    }

    throw createError.runtimeError('Failed to process stream', error);
  } finally {
    if (abortHandler && signal) {
      signal.removeEventListener('abort', abortHandler);
    }
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}
