import { createError, PixeliftError } from '@/shared/error';
import type { DecoderInput } from '@/core/types';

export interface StreamToBlobOptions {
  signal?: AbortSignal;
  type?: string;
  maxBytes?: number;
  onProgress?: (bytesProcessed: number) => void;
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
    throw createError.invalidOption('chunkSize must be positive');
  }

  if (options.maxBytes !== undefined && options.maxBytes <= 0) {
    throw createError.invalidOption('maxBytes must be positive');
  }
}

export async function streamToBlob(
  stream: DecoderInput,
  options?: StreamToBlobOptions,
): Promise<Blob> {
  validate(stream, options);

  const { signal, type, maxBytes, onProgress, chunkSize } = options || {};

  if (signal?.aborted) {
    throw createError.aborted('Operation was already aborted');
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let bytesProcessed = 0;
  let abortHandler: (() => void) | null = null;

  let chunkBuffer: Uint8Array | null =
    chunkSize && chunkSize > 0 ? new Uint8Array(chunkSize) : null;
  let bufferOffset = 0;

  const updateProgress = () => {
    if (!onProgress) return;
    onProgress(bytesProcessed);
  };

  const checkSizeLimit = (prospectiveBytesToAdd: number) => {
    if (maxBytes && bytesProcessed + prospectiveBytesToAdd > maxBytes) {
      throw createError.maxBytesExceeded(
        maxBytes,
        bytesProcessed + prospectiveBytesToAdd,
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

            const spaceInCurrentChunk = chunkBuffer.length - bufferOffset;
            const sliceToCopy = dataToProcess.subarray(
              0,
              Math.min(dataToProcess.byteLength, spaceInCurrentChunk),
            );

            chunkBuffer.set(sliceToCopy, bufferOffset);
            bufferOffset += sliceToCopy.byteLength;
            dataToProcess = dataToProcess.subarray(sliceToCopy.byteLength);

            if (bufferOffset === chunkBuffer.length) {
              checkSizeLimit(chunkBuffer.byteLength);
              chunks.push(chunkBuffer);
              bytesProcessed += chunkBuffer.byteLength;
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
      const finalPartialChunk = chunkBuffer.subarray(0, bufferOffset);
      checkSizeLimit(finalPartialChunk.byteLength);
      chunks.push(finalPartialChunk);
      bytesProcessed += finalPartialChunk.byteLength;
      updateProgress();
    }

    signal?.throwIfAborted();

    return new Blob(chunks, { type: type || 'application/octet-stream' });
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
      abortHandler = null;
    }
    if (reader) {
      try {
        reader.releaseLock();
      } catch {
        /* ignore error */
      }
    }
  }
}
