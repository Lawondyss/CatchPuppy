import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    // index.html out file will start with a relative path for script
    base: './',
    plugins: [
        basicSsl('local-puppy'),
    ],
    server: {
        port: 3001,
    },
    build: {
        // disable this for low bundle sizes
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    kaplay: ['kaplay'],
                },
            },
        },
    },
})
