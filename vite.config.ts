import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackStart({
      srcDirectory: "src",
      server: { entry: "server" },
    }),
    nitro({ preset: "node-server" }),
    tailwindcss(),
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
