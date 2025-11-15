import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    open: '/',
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, '../../thebridge')
      ]
    }
  },
  resolve: {
    alias: {
      '@thebridge': path.resolve(__dirname, '../../thebridge')
    }
  }
});
