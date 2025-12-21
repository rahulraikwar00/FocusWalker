import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";
import path from "path";

// List of packages to keep external (not bundled into the .cjs file)
// These should match your production dependencies in package.json
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  // 1. Clean previous builds
  console.log("Cleaning dist folder...");
  await rm("dist", { recursive: true, force: true });

  // 2. Build Client (React/Vite)
  // This uses your vite.config.ts settings (outDir: dist/public)
  console.log("Building client (Vite)...");
  await viteBuild();

  // 3. Build Server (Express/ESBuild)
  console.log("Building server (ESBuild)...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];

  // Exclude libraries that shouldn't be bundled (like binary drivers)
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("\n✅ Build Successful!");
  console.log("Structure Created:");
  console.log("- dist/index.cjs (Server)");
  console.log("- dist/public/   (Frontend Assets)");
}

buildAll().catch((err) => {
  console.error("❌ Build Failed:", err);
  process.exit(1);
});
