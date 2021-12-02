import legacy from "@vitejs/plugin-legacy";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginCommonjs } from 'vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig((env) => ({
  base: './',
  envDir: './',
  plugins: [legacy(), reactRefresh(), vitePluginCommonjs()],
  esbuild: {
    jsxInject: `import React from 'react'`, // automatically import React in jsx files
  },
  resolve: {
    alias: {
      'high-order-function': path.join(__dirname, 'dist'),
    },
  },
  build: {
    outDir: path.join(__dirname, 'docs'),
    sourcemap: env.mode === 'development' ? true : false,
  }
}));
