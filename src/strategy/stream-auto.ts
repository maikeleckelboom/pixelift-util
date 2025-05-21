import { streamToBlob } from '@/utils/stream-to-blob';
import { decode } from '@/core/decode';
import type { DecodeOptions, Decoder, PixelData } from '@/core/types';
import { createError } from '@/shared/error';

export const streamAutoDecoder: Decoder = {
  name: 'stream-auto',
  async decode(input, options: DecodeOptions = {}): Promise<PixelData> {
    if (!(input instanceof ReadableStream)) {
      throw createError.invalidInput('ReadableStream', input);
    }

    const blob = await streamToBlob(input, {
      signal: options.signal,
      type: options.type,
    });

    return decode(blob, options);
  },
  isSupported: () => true,
};
