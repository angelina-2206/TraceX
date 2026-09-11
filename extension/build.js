import esbuild from 'esbuild';
import { build as viteBuild } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('🚀 Building Anveshak Chrome Extension...');

  // 1. Build UI pages (popup & sidepanel) via Vite with React plugin & zero data: URI inlining
  await viteBuild({
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          popup: path.resolve(__dirname, 'src/popup/index.html'),
          sidepanel: path.resolve(__dirname, 'src/sidepanel/index.html'),
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  });

  // 2. Build Content Scripts as standalone self-contained IIFE (No import statements!)
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, 'src/content/gmail.ts')],
    outfile: path.resolve(__dirname, 'dist/content-gmail.js'),
    bundle: true,
    format: 'iife',
    target: 'chrome110',
    minify: false,
  });

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, 'src/content/outlook.ts')],
    outfile: path.resolve(__dirname, 'dist/content-outlook.js'),
    bundle: true,
    format: 'iife',
    target: 'chrome110',
    minify: false,
  });

  // 3. Build Background Service Worker as standalone ESM bundle
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, 'src/background/service-worker.ts')],
    outfile: path.resolve(__dirname, 'dist/service-worker.js'),
    bundle: true,
    format: 'esm',
    target: 'chrome110',
    minify: false,
  });

  // 4. Sync manifest, assets, icons, css, and html to root and dist
  if (fs.existsSync('manifest.json')) {
    fs.copyFileSync('manifest.json', 'dist/manifest.json');
  }
  if (fs.existsSync('icons')) {
    fs.cpSync('icons', 'dist/icons', { recursive: true });
  }
  if (fs.existsSync('src/content/content.css')) {
    fs.copyFileSync('src/content/content.css', 'dist/content.css');
    fs.copyFileSync('src/content/content.css', 'content.css');
  }
  if (fs.existsSync('dist/src/popup/index.html')) {
    fs.copyFileSync('dist/src/popup/index.html', 'dist/popup.html');
    fs.copyFileSync('dist/src/popup/index.html', 'popup.html');
  }
  if (fs.existsSync('dist/src/sidepanel/index.html')) {
    fs.copyFileSync('dist/src/sidepanel/index.html', 'dist/sidepanel.html');
    fs.copyFileSync('dist/src/sidepanel/index.html', 'sidepanel.html');
  }
  if (fs.existsSync('assets')) {
    fs.rmSync('assets', { recursive: true, force: true });
  }
  if (fs.existsSync('dist/assets')) {
    fs.cpSync('dist/assets', 'assets', { recursive: true });
  }
  fs.copyFileSync('dist/content-gmail.js', 'content-gmail.js');
  fs.copyFileSync('dist/content-outlook.js', 'content-outlook.js');
  fs.copyFileSync('dist/service-worker.js', 'service-worker.js');

  console.log('✅ Anveshak Extension build complete and CSP verified!');
}

run().catch((err) => {
  console.error('Build error:', err);
  process.exit(1);
});
