import type { Decoder, PixelData } from '@/core/types';
import { createError } from '@/shared/error';
import { toBlob } from '@/utils/to-blob';

export function createOffscreenDrawingSurface(
  width: number,
  height: number,
): [OffscreenCanvas, OffscreenCanvasRenderingContext2D] {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw createError.runtimeError('Failed to create canvas context');
  return [canvas, ctx];
}

export const canvasDecoder: Decoder = {
  name: 'canvas',

  async decode(input): Promise<PixelData> {
    const blob = await toBlob(input);
    const bitmap = await createImageBitmap(blob);
    const { width, height } = bitmap;

    const [, ctx] = createOffscreenDrawingSurface(width, height);

    ctx.drawImage(bitmap, 0, 0);
    const { data } = ctx.getImageData(0, 0, width, height);

    return { data, width, height };
  },

  isSupported: () => {
    return typeof OffscreenCanvas !== 'undefined' && !!createImageBitmap;
  },
};
