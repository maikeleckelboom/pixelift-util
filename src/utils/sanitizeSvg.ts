// No-deps, worker-safe SVG sanitizer
export function sanitizeSvg(input: string): string {
    return input
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/on\w+="[^"]*"/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/data:text\/html/gi, "data:image/svg+xml");
}
