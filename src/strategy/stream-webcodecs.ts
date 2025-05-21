import { blobFromStream } from '@/utils/blob-from-stream';
import { WebCodecsDecoder } from './webcodecs';
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
  ): Promise<PixelData | PixelData[]> {
    const blob = await blobFromStream(input, {
      signal: options.signal,
      type: options.type,
      onProgress: (v) => console.log(v),
    });

    return WebCodecsDecoder.decode(blob, options);
  },

  isSupported: (type?: string) => WebCodecsDecoder.isSupported(type),
};

export class StreamWebCodecsDecoder implements Decoder {
  readonly name = 'stream-webcodecs';

  async decode(
    input: DecoderInput,
    options: DecodeOptions = {},
  ): Promise<PixelData | PixelData[]> {
    const blob = await blobFromStream(input, {
      signal: options.signal,
      type: options.type,
      onProgress: (v) => console.log(v),
    });

    return WebCodecsDecoder.decode(blob, options);
  }

  isSupported(type?: string) {
    return WebCodecsDecoder.isSupported(type);
  }
}
