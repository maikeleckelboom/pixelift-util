import { createError } from '@/shared/error';

export function toReadableStream(
  input: ImageBufferSource | Blob,
  type: string,
): ReadableStream<Uint8Array> {
  if (input instanceof Blob) return input.stream();
  if (input instanceof ReadableStream) return input;

  try {
    return new Blob([input], { type }).stream();
  } catch {
    throw createError.invalidInput(
      'Non-streamable input for WebCodecs decoding',
      input,
    );
  }
}
