import { webCodecsDecoder } from "@/strategy/webcodecs.ts";
import { registerDecoder } from "@/core/registry.ts";
import { decodeWith } from "@/core/decode.ts";
import type { DecodedImage, DecodeOptions } from "@/core/types.ts";
import fixture from './fixtures/assets/test.png?url';

beforeAll(() => {
    registerDecoder(webCodecsDecoder);
});

test("webCodecs decodes a PNG stream", async () => {
    const res = await fetch(fixture);
    const stream = res.body;
    const result = await decodeWith("webcodecs", stream) as DecodedImage;
    expect(result.width).toBeGreaterThan(0);
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
});
