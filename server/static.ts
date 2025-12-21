import express, { type Express } from "express";
import path from "path";
import fs from "fs";

export function serveStatic(app: Express) {
  // Use process.cwd() to ensure we find the dist folder regardless of where the script runs
  const buildPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(buildPath)) {
    console.error(`❌ ERROR: Build directory NOT FOUND at ${buildPath}`);
    console.error(
      `Check that your vite.config.ts outDir is set to "dist/public"`
    );
    return;
  }

  // Serve static assets with a long cache (good for PWA performance)
  app.use(
    express.static(buildPath, {
      maxAge: "1d",
      index: false, // We handle index via the catch-all below
    })
  );

  // CATCH-ALL: This handles React Router and PWA deep-linking
  app.get("*", (req, res, next) => {
    // If it's an API route that reached here, let it 404
    if (req.path.startsWith("/api")) {
      return next();
    }

    // Serve index.html for everything else (Landing page, App routes, etc)
    res.sendFile(path.join(buildPath, "index.html"), (err) => {
      if (err) {
        res
          .status(500)
          .send("Error loading index.html. Ensure client is built.");
      }
    });
  });
}
