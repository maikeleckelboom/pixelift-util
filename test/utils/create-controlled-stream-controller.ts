import { createSeededRNG } from './helpers';

export function createControlledStreamController(
  data: Uint8Array,
  options: {
    randomizeChunks?: boolean;
    maxChunkSize?: number;
    delayMs?: number;
    seed?: number;
  } = {},
) {
  const {
    randomizeChunks = true,
    maxChunkSize = 5,
    delayMs = 0,
    seed = Date.now(),
  } = options;

  const rng = createSeededRNG(seed);
  const chunks: Uint8Array[] = [];
  let offset = 0;

  while (offset < data.length) {
    const size = randomizeChunks
      ? Math.max(1, Math.floor(rng() * maxChunkSize))
      : maxChunkSize;
    const chunk = data.subarray(offset, offset + size);
    chunks.push(chunk);
    offset += size;
  }

  let streamController!: ReadableStreamDefaultController<Uint8Array>;
  let wasClosed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      streamController = ctrl;
    },
  });

  async function pushNext(): Promise<boolean> {
    if (chunks.length === 0) {
      if (!wasClosed) {
        streamController.close();
        wasClosed = true;
      }
      return false;
    }
    if (delayMs) await delay(delayMs);
    const next = chunks.shift()!;
    streamController.enqueue(next);
    return true;
  }

  function isDone() {
    return chunks.length === 0;
  }

  function close() {
    if (!wasClosed) {
      streamController.close();
      wasClosed = true;
    }
  }

  return {
    stream,
    pushNext,
    close,
    isDone,
    totalSize: data.length,
    remainingChunks: () => chunks.length,
    wasClosed: () => wasClosed,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
