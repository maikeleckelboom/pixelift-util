export interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface DecodeOptions {
  type?: string;
  strategy?: string;
  signal?: AbortSignal;
  frameIndex?: number;

  [key: string]: unknown;
}

export interface FrameConversionOptions {
  format?: VideoPixelFormat;
  colorSpace?: PredefinedColorSpace;
}

export interface DecodeAnimationOptions extends DecodeOptions, FrameConversionOptions {
  decodeAllFrames?: boolean;
  completeFramesOnly?: boolean;
}

export type DecoderInput =
  | BufferSource
  | Blob
  | ReadableStream<Uint8Array>
  | null;

export interface Decoder {
  readonly name: string;
  decode(input: DecoderInput, options?: DecodeOptions): Promise<PixelData | PixelData[]>;
  decodeAnimation?(input: DecoderInput, options?: DecodeAnimationOptions): AsyncGenerator<PixelData, void, void>;
  isSupported?(type?: string): boolean | Promise<boolean>;
}

export type DecoderConstructor = new () => Decoder;

/**
 * Abstract base class for decoders to extend
 */
export abstract class BaseDecoder implements Decoder {
  abstract readonly name: string;
  
  abstract decode(input: DecoderInput, options?: DecodeOptions): Promise<PixelData | PixelData[]>;
  
  isSupported(type?: string): boolean | Promise<boolean> {
    return true;
  }
}
