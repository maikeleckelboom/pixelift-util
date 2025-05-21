export function copyToArrayBuffer(input: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (input instanceof ArrayBuffer) return input;
  if (ArrayBuffer.isView(input)) {
    const buffer = new ArrayBuffer(input.byteLength);
    new Uint8Array(buffer).set(
      new Uint8Array(input.buffer, input.byteOffset, input.byteLength),
    );
    return buffer;
  }

  throw new TypeError('Invalid buffer input');
}
