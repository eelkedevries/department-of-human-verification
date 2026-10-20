import { cpSync, createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const BASE = '/department-of-human-verification/';
const WEBGAZER = 'node_modules/webgazer';
// Published path → source path. WebGazer's prebuilt file stays unmodified and
// separate from the game's bundle, with its licence beside it.
const WEBGAZER_FILES: [string, string][] = [
  ['webgazer.js', `${WEBGAZER}/dist/webgazer.js`],
  ['LICENSE.md', `${WEBGAZER}/LICENSE.md`],
  ['face_mesh', `${WEBGAZER}/dist/mediapipe/face_mesh`],
];

/**
 * Serves and publishes WebGazer and its face-mesh model files (WebAssembly and
 * weights) from this site, so the eye-tracking build makes no third-party
 * requests. Only active in builds made with VITE_EYE_TRACKING=1.
 */
function webGazerAssets(): Plugin {
  return {
    name: 'dhv:webgazer-assets',
    configureServer(server) {
      server.middlewares.use(`${BASE}eyetracking/webgazer/`, (req, res, next) => {
        const path = (req.url ?? '').split('?')[0].replace(/^\//, '');
        const entry = WEBGAZER_FILES.find(([published]) => path === published || path.startsWith(`${published}/`));
        if (!entry) return next();
        const file = join(entry[1], path.slice(entry[0].length));
        if (!existsSync(file)) return next();
        if (file.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
        if (file.endsWith('.js')) res.setHeader('Content-Type', 'text/javascript');
        createReadStream(file).pipe(res);
      });
    },
    writeBundle(options) {
      for (const [published, source] of WEBGAZER_FILES) {
        cpSync(source, join(options.dir ?? 'dist', 'eyetracking', 'webgazer', published), {
          recursive: true,
          filter: (src) => !src.endsWith('.d.ts') && !src.endsWith('README.md'),
        });
      }
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: process.env.VITE_EYE_TRACKING === '1' ? [webGazerAssets()] : [],
  build: {
    sourcemap: false,
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
