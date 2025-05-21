// src/strategy/stream-webcodecs.ts
import { registerDecoder } from "@/core/registry";
import { streamToBlob } from "@/utils/streamToBlob";
import { webCodecsDecoder } from "./webcodecs";
import type { DecodeOptions, DecodedImage, Decoder } from "@/core/types";

export const streamWebCodecsDecoder: Decoder = {
    name: "stream-webcodecs",
    async decode(input, options: DecodeOptions = {}): Promise<DecodedImage> {
        // 1. Convert stream → Blob
        const blob = await streamToBlob(
            input as ReadableStream<Uint8Array>,
            { signal: options.signal, type: options.type }
        );

        // 2. Delegate to your WebCodecs decoder directly
        return webCodecsDecoder.decode(blob, options);
    },
    isSupported: (mime?: string) =>
        // only advertise support if WebCodecs itself supports the type
        webCodecsDecoder.isSupported?.(mime ?? "") ?? false,
};

// Register it
registerDecoder(streamWebCodecsDecoder);
