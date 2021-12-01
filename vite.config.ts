import legacy from "@vitejs/plugin-legacy";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginCommonjs } from 'vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  envDir: './',
  plugins: [legacy(), reactRefresh(), vitePluginCommonjs()],
  esbuild: {
    jsxInject: `import React from 'react'`, // automatically import React in jsx files
  },
  build: {
    outDir: path.join(__dirname, 'docs'),
    sourcemap: 'hidden',
  }
});
