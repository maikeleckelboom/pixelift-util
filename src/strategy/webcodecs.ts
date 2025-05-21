import type { Decoder, DecodedImage } from "../core/types";

export const webCodecsDecoder: Decoder = {
    name: "webcodecs",

    async decode(input, options = {}): Promise<DecodedImage> {
        const blob = input instanceof Blob ? input : await new Response(input).blob();
        const buffer = await blob.arrayBuffer();

        const decoder = new ImageDecoder({ data: new Uint8Array(buffer), type: blob.type });

        await decoder.tracks.ready;
        const result = await decoder.decode();

        const { codedWidth: width, codedHeight: height } = result;
        const bitmap = result.image;

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0);

        const imageData = ctx.getImageData(0, 0, width, height);
        return {
            width,
            height,
            data: imageData.data,
            type: blob.type
        };
    },

    isSupported(mime) {
        return ImageDecoder.isTypeSupported?.(mime);
    }
};
