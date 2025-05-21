import { decode } from '@/core/decode';
import type {
  DecodeOptions,
  Decoder,
  DecoderInput,
  PixelData,
} from '@/core/types';
import { isBrowser, isWorker } from '@/shared/env';
import { blobFromStream } from '@/utils/blob-from-stream';

export class StreamCanvasDecoder implements Decoder {
  readonly name = 'stream-canvas';

  async decode(
    input: DecoderInput,
    options: DecodeOptions = {},
  ): Promise<PixelData> {
    const blob = await blobFromStream(input, options);

    return decode(blob, options);
  }

  isSupported(): boolean {
    return isBrowser() || isWorker();
  }
}
