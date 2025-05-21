import { getAllDecoders, getDecoder } from './registry';
import type { DecodeOptions, DecoderInput, PixelData } from './types';
import { createError } from '@/shared/error';

export async function decodeWithStrategy(
  strategy: string,
  input: DecoderInput,
  options?: DecodeOptions,
): Promise<PixelData> {
  const decoder = getDecoder(strategy);

  if (decoder) {
    return decoder.decode(input, options);
  }

  throw createError.notFound(
    `Decoder strategy "${strategy}" not found.`,
    'decodeWithStrategy',
  );
}

export async function decode(
  input: DecoderInput,
  options: DecodeOptions = {},
): Promise<PixelData> {
  const decoders = getAllDecoders();

  const type = options.type || (input instanceof Blob ? input.type : undefined);

  for (const decoder of decoders) {
    if (decoder.isSupported?.(type)) {
      return decoder.decode(input, options);
    }
  }

  throw createError.notFound(
    `No decoder found for MIME type "${type}".`,
    'decode',
  );
}
