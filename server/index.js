import express from "express";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

try {
  loadEnvFile();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const { default: app } = await import("./app.js");

const port = Number(process.env.PORT) || 8787;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../dist");

app.use(express.static(distPath, { maxAge: "1h" }));
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`learnGit is running on http://localhost:${port}`);
});
