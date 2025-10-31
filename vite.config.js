import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: './src/main.js',
      output: {
        entryFileNames: 'assets/main.js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    open: true,
    port: 5173
  }
});