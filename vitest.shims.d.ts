/// <reference types="@vitest/browser/providers/playwright" />

declare module '*.png?url' {
    const url: string
    export default url
}
