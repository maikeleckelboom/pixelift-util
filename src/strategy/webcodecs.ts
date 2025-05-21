import type { DecodeOptions, Decoder, PixelData } from '@/core/types';
import { createError } from '@/shared/error';

/**
 * Convert various image buffer sources into a readable stream,
 * as required by ImageDecoder.
 */
function toReadableStream(
  input: ImageBufferSource | Blob,
  type: string,
): ReadableStream<Uint8Array> {
  if (input instanceof Blob) {
    return input.stream();
  }

  if (input instanceof ReadableStream) {
    return input;
  }

  try {
    return new Blob([input], { type }).stream();
  } catch (err) {
    throw createError.invalidInput(
      'Non-streamable input for WebCodecs decoding',
      input,
    );
  }
}

export const webCodecsDecoder: Decoder = {
  name: 'webcodecs',

  async decode(
    input: Blob | ImageBufferSource,
    options?: DecodeOptions,
  ): Promise<PixelData> {
    const isBlob = input instanceof Blob;
    const type = options?.type ?? (isBlob ? input.type : undefined);

    if (!type) {
      throw createError.invalidInput(
        'Missing MIME type for image decoding',
        input,
      );
    }

    if (
      !ImageDecoder.isTypeSupported ||
      !(await ImageDecoder.isTypeSupported(type))
    ) {
      throw createError.invalidOption(`MIME type not supported: ${type}`);
    }

    const data = toReadableStream(input, type);
    const decoder = new ImageDecoder({ type, data });

    const { image: frame } = await decoder.decode({
      frameIndex: 0,
      completeFramesOnly: true,
    });

    if (options?.signal?.aborted) {
      decoder.close();
      throw createError.aborted('Decoding aborted', input);
    }

    if (!frame || frame.codedWidth === 0 || frame.codedHeight === 0) {
      frame?.close();
      decoder.close();
      throw createError.invalidInput(
        !frame
          ? 'No image frame returned'
          : 'Invalid image dimensions for WebCodecs decoding',
        input,
      );
    }

    const byteLength = frame.allocationSize({ format: 'RGBA' });
    const dataBuffer = new Uint8ClampedArray(byteLength);

    await frame.copyTo(dataBuffer, {
      format: 'RGBA',
      colorSpace: 'srgb',
    });

    const result: PixelData = {
      width: frame.codedWidth,
      height: frame.codedHeight,
      data: dataBuffer,
    };

    frame.close();
    decoder.close();

    return result;
  },

  isSupported(mime: string): boolean | Promise<boolean> {
    return (
      typeof ImageDecoder !== 'undefined' &&
      typeof ImageDecoder.isTypeSupported === 'function' &&
      ImageDecoder.isTypeSupported(mime)
    );
  },
};
