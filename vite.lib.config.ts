import { defineConfig } from 'vite';
import path, { join } from 'path';
import fs from 'fs';
import dts from 'vite-plugin-dts'

const json = JSON.parse(fs.readFileSync('./package.json').toString());
const dependencies = Object.keys(json.dependencies)
const root = __dirname;
export default defineConfig((env) => {
  return {
    base: './',
    envDir: './',
    plugins: [
      dts({ insertTypesEntry: true }),
    ],
    resolve: {
      alias: {
        '@src': join(root, 'src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: join(root, 'dist'),
      assetsInlineLimit: 1024 * 20,
      emptyOutDir: true,
      minify: false,
      // assetsDir: '',
      sourcemap: env.mode === 'development' ? true : false,
      lib: {
        entry: path.resolve(__dirname, './src/parser/index.ts'),
        name: 'HighOrderFunction',
        fileName: () => 'index.js',
        formats: ['es']
      },
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: dependencies,
      }
    }
  }
});
