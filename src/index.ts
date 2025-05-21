import { registerDecoder } from "@/core/registry";
import { canvasDecoder } from "@/strategy/canvas";
import { webCodecsDecoder } from "@/strategy/webcodecs";
import { svgDecoder } from "@/strategy/svg";

registerDecoder(canvasDecoder);
registerDecoder(webCodecsDecoder);
registerDecoder(svgDecoder);

export * from "@/core/decode";
export * from "@/core/types";
