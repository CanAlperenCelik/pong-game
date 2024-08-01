import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Ensures the entry file is named index.js
        entryFileNames: 'index.js',
        // Names non-entry chunks with a simpler pattern
        chunkFileNames: '[name].js',
        // Names asset files (e.g., CSS, images) with a fixed pattern
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
