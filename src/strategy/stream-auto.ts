// src/strategy/stream-auto.ts
import { registerDecoder } from "@/core/registry";
import { streamToBlob } from "@/utils/streamToBlob";
import { decodeWith, autoDecode } from "@/core/decode";
import type { DecodeOptions, DecodedImage, Decoder } from "@/core/types";

export const streamAutoDecoder: Decoder = {
    name: "stream-auto",
    async decode(input, options: DecodeOptions = {}): Promise<DecodedImage> {
        // 1. Convert the incoming ReadableStream into a Blob
        const blob = await streamToBlob(
            input as ReadableStream<Uint8Array>,
            { signal: options.signal, type: options.type }
        );

        // 2. Delegate to your existing auto–decode logic
        return autoDecode(blob, options);
    },
    isSupported: () => true,
};

// Register it
registerDecoder(streamAutoDecoder);
