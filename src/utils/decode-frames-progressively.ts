import type { DecodeAnimationOptions, PixelData } from '@/core/types';
import { createError } from '@/shared/error';

/**
 * Decodes image frames progressively using the provided ImageDecoder and yields frame data as they are decoded.
 *
 * @param {ImageDecoder} decoder - The ImageDecoder instance used to decode the image frames.
 * @param {DecodeAnimationOptions} [options] - An optional configuration object for the decoding process, which can include:
 *   - `signal` (AbortSignal): An optional abort signal to cancel decoding.
 *   - `completeFramesOnly` (boolean): Determines whether to decode only complete frames (defaults to `true`).
 *
 * @return {AsyncGenerator<PixelData, void, void>} An asynchronous generator that yields `PixelData` objects containing decoded frame data, including:
 *   - `width` (number): The width of the decoded frame.
 *   - `height` (number): The height of the decoded frame.
 *   - `data` (Uint8ClampedArray): A buffer of pixel data in RGBA format.
 */
export async function* decodeFramesProgressively(
  decoder: ImageDecoder,
  options?: DecodeAnimationOptions,
): AsyncGenerator<PixelData, void, void> {
  let frameIndex = 0;

  const { signal, completeFramesOnly = true } = options ?? {};

  try {
    while (true) {
      if (signal?.aborted) {
        throw createError.aborted('Decoding aborted');
      }

      const { image: frame, complete } = await decoder.decode({
        frameIndex,
        completeFramesOnly,
      });

      if (complete) break;

      if (!frame) {
        throw createError.runtimeError(
          `No frame returned at index ${frameIndex}`,
        );
      }

      if (frame.codedWidth === 0 || frame.codedHeight === 0) {
        frame.close();
        throw createError.runtimeError(
          `Invalid image dimensions at frame ${frameIndex}`,
        );
      }

      const byteLength = frame.allocationSize({ format: 'RGBA' });
      const dataBuffer = new Uint8ClampedArray(byteLength);

      await frame.copyTo(dataBuffer, {
        format: 'RGBA',
        colorSpace: 'srgb',
      });

      yield {
        width: frame.codedWidth,
        height: frame.codedHeight,
        data: dataBuffer,
      };

      frame.close();
      frameIndex++;
    }
  } finally {
    decoder.close();
  }
}
