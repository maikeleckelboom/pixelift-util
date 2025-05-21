import { decodeWith } from "@/core/decode.ts";
import { canvasDecoder } from "@/strategy/canvas.ts";
import { registerDecoder } from "@/core/registry.ts";
import { DecodedImage } from "./fixtures/helpers.ts";
import fixture from './fixtures/assets/test.png?url';

beforeAll(() => {
    registerDecoder(canvasDecoder);
});

test("decodes PNG stream", async () => {
    const response = await fetch(fixture);
    const stream = response.body;
    const result = await decodeWith("canvas", stream) as DecodedImage;
    expect(result.width).toBeGreaterThan(0);
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
});
