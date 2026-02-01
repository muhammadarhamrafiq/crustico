import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['**/*.integration.test.ts'],
        isolate: true,
        pool: 'forks',
        fileParallelism: false,
        sequence: {
            concurrent: false,
        },
    },
})
