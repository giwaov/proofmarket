import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import app from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 8787);
const distPath = path.resolve(__dirname, "../dist");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("/*splat", (_request, response) =>
    response.sendFile(path.join(distPath, "index.html"))
  );
}

app.listen(port, () => {
  console.log(`ProofMarket API listening on http://localhost:${port}`);
});
