import legacy from "@vitejs/plugin-legacy";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginCommonjs } from 'vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [legacy(), reactRefresh(), vitePluginCommonjs()],
  esbuild: {
    jsxInject: `import React from 'react'`, // automatically import React in jsx files
  },
  resolve: {
    alias: [
      {
        // for import like : @/x/y/z
        find: /@\//,
        replacement: `${path.resolve(__dirname, "example")}/`,
      },
      {
        // for import like : ~x/y/z
        find: /~(.*)/,
        replacement: `${path.resolve(__dirname, "node_modules")}/$1`,
      },
    ],
  },
  build: {
    outDir: path.join(__dirname, 'docs'),
  }
});
