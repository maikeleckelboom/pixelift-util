import { registerDecoder } from '@/core/registry';
import { decodeWithStrategy } from '@/core/decode';
import { streamWebCodecsDecoder } from '@/strategy/stream-webcodecs';
import fixture from './fixtures/data/pixelift.png?url';
import { WebCodecsDecoder } from '@/strategy/webcodecs';

let blob: Blob | null;
let stream: ReadableStream<Uint8Array<ArrayBufferLike>> | null;
let buffer: ArrayBuffer | null;

beforeAll(async () => {
  registerDecoder(new WebCodecsDecoder());
  registerDecoder(streamWebCodecsDecoder);

  blob = await fetch(fixture).then((res) => res.blob());
  stream = await fetch(fixture).then((res) => res.body);
  buffer = await fetch(fixture).then((res) => res.arrayBuffer());
});

it('webCodecs decodes a PNG blob', async () => {
  const result = await decodeWithStrategy('webcodecs', blob);

  expect(result.width).toBeGreaterThan(0);
  expect(result.data).toBeInstanceOf(Uint8ClampedArray);
});

it('webCodecs decodes a PNG stream', async () => {
  const result = await decodeWithStrategy('webcodecs', stream, {
    type: 'image/png',
  });
  expect(result.width).toBeGreaterThan(0);
  expect(result.data).toBeInstanceOf(Uint8ClampedArray);
});

it('webCodecs decodes a PNG array buffer', async () => {
  const result = await decodeWithStrategy('webcodecs', buffer, {
    type: 'image/png',
  });
  expect(result.width).toBeGreaterThan(0);
  expect(result.data).toBeInstanceOf(Uint8ClampedArray);
}, 0);
