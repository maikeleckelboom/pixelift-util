declare module 'vitest' {
  interface Assertion<T = any> {
    toStrictlyIncrease(): void;
  }

  interface AsymmetricMatchersContaining {
    toStrictlyIncrease(): void;
  }
}

declare module '*.snap' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.png?url' {
  const url: string;
  export default url;
}

declare module '*.jpg?url' {
  const url: string;
  export default url;
}

declare module '*.jpeg?url' {
  const url: string;
  export default url;
}

declare module '*.webp?url' {
  const url: string;
  export default url;
}

declare module '*.avif?url' {
  const url: string;
  export default url;
}

declare module '*.gif?url' {
  const url: string;
  export default url;
}

declare module '*.bmp?url' {
  const url: string;
  export default url;
}

declare module '*.mp4?url' {
  const url: string;
  export default url;
}
