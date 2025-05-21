// import type {DecoderInput} from "@/core/types.ts";
// import {fileTypeFromBlob, fileTypeFromBuffer, fileTypeFromFile, fileTypeFromStream} from "file-type";

// export async function detectFileType(input: string | URL | DecoderInput): Promise<string | undefined> {
// if (typeof browser !== 'undefined' && typeof input === "string" || input instanceof URL) {
//     return fileTypeFromFile(input);
// }
//
// if (input instanceof Blob) {
//     return fileTypeFromBlob(input)
// }
//
// if (input instanceof ArrayBuffer) {
//     return fileTypeFromBuffer(input)
// }
//
// if (input instanceof ReadableStream) {
//     return fileTypeFromStream(input);
// }
// }
