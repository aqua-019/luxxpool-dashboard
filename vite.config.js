import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const site = process.env.VITE_SITE || 'legacy';

const entries = {
  legacy: resolve(__dirname, 'index.html'),
  public: resolve(__dirname, 'public.html'),
  miner:  resolve(__dirname, 'miner.html'),
};

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    outDir: site === 'legacy' ? 'dist' : `dist/${site}`,
    rollupOptions: {
      input: entries[site] || entries.legacy,
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-three': ['three'],
          'vendor-r3f': ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: { port: 5173, open: true },
});
