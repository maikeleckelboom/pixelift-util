// src/strategy/webcodecs.ts

import type { Decoder, DecodedImage } from "../core/types";

export const webCodecsDecoder: Decoder = {
    name: "webcodecs",

    async decode(input): Promise<DecodedImage> {
        // 1. Normalize input to Blob
        const blob = input instanceof Blob
            ? input
            : await new Response(input).blob();

        // 2. Determine MIME type (fallback to PNG)
        const mime = blob.type || "image/png";

        // 3. Pull raw bytes
        const buffer = await blob.arrayBuffer();
        const decoder = new ImageDecoder({
            data: new Uint8Array(buffer),
            type: mime,
        });

        // 4. Wait for decoder readiness
        await decoder.tracks.ready;

        // 5. If `readable` exists, use the VideoFrame pipeline
        if (decoder.readable?.getReader) {
            const reader = decoder.readable.getReader();
            const { value: frame } = await reader.read();
            reader.releaseLock();

            if (!frame) {
                throw new Error("No frame decoded");
            }

            // Extract true dimensions
            const width  = frame.codedWidth;
            const height = frame.codedHeight;

            // Allocate buffer and copy pixels directly
            const size = frame.allocationSize({ format: "RGBA" });
            const data = new Uint8ClampedArray(size);
            await frame.copyTo(data, { format: "RGBA", colorSpace: "srgb" });

            // Cleanup and return
            frame.close();
            decoder.close();

            return { width, height, data, type: mime };
        }

        // 6. Fallback: decode to ImageBitmap + draw on OffscreenCanvas
        const { image: bitmap } = await decoder.decode();
        const width  = bitmap.width;
        const height = bitmap.height;

        const canvas = new OffscreenCanvas(width, height);
        const ctx    = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("2D context not available");
        }

        ctx.drawImage(bitmap, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);

        decoder.close();
        return {
            width,
            height,
            data: imageData.data,
            type: mime,
        };
    },

    isSupported(mime) {
        return typeof ImageDecoder !== "undefined"
            && ImageDecoder.isTypeSupported?.(mime);
    },
};
