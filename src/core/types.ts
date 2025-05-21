export interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface DecodeOptions {
  type?: string;
  strategy?: string;
  signal?: AbortSignal;

  [key: string]: unknown;
}

export type DecoderInput =
  | BufferSource
  | Blob
  | ReadableStream<Uint8Array>
  | null;

export interface Decoder {
  readonly name: string;

  decode(input: DecoderInput, options?: DecodeOptions): Promise<PixelData>;

  isSupported?(type?: string): boolean | Promise<boolean>;
}
