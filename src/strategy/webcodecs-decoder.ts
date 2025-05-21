import { toReadableStream } from '@/utils/to-readable-stream';
import { createError } from '@/shared/error';
import type {
  DecodeAnimationOptions,
  DecodeOptions,
  Decoder,
  PixelData,
} from '@/core/types';
import { decodeFramesProgressively } from '@/utils/decode-frames-progressively';

export class WebCodecsDecoder implements Decoder {
  name = 'webcodecs';

  async decode(
    input: ImageBufferSource,
    options?: DecodeOptions,
  ): Promise<PixelData> {
    const stream = toReadableStream(input, 'image/png'); // TODO: MIME detection

    if (!('ImageDecoder' in globalThis)) {
      throw createError.invalidInput(
        'ImageDecoder supported by the environment',
        undefined,
      );
    }

    const decoder = new ImageDecoder({
      data: stream,
      type: 'image/png',
    });

    await decoder.tracks.ready;

    if (!decoder.tracks.selectedTrack) {
      throw createError.invalidInput(
        'Selected track for WebCodecs decoding',
        'No selected track',
      );
    }

    const { image: frame } = await decoder.decode({
      frameIndex: options?.frameIndex ?? 0,
    });

    if (!frame) {
      throw createError.invalidOption('No frame decoded');
    }

    if (frame.codedWidth === 0 || frame.codedHeight === 0) {
      frame.close();
      throw createError.invalidOption('Invalid frame dimensions');
    }

    const byteLength = frame.allocationSize({ format: 'RGBA' });
    const data = new Uint8ClampedArray(byteLength);

    await frame.copyTo(data, { format: 'RGBA', colorSpace: 'srgb' });
    frame.close();
    decoder.close();

    return { width: frame.codedWidth, height: frame.codedHeight, data };
  }

  async *decodeAnimation(
    input: ImageBufferSource,
    options?: DecodeAnimationOptions,
  ): AsyncGenerator<PixelData, void, void> {
    if (!('ImageDecoder' in globalThis)) {
      throw createError.invalidInput(
        'ImageDecoder supported by the environment',
        undefined,
      );
    }

    const stream = toReadableStream(input, 'image/png'); // TODO: MIME detection

    const decoder = new ImageDecoder({
      data: stream,
      type: 'image/png',
    });

    await decoder.tracks.ready;

    if (!decoder.tracks.selectedTrack) {
      throw createError.invalidInput(
        'Selected track for WebCodecs decoding',
        'No selected track',
      );
    }

    if (!decoder.tracks.selectedTrack.animated) {
      throw createError.invalidOption(
        'Animation decoding is not supported for this track',
      );
    }

    if (options?.prefersAnimation) {
      yield* decodeFramesProgressively(decoder, options);
    } else {
      const { image: frame } = await decoder.decode({
        frameIndex: options?.frameIndex ?? 0,
      });
      if (!frame) {
        decoder.close();
        throw createError.invalidOption('No frame decoded');
      }

      if (frame.codedWidth === 0 || frame.codedHeight === 0) {
        frame.close();
        decoder.close();
        throw createError.invalidOption('Invalid frame dimensions');
      }

      const byteLength = frame.allocationSize({ format: 'RGBA' });
      const data = new Uint8ClampedArray(byteLength);

      await frame.copyTo(data, { format: 'RGBA', colorSpace: 'srgb' });
      frame.close();
      decoder.close();

      yield { width: frame.codedWidth, height: frame.codedHeight, data };
    }
  }

  isSupported = (type: string) => {
    return (
      typeof ImageDecoder !== 'undefined' &&
      !!ImageDecoder.isTypeSupported &&
      ImageDecoder.isTypeSupported(type)
    );
  };
}
