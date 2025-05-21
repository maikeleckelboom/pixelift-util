import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'happy-dom',
        browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            name: 'chromium',
            isolate: false, // Disable isolation to help with module resolution
            instances: [
                {
                    browser: 'chromium',
                }
            ],
        },
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
