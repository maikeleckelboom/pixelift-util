import type {
  DecodeAnimationOptions,
  DecodeOptions,
  Decoder,
  DecoderInput,
  FrameConversionOptions,
  PixelData,
} from '@/core/types';
import { createError } from '@/shared/error';
import { decodeFramesProgressively } from '@/utils/decode-frames-progressively';
import { toReadableStream } from '@/utils/to-readable-stream';

export class WebCodecsDecoder implements Decoder {
  public readonly name = 'webcodecs';

  static async decode(
    input: DecoderInput,
    options?: DecodeOptions,
  ): Promise<PixelData> {
    const decoder = new WebCodecsDecoder();
    return decoder.decode(input, options);
  }

  public async decode(
    input: DecoderInput,
    options?: DecodeOptions,
  ): Promise<PixelData> {
    const { decoder } = await this.initDecoder(input, options);
    let frame: VideoFrame | null = null;

    try {
      options?.signal?.throwIfAborted();

      const track = decoder.tracks.selectedTrack!;
      const frameIndex = options?.frameIndex ?? 0;

      if (frameIndex < 0 || frameIndex >= track.frameCount) {
        throw createError.invalidOption(
          `Frame index ${frameIndex} out of range (0-${track.frameCount - 1})`,
        );
      }

      const result = await decoder.decode({
        frameIndex,
        completeFramesOnly: !!options?.completeFramesOnly,
      });

      frame = result.image;

      options?.signal?.throwIfAborted();

      if (!frame?.codedWidth || !frame?.codedHeight) {
        throw createError.decodingFailed(
          'Decoded frame has invalid dimensions',
        );
      }

      return await this.frameToPixelData(frame);
    } finally {
      frame?.close();
      decoder.close();
    }
  }

  public async *decodeAnimation(
    input: DecoderInput,
    options?: DecodeAnimationOptions,
  ): AsyncGenerator<PixelData, void, undefined> {
    const { decoder, determinedType } = await this.initDecoder(input, options);

    try {
      options?.signal?.throwIfAborted();

      const track = decoder.tracks.selectedTrack!;
      if (!track.animated) {
        throw createError.runtimeError(
          'Requested animation decoding for non-animated track',
          { mimeType: determinedType },
        );
      }

      yield* decodeFramesProgressively(decoder, options);
    } finally {
      decoder.close();
    }
  }

  public static isSupported(
    mimeType: string | undefined,
  ): boolean | Promise<boolean> {
    if (!mimeType || typeof ImageDecoder === 'undefined') return false;
    return ImageDecoder.isTypeSupported(mimeType);
  }

  private async frameToPixelData(
    frame: VideoFrame,
    options?: FrameConversionOptions,
  ): Promise<PixelData> {
    const format = options?.format || 'RGBA';
    const colorSpace = options?.colorSpace || 'srgb';

    try {
      const byteLength = frame.allocationSize({ format });
      const dataBuffer = new Uint8ClampedArray(byteLength);

      await frame.copyTo(dataBuffer, {
        format,
        colorSpace,
      });

      return {
        width: frame.codedWidth,
        height: frame.codedHeight,
        data: dataBuffer,
      };
    } catch (error) {
      throw createError.runtimeError(
        `Failed to convert frame to PixelData: ${error instanceof Error ? error.message : String(error)}`,
        {
          format,
          colorSpace,
          frameDimensions: `${frame.codedWidth}x${frame.codedHeight}`,
        },
      );
    }
  }

  private async initDecoder(
    input: DecoderInput,
    options?: DecodeOptions,
  ): Promise<{ decoder: ImageDecoder; determinedType: string }> {
    options?.signal?.throwIfAborted();

    if (!input) {
      throw createError.invalidOption('Input cannot be null or undefined');
    }

    if (typeof ImageDecoder === 'undefined') {
      throw createError.runtimeError(
        'WebCodecs ImageDecoder API is unavailable',
      );
    }

    const determinedType =
      options?.type || (input instanceof Blob ? input.type : undefined);
    if (!determinedType) {
      throw createError.invalidOption(
        'MIME type required for decoding. Provide via options.type or use a typed Blob',
      );
    }

    let isSupported: boolean;
    try {
      isSupported = await ImageDecoder.isTypeSupported(determinedType);
    } catch (error) {
      throw createError.invalidInput('A valid MIME type', determinedType);
    }

    if (!isSupported) {
      throw createError.invalidOption(
        `Unsupported MIME type: ${determinedType}`,
      );
    }

    const dataStream = toReadableStream(input, determinedType);
    const decoder = new ImageDecoder({
      type: determinedType,
      data: dataStream,
      preferAnimation: !!options?.prefersAnimation,
    });

    try {
      await decoder.tracks.ready;
    } catch (error) {
      decoder.close();
      throw createError.decodingFailed(
        determinedType,
        `Decoder initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }

    options?.signal?.throwIfAborted();

    if (!decoder.tracks.selectedTrack) {
      decoder.close();
      throw createError.decodingFailed(
        determinedType,
        'No selected track available for decoding',
      );
    }

    return { decoder, determinedType };
  }
}
