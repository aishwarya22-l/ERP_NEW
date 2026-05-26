import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Stubs all CSS imports during Vitest runs — tests care about behavior, not styling
const cssStub = {
  name: 'css-stub',
  enforce: 'pre',
  resolveId(id) {
    if (process.env.VITEST && id.endsWith('.css')) return '\0virtual:css-stub';
  },
  load(id) {
    if (id === '\0virtual:css-stub') return '';
  },
};

export default defineConfig({
  plugins: [react(), cssStub],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
    css: false,
  },
})
