import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
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
