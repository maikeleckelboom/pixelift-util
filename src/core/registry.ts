import type {Decoder} from "./types.ts";

const registry = new Map<string, Decoder>();

export function registerDecoder(decoder: Decoder): void {
    registry.set(decoder.name, decoder);
}

export function getDecoder(name?: string): Decoder | undefined {
    return name ? registry.get(name) : undefined;
}

export function getAllDecoders(): Decoder[] {
    return [...registry.values()];
}
