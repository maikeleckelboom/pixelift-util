import { decodeWithStrategy } from '@/core/decode';
import { registerDecoder } from '@/core/registry';
import fixture from './fixtures/data/pixelift.bmp?url';
import { StreamCanvasDecoder } from '@/strategy/stream-canvas';
import { CanvasDecoder } from '@/strategy/canvas';

let blob: Blob | null;
let stream: ReadableStream<Uint8Array<ArrayBufferLike>> | null;
let buffer: ArrayBuffer | null;

beforeAll(async () => {
  registerDecoder(new CanvasDecoder());
  registerDecoder(new StreamCanvasDecoder());

  blob = await fetch(fixture).then((res) => res.blob());
  stream = await fetch(fixture).then((res) => res.body);
  buffer = await fetch(fixture).then((res) => res.arrayBuffer());
});

it('decodes PNG blob', async () => {
  const pixelData = await decodeWithStrategy('canvas', blob);
  expect(pixelData.width).toBeGreaterThan(0);
  expect(pixelData.data).toBeInstanceOf(Uint8ClampedArray);
});

it('decodes PNG stream', async () => {
  const pixelData = await decodeWithStrategy('canvas', stream);
  expect(pixelData.width).toBeGreaterThan(0);
  expect(pixelData.data).toBeInstanceOf(Uint8ClampedArray);
});

it('decodes PNG array buffer', async () => {
  const pixelData = await decodeWithStrategy('canvas', buffer);
  expect(pixelData.width).toBeGreaterThan(0);
  expect(pixelData.data).toBeInstanceOf(Uint8ClampedArray);
});
