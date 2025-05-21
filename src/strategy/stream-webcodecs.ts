import { streamToBlob } from '@/utils/stream-to-blob';
import { webCodecsDecoder } from './webcodecs';
import type {
  DecodeOptions,
  Decoder,
  DecoderInput,
  PixelData,
} from '@/core/types';

export const streamWebCodecsDecoder: Decoder = {
  name: 'stream-webcodecs',

  async decode(
    input: DecoderInput,
    options: DecodeOptions = {},
  ): Promise<PixelData> {
    if (!(input instanceof ReadableStream) && !(input instanceof Blob)) {
      throw new TypeError('Input must be a ReadableStream');
    }

    const blob = await streamToBlob(input, {
      signal: options.signal,
      type: options.type,
      onProgress: (v) => console.log(v),
    });

    return webCodecsDecoder.decode(blob, options);
  },

  isSupported: (type?: string) =>
    webCodecsDecoder.isSupported?.(type ?? '') ?? false,
};
