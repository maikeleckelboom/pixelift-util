import { registerDecoder } from '@/core/registry';
import { canvasDecoder } from '@/strategy/canvas';
import { svgDecoder } from '@/strategy/svg';
import { streamAutoDecoder } from '@/strategy/stream-auto';
import { streamWebCodecsDecoder } from '@/strategy/stream-webcodecs';
import { streamCanvas } from '@/strategy/stream-canvas';
import { WebCodecsDecoder } from '@/strategy/webcodecs';

registerDecoder(new WebCodecsDecoder());
registerDecoder(canvasDecoder);
registerDecoder(svgDecoder);

registerDecoder(streamAutoDecoder);
registerDecoder(streamWebCodecsDecoder);
registerDecoder(streamCanvas);

export * from '@/core/decode';
export * from '@/core/types';
