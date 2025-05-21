import { registerDecoder } from '@/core/registry';
import { canvasDecoder } from '@/strategy/canvas';
import { webCodecsDecoder } from '@/strategy/webcodecs';
import { svgDecoder } from '@/strategy/svg';
import { streamAutoDecoder } from '@/strategy/stream-auto';
import { streamWebCodecsDecoder } from '@/strategy/stream-webcodecs';
import { streamCanvas } from '@/strategy/stream-canvas';

registerDecoder(canvasDecoder);
registerDecoder(webCodecsDecoder);
registerDecoder(svgDecoder);

registerDecoder(streamAutoDecoder);
registerDecoder(streamWebCodecsDecoder);
registerDecoder(streamCanvas);

export * from '@/core/decode';
export * from '@/core/types';
