import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue"; // Import the plugin here

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  plugins: [vue()], // Include it in your array of plugins here
});