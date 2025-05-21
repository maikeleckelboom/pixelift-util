import { decodeWith } from "@/core/decode";
import { canvasDecoder } from "@/strategy/canvas";
import { registerDecoder } from "@/core/registry";

beforeAll(() => {
    registerDecoder(canvasDecoder);
});

test("decodes PNG stream", async () => {
    const res = await fetch("/fixtures/test.png");
    const stream = res.body!;
    const result = await decodeWith("canvas", stream);
    expect(result.width).toBeGreaterThan(0);
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
});
