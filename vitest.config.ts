import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'happy-dom',
        browser: {
            provider: "playwright",
            enabled: true,
            headless: true,
            screenshotFailures: false,
            isolate: false,
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
});
