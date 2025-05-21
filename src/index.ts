import { registerDecoder } from '@/core/registry';
import { CanvasDecoder } from '@/strategy/canvas';
import { SvgDecoder } from '@/strategy/svg';
import { StreamAutoDecoder } from '@/strategy/stream-auto';
import { StreamWebCodecsDecoder } from '@/strategy/stream-webcodecs';
import { StreamCanvasDecoder } from '@/strategy/stream-canvas';
import { WebCodecsDecoder } from '@/strategy/webcodecs';

registerDecoder(new WebCodecsDecoder());
registerDecoder(new CanvasDecoder());
registerDecoder(new SvgDecoder());

registerDecoder(new StreamAutoDecoder());
registerDecoder(new StreamWebCodecsDecoder());
registerDecoder(new StreamCanvasDecoder());

export * from '@/core/decode';
export * from '@/core/types';
