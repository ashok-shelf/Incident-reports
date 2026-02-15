import path from "node:path";

export const REPO_ROOT = path.resolve(process.cwd(), "..");
export const INCIDENTS_DIR = path.join(REPO_ROOT, "incidents");
export const RUNBOOKS_DIR = path.join(REPO_ROOT, "runbooks");
export const CHANGELOG_PATH = path.join(REPO_ROOT, "CHANGELOG.md");
export const COOKIE_NAME = "session";
