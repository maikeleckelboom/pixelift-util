import { createError } from '@/shared/error';

export interface ControlledStreamOptions {
  signal?: AbortSignal;
  maxBytes?: number;
  onProgress?: (info: { bytesProcessed: number }) => void;
  chunkSize?: number;
}
export function streamWithControls(
  source: ReadableStream<Uint8Array>,
  options: ControlledStreamOptions = {},
): ReadableStream<Uint8Array> {
  const { signal, maxBytes, onProgress } = options;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader();
      let bytesProcessed = 0;

      const checkLimit = (len: number) => {
        if (maxBytes && bytesProcessed + len > maxBytes) {
          throw createError.maxBytesExceeded(maxBytes, bytesProcessed + len);
        }
      };

      const emitProgress = () => {
        onProgress?.({ bytesProcessed });
      };

      const abortPromise = new Promise<never>((_, reject) => {
        if (!signal) return;
        signal.addEventListener(
          'abort',
          () => {
            reject(createError.aborted('Stream aborted by user'));
          },
          { once: true },
        );
      });

      const loop = async () => {
        while (true) {
          const { done, value } = signal
            ? await Promise.race([reader.read(), abortPromise])
            : await reader.read();

          if (done) break;
          if (!value) continue;

          checkLimit(value.byteLength);
          controller.enqueue(value);
          bytesProcessed += value.byteLength;
          emitProgress();
        }
      };

      loop()
        .then(() => controller.close())
        .catch((err) => {
          reader.cancel(err).catch(() => {});
          controller.error(err);
        });
    },
  });
}
