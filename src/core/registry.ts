import type { Decoder } from '@/core/types';

const registry = new Map<string, Decoder>();

export function registerDecoder(decoder: Decoder): void {
  if (!registry.has(decoder.name)) {
    registry.set(decoder.name, decoder);
  }
}

export function getDecoder(name?: string): Decoder | undefined {
  return name ? registry.get(name) : undefined;
}

export function getAllDecoders(): Decoder[] {
  return [...registry.values()];
}
