import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Packages that MUST NOT be bundled (Native modules, binary drivers, or huge libs)
const externalNodeModules = [
  "pg", // Native bindings
  "sharp", // If you ever use it for images
  "canvas", // Native bindings
  "@resvg/resvg-js",
];

async function buildAll() {
  console.log("🚀 Starting production build...");

  // 1. Clean previous builds
  await rm("dist", { recursive: true, force: true });

  // 2. Build Client (Vite)
  // This will respect your vite.config.ts and output to dist/public
  console.log("📦 Building frontend...");
  await viteBuild();

  // 3. Build Server (ESBuild)
  console.log("backend Building server...");

  const pkg = JSON.parse(await readFile("package.json", "utf-8"));

  // Logic Fix: Usually, you want to bundle almost everything for a "Standalone" file,
  // EXCEPT for native drivers or things that expect a specific node_modules structure.

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    target: "node20", // Target the version you are actually using
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    sourcemap: true, // Highly recommended for debugging production logs
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    // We only externalize things that physically cannot be bundled
    external: externalNodeModules,
    logLevel: "info",
    mainFields: ["module", "main"],
  });

  console.log("\n✅ Build Completed successfully!");
}

buildAll().catch((err) => {
  console.error("❌ Build Failed:", err);
  process.exit(1);
});
