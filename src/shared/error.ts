export const ErrorCode = {
  decoderUnsupported: 'decoder-unsupported',
  decodingFailed: 'decoding-failed',
  invalidInput: 'invalid-input',
  invalidOption: 'invalid-option',
  dependencyMissing: 'dependency-missing',
  fetchFailed: 'fetch-failed',
  networkError: 'network-error',
  pathTraversal: 'path-traversal',
  fileReadError: 'file-read-error',
  runtimeError: 'runtime-error',
  aborted: 'aborted',
  maxBytesExceeded: 'max-bytes-exceeded',
  notFound: 'not-found',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

const MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.decoderUnsupported]: 'Decoder not supported: {decoder}',
  [ErrorCode.decodingFailed]: 'Failed to decode {type}: {detail}',
  [ErrorCode.invalidInput]:
    'Invalid input: expected {expected}, got {received}',
  [ErrorCode.dependencyMissing]: 'Required dependency missing: {dependency}',
  [ErrorCode.fetchFailed]: 'Failed to fetch from {url}: {status} {statusText}',
  [ErrorCode.networkError]: 'Network error: {detail}',
  [ErrorCode.pathTraversal]: 'Path traversal attempt detected: {path}',
  [ErrorCode.aborted]: 'Operation aborted cause: {reason}',
  [ErrorCode.runtimeError]: 'Runtime error: {detail}',
  [ErrorCode.fileReadError]: 'Failed to read file: {path}',
  [ErrorCode.invalidOption]: '{detail}',
  [ErrorCode.maxBytesExceeded]:
    'Stream size limit exceeded: attempting to process {bytesProcessed} bytes, limit is {maxBytes} bytes.',
  [ErrorCode.notFound]:
    'The requested item was not found: {message} (in {fnName}).',
};

function formatMessage(
  template: string,
  context: Record<string, unknown> = {},
): string {
  return template.replace(/\{(\w+)}/g, (_, key) =>
    key in context ? String(context[key]) : `{${key}}`,
  );
}

export class PixeliftError extends Error {
  public readonly code: ErrorCode;
  public readonly context: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    context: Record<string, unknown> = {},
    options?: ErrorOptions,
  ) {
    const message = formatMessage(MESSAGES[code], context);
    super(message, options);
    this.name = 'PixeliftError';
    this.code = code;
    this.context = context;
  }

  public toString(): string {
    return `${this.name} (${this.code}): ${this.message}`;
  }
}

export const createError = {
  create: (
    code: ErrorCode,
    message: string,
    options?: ErrorOptions,
  ): PixeliftError => {
    // Return PixeliftError
    return new PixeliftError(code, { message }, options);
  },

  decoderUnsupported: (decoder: string): PixeliftError =>
    new PixeliftError(ErrorCode.decoderUnsupported, { decoder }),

  decodingFailed: (
    type: string,
    detail?: string,
    cause?: unknown,
  ): PixeliftError =>
    new PixeliftError(ErrorCode.decodingFailed, { type, detail }, { cause }),

  dependencyMissing: (
    dependency: string,
    detail?: string,
    cause?: unknown,
  ): PixeliftError =>
    new PixeliftError(
      ErrorCode.dependencyMissing,
      { dependency, detail },
      { cause },
    ),

  fetchFailed: (
    url: string,
    status: number,
    statusText: string,
  ): PixeliftError =>
    new PixeliftError(ErrorCode.fetchFailed, { url, status, statusText }),

  invalidInput: (expected: string, received: unknown): PixeliftError =>
    new PixeliftError(ErrorCode.invalidInput, {
      expected,
      received:
        typeof received === 'string'
          ? received
          : received?.constructor?.name || typeof received,
    }),

  networkError: (detail: string, cause?: unknown): PixeliftError =>
    new PixeliftError(ErrorCode.networkError, { detail }, { cause }),

  pathTraversal: (path: string): PixeliftError =>
    new PixeliftError(ErrorCode.pathTraversal, { path }),

  fileReadError: (path: string, cause?: unknown): PixeliftError =>
    new PixeliftError(ErrorCode.fileReadError, { path }, { cause }),

  aborted: (
    reason: string = 'Operation aborted',
    cause?: unknown,
  ): PixeliftError =>
    new PixeliftError(ErrorCode.aborted, { reason }, { cause }),

  runtimeError: (detail: string, cause?: unknown): PixeliftError =>
    new PixeliftError(ErrorCode.runtimeError, { detail }, { cause }),

  rethrow: (error: unknown, detail?: string): PixeliftError => {
    if (error instanceof PixeliftError) {
      return error;
    }

    if (error instanceof Error) {
      return new PixeliftError(
        ErrorCode.runtimeError,
        { detail: error.message },
        { cause: error },
      );
    }

    return new PixeliftError(
      ErrorCode.runtimeError,
      { detail },
      {
        cause: error,
      },
    );
  },
  invalidOption: (detail: string): PixeliftError =>
    new PixeliftError(ErrorCode.invalidOption, { detail }),

  notFound: (message: string, fnName: string): PixeliftError =>
    new PixeliftError(ErrorCode.notFound, { message, fnName }),

  maxBytesExceeded: (
    maxBytes: number,
    bytesProcessed: number = 0,
  ): PixeliftError =>
    new PixeliftError(ErrorCode.maxBytesExceeded, { maxBytes, bytesProcessed }),

  isAbortError(e: unknown) {
    return e instanceof PixeliftError && e.code === ErrorCode.aborted;
  },
} as const;
