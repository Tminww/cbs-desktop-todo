import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    input: resolve("src/preload/index.ts"), // или index.js, в зависимости от твоего файла
    outputDir: resolve("out/preload"),
    build: {
      rollupOptions: {
        output: {
          format: "cjs", // 🔧 ключевой момент
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: resolve("src/renderer"),
    build: {
      outDir: resolve("out/renderer"),
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [vue()],
  },
});
