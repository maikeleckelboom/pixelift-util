export async function toBlob(
    input: Blob | ArrayBuffer | Uint8Array | ReadableStream
): Promise<Blob> {
    if (input instanceof Blob) return input;

    if (input instanceof ReadableStream) {
        const chunks: Uint8Array[] = [];
        const reader = input.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
        }

        return new Blob(chunks);
    }

    return new Blob([input]);
}
