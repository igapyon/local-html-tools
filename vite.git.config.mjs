import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, "docs"),
  base: "./",
  server: {
    open: "/git/git-pseudo-squash.html"
  },
  build: {
    outDir: path.resolve(__dirname, "dist/docs"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "git-config-setup": path.resolve(__dirname, "docs/git/git-config-setup.html"),
        "git-config-advanced-setup": path.resolve(__dirname, "docs/git/git-config-advanced-setup.html"),
        "git-branch-diff": path.resolve(__dirname, "docs/git/git-branch-diff.html"),
        "git-pseudo-squash": path.resolve(__dirname, "docs/git/git-pseudo-squash.html")
      }
    }
  }
});
