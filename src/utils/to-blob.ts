import type { DecoderInput } from '@/core/types.ts';
import { copyToArrayBuffer } from '@/utils/array-buffer';

export async function toBlob(input: DecoderInput): Promise<Blob> {
  if (input instanceof Blob) return input;

  if (input instanceof ReadableStream) {
    const chunks: Uint8Array[] = [];
    const reader = input.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    return new Blob(chunks);
  }

  if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
    const arrayBuffer = copyToArrayBuffer(input);
    return new Blob([arrayBuffer]);
  }

  throw new TypeError('Unsupported input type for toBlob');
}
