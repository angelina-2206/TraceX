import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, cpSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest-and-assets',
      closeBundle() {
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }
        if (existsSync('manifest.json')) {
          copyFileSync('manifest.json', 'dist/manifest.json');
        }
        if (existsSync('icons')) {
          cpSync('icons', 'dist/icons', { recursive: true });
        }
        if (existsSync('src/content/content.css')) {
          copyFileSync('src/content/content.css', 'dist/content.css');
          copyFileSync('src/content/content.css', 'content.css');
        }
        if (existsSync('dist/content-gmail.js')) {
          copyFileSync('dist/content-gmail.js', 'content-gmail.js');
        }
        if (existsSync('dist/content-outlook.js')) {
          copyFileSync('dist/content-outlook.js', 'content-outlook.js');
        }
        if (existsSync('dist/service-worker.js')) {
          copyFileSync('dist/service-worker.js', 'service-worker.js');
        }
        if (existsSync('dist/src/popup/index.html')) {
          copyFileSync('dist/src/popup/index.html', 'dist/popup.html');
          copyFileSync('dist/src/popup/index.html', 'popup.html');
        }
        if (existsSync('dist/src/sidepanel/index.html')) {
          copyFileSync('dist/src/sidepanel/index.html', 'dist/sidepanel.html');
          copyFileSync('dist/src/sidepanel/index.html', 'sidepanel.html');
        }
        if (existsSync('dist/assets')) {
          cpSync('dist/assets', 'assets', { recursive: true });
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content-gmail': resolve(__dirname, 'src/content/gmail.ts'),
        'content-outlook': resolve(__dirname, 'src/content/outlook.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js';
          }
          if (chunkInfo.name === 'content-gmail') {
            return 'content-gmail.js';
          }
          if (chunkInfo.name === 'content-outlook') {
            return 'content-outlook.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
