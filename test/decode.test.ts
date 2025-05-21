import {decodeWith} from "@/core/decode.ts";
import {canvasDecoder} from "@/strategy/canvas.ts";
import {registerDecoder} from "@/core/registry.ts";
import fixture from './fixtures/assets/test.png?url';
import type {DecodedImage} from "@/core/types.ts";

beforeAll(() => {
    registerDecoder(canvasDecoder);
});

test("decodes PNG stream", async () => {
    const response = await fetch(fixture);
    const stream = response.body;
    const result: DecodedImage = await decodeWith("canvas", stream)
    expect(result.width).toBeGreaterThan(0);
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
});
