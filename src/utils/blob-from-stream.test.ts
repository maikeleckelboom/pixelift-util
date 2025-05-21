import { blobFromStream } from '@/utils/blob-from-stream';
import { createControlledStreamController } from '../../test/utils/create-controlled-stream-controller';
import { createError } from '@/shared/error';

describe('blobFromStream', () => {
  it('converts a stream to a blob with correct contents', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const { stream, pushNext } = createControlledStreamController(data, {
      randomizeChunks: false,
    });

    while (await pushNext()) {}

    const blob = await blobFromStream(stream);
    expect(blob.size).toBe(data.byteLength);
    const buffer = await blob.arrayBuffer();
    expect(new Uint8Array(buffer)).toEqual(data);
  });

  it('respects chunkSize and flushes partial chunks', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
    const { stream, pushNext } = createControlledStreamController(data, {
      maxChunkSize: 3,
      randomizeChunks: false,
    });

    while (await pushNext()) {}

    const blob = await blobFromStream(stream, { chunkSize: 4 });
    const buffer = await blob.arrayBuffer();
    expect(new Uint8Array(buffer)).toEqual(data);
  });

  it('aborts mid-stream and throws correctly', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const controller = new AbortController();
    const { stream } = createControlledStreamController(data, {
      delayMs: 10,
      maxChunkSize: 2,
    });

    setTimeout(() => controller.abort(), 15);

    await expect(
      blobFromStream(stream, { signal: controller.signal }),
    ).rejects.toThrow('aborted');
  });

  it('throws if maxBytes is exceeded', async () => {
    const data = new Uint8Array([1, 2, 3, 4]);
    const { stream, pushNext } = createControlledStreamController(data, {
      randomizeChunks: false,
    });

    while (await pushNext()) {}

    await expect(blobFromStream(stream, { maxBytes: 3 })).rejects.toThrow(
      createError.maxBytesExceeded(3, 4).message,
    );
  });

  it('invokes progress callback correctly', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const { stream, pushNext } = createControlledStreamController(data, {
      maxChunkSize: 2,
    });
    const progress: number[] = [];

    const progressCallback = (bytesProcessed: number) => {
      progress.push(bytesProcessed);
    };

    while (await pushNext()) {}

    const blob = await blobFromStream(stream, {
      onProgress: progressCallback,
    });
    expect(new Uint8Array(await blob.arrayBuffer())).toEqual(data);
    expect(progress.length).toBeGreaterThan(0);
    expect(progress[progress.length - 1]).toBe(data.length);
  });

  it('throws if stream is locked', async () => {
    const data = new Uint8Array([1]);
    const { stream } = createControlledStreamController(data, {
      randomizeChunks: false,
    });
    stream.getReader();

    await expect(blobFromStream(stream)).rejects.toThrow(
      'ReadableStream is already locked',
    );
  });

  it('throws for invalid chunkSize and maxBytes', async () => {
    const data = new Uint8Array([1]);
    const { stream, pushNext } = createControlledStreamController(data, {
      randomizeChunks: false,
    });

    while (await pushNext()) {}

    await expect(blobFromStream(stream, { chunkSize: 0 })).rejects.toThrow(
      'chunkSize must be a positive integer',
    );
    await expect(blobFromStream(stream, { maxBytes: 0 })).rejects.toThrow(
      'maxBytes must be a positive integer',
    );
  });
});
