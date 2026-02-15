import path from "node:path";

const isVercel = !!process.env.VERCEL;

// On Vercel, content is copied into .content/ at build time by scripts/copy-content.mjs
// Locally, read directly from the repo root (parent of web/)
const CONTENT_ROOT = isVercel
  ? path.join(process.cwd(), ".content")
  : path.resolve(process.cwd(), "..");

export const INCIDENTS_DIR = path.join(CONTENT_ROOT, "incidents");
export const RUNBOOKS_DIR = path.join(CONTENT_ROOT, "runbooks");
export const COOKIE_NAME = "session";
