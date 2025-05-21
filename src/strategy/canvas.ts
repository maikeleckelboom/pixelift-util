import type { Decoder } from "@/core/types";
import { toBlob } from "@/utils/toBlob";

export const canvasDecoder: Decoder = {
    name: "canvas",

    async decode(input): Promise<DecodedImage> {
        const blob = await toBlob(input);
        const bitmap = await createImageBitmap(blob);
        const { width, height } = bitmap;

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.drawImage(bitmap, 0, 0);

        const { data } = ctx.getImageData(0, 0, width, height);
        return { data, width, height, type: blob.type };
    },

    isSupported: () => true
};
