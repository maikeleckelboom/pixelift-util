import type { Decoder } from '@/core/types';
import { sanitizeSvg } from '@/utils/sanitize-svg.ts';

export const svgDecoder: Decoder = {
  name: 'svg',

  async decode(input, options = {}) {
    const blob =
      input instanceof Blob ? input : await new Response(input).blob();
    const text = await blob.text();
    const sanitized = sanitizeSvg(text);

    const safeBlob = new Blob([sanitized], { type: 'image/svg+xml' });
    const bitmap = await createImageBitmap(safeBlob);
    const { width, height } = bitmap;

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);

    const data = ctx.getImageData(0, 0, width, height).data;

    return { width, height, data, type: safeBlob.type };
  },

  isSupported(mime) {
    return mime === 'image/svg+xml';
  },
};
