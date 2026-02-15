/**
 * Prebuild script for Vercel deployment.
 * Copies incidents and runbooks from the repo root into the web directory
 * so they're available to serverless functions at runtime.
 *
 * - Markdown files → .content/ (read by serverless functions)
 * - Evidence images → public/evidence/ (served as static assets by CDN)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(WEB_ROOT, "..");

const CONTENT_DIR = path.join(WEB_ROOT, ".content");
const PUBLIC_EVIDENCE = path.join(WEB_ROOT, "public", "evidence");
const INCIDENTS_SRC = path.join(REPO_ROOT, "incidents");
const RUNBOOKS_SRC = path.join(REPO_ROOT, "runbooks");

async function cleanDir(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // doesn't exist, fine
  }
  await fs.mkdir(dir, { recursive: true });
}

async function copyFile(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function copyIncidents() {
  let years;
  try {
    years = await fs.readdir(INCIDENTS_SRC);
  } catch {
    console.log("  No incidents directory found, skipping.");
    return;
  }

  let mdCount = 0;
  let imgCount = 0;

  for (const year of years) {
    const yearPath = path.join(INCIDENTS_SRC, year);
    const stat = await fs.stat(yearPath);
    if (!stat.isDirectory()) continue;

    const slugs = await fs.readdir(yearPath);

    for (const slug of slugs) {
      const slugPath = path.join(yearPath, slug);
      const slugStat = await fs.stat(slugPath);
      if (!slugStat.isDirectory()) continue;

      // Copy report.md
      const reportSrc = path.join(slugPath, "report.md");
      try {
        await fs.access(reportSrc);
        const reportDest = path.join(CONTENT_DIR, "incidents", year, slug, "report.md");
        await copyFile(reportSrc, reportDest);
        mdCount++;
      } catch {
        // No report.md, skip
      }

      // Copy evidence images
      const evidenceSrc = path.join(slugPath, "evidence");
      try {
        const files = await fs.readdir(evidenceSrc);
        for (const file of files) {
          const src = path.join(evidenceSrc, file);
          const dest = path.join(PUBLIC_EVIDENCE, year, slug, file);
          await copyFile(src, dest);
          imgCount++;
        }
      } catch {
        // No evidence folder, skip
      }
    }
  }

  console.log(`  Incidents: ${mdCount} reports, ${imgCount} evidence images`);
}

async function copyRunbooks() {
  let files;
  try {
    files = await fs.readdir(RUNBOOKS_SRC);
  } catch {
    console.log("  No runbooks directory found, skipping.");
    return;
  }

  let count = 0;
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const src = path.join(RUNBOOKS_SRC, file);
    const dest = path.join(CONTENT_DIR, "runbooks", file);
    await copyFile(src, dest);
    count++;
  }

  console.log(`  Runbooks: ${count} files`);
}

console.log("Copying content for build...");
await cleanDir(CONTENT_DIR);
await cleanDir(PUBLIC_EVIDENCE);
await copyIncidents();
await copyRunbooks();
console.log("Done.");
