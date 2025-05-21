import { decodeWithStrategy } from '@/core/decode';
import { canvasDecoder } from '@/strategy/canvas';
import { registerDecoder } from '@/core/registry';
import { streamCanvas } from '@/strategy/stream-canvas';
import fixture from './fixtures/data/pixelift.bmp?url';

beforeAll(() => {
  registerDecoder(canvasDecoder);
  registerDecoder(streamCanvas);
});

it('decodes PNG blob', async () => {
  const pixelData = await decodeWithStrategy(
    'canvas',
    await fetch(fixture).then((res) => res.blob()),
  );
  expect(pixelData.width).toBeGreaterThan(0);
  expect(pixelData.data).toBeInstanceOf(Uint8ClampedArray);
});

it('decodes PNG stream', async () => {
  const pixelData = await decodeWithStrategy(
    'stream-canvas',
    await fetch(fixture).then((res) => res.body),
  );
  expect(pixelData.width).toBeGreaterThan(0);
  expect(pixelData.data).toBeInstanceOf(Uint8ClampedArray);
});

it('decodes PNG array buffer', async () => {
  const pixelData = await decodeWithStrategy(
    'canvas',
    await fetch(fixture).then((res) => res.arrayBuffer()),
  );
  expect(pixelData.width).toBeGreaterThan(0);
  expect(pixelData.data).toBeInstanceOf(Uint8ClampedArray);
});
