import { decode } from '@/core/decode';
import type {
  DecodeOptions,
  Decoder,
  DecoderInput,
  PixelData,
} from '@/core/types';
import { isBrowser, isWorker } from '@/shared/env';
import { streamToBlob } from '@/utils/stream-to-blob';
import { formatBytes } from '@/utils/math';

export const streamCanvas: Decoder = {
  name: 'stream-canvas',

  async decode(
    input: DecoderInput,
    options: DecodeOptions = {},
  ): Promise<PixelData> {
    const blob = await streamToBlob(input, {
      ...options,
      onProgress: (v) => {
        console.log(`stream-canvas: ${formatBytes(v)} bytes processed`);
      },
    });

    return decode(blob, options);
  },

  isSupported: () => {
    return isBrowser() || isWorker();
  },
};
