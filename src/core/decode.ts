import { getAllDecoders, getDecoder } from "./registry";
import { DecodeOptions, DecodedImage } from "./types";

export async function decodeWith(
    strategyName: string,
    input: Blob | ReadableStream,
    options?: DecodeOptions
): Promise<DecodedImage> {
    const strategy = getDecoder(strategyName);
    if (!strategy) throw new Error(`Decoder strategy "${strategyName}" not found`);
    return strategy.decode(input, options);
}

export async function autoDecode(
    input: Blob | ReadableStream,
    options: DecodeOptions = {}
): Promise<DecodedImage> {
    const blob = input instanceof Blob ? input : await new Response(input).blob();
    const decoders = getAllDecoders();

    for (const decoder of decoders) {
        if (decoder.isSupported?.(blob.type)) {
            return decoder.decode(blob, options);
        }
    }

    throw new Error(`No decoder found for MIME type: ${blob.type}`);
}
