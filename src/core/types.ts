export interface DecodedImage {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    type: string;
}

export interface DecodeOptions {
    type?: string;
    strategy?: string;
    preferWorker?: boolean;
    signal?: AbortSignal;
    [key: string]: unknown;
}

export interface Decoder {
    readonly name: string;
    decode(input: Blob | ReadableStream, options?: DecodeOptions): Promise<DecodedImage>;
    isSupported?(mime: string): boolean;
}
