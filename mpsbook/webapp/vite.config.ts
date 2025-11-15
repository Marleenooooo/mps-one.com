import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [path.resolve(__dirname, '../../thebridge')]
    }
  },
  resolve: {
    alias: {
      '@thebridge': path.resolve(__dirname, '../../thebridge')
    }
  }
});
