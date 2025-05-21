import { blobFromStream } from '@/utils/blob-from-stream';
import { decode } from '@/core/decode';
import type { DecodeOptions, Decoder, PixelData } from '@/core/types';
import { createError } from '@/shared/error';

export class StreamAutoDecoder implements Decoder {
  readonly name = 'stream-auto';

  async decode(input: any, options: DecodeOptions = {}): Promise<PixelData> {
    if (!(input instanceof ReadableStream)) {
      throw createError.invalidInput('ReadableStream', input);
    }

    const blob = await blobFromStream(input, {
      signal: options.signal,
      type: options.type,
    });

    return decode(blob, options);
  }

  isSupported(): boolean {
    return true;
  }
}

export const streamAutoDecoder = new StreamAutoDecoder();
