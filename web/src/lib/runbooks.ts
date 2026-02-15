import fs from "node:fs/promises";
import path from "node:path";
import { RUNBOOKS_DIR } from "./constants";

export interface RunbookSummary {
  slug: string;
  title: string;
  symptoms: string[];
}

export interface RunbookDetail {
  slug: string;
  title: string;
  content: string;
}

export async function getRunbooksList(): Promise<RunbookSummary[]> {
  const files = await fs.readdir(RUNBOOKS_DIR);
  const runbooks: RunbookSummary[] = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const slug = file.replace(".md", "");
    const content = await fs.readFile(path.join(RUNBOOKS_DIR, file), "utf-8");
    const lines = content.split("\n");

    // Extract title from first H1
    const titleLine = lines.find((l) => l.startsWith("# "));
    const title = titleLine
      ? titleLine.replace(/^#\s+/, "").replace(/Runbook:\s*/i, "")
      : slug;

    // Extract symptom bullet points
    const symptoms: string[] = [];
    let inSymptoms = false;
    for (const line of lines) {
      if (line.match(/^##\s+Symptoms/i)) {
        inSymptoms = true;
        continue;
      }
      if (inSymptoms && line.startsWith("## ")) break;
      if (inSymptoms && line.startsWith("- ")) {
        symptoms.push(line.replace(/^-\s+/, ""));
        if (symptoms.length >= 3) break;
      }
    }

    runbooks.push({ slug, title, symptoms });
  }

  return runbooks;
}

export async function getRunbookBySlug(
  slug: string
): Promise<RunbookDetail | null> {
  try {
    const filePath = path.join(RUNBOOKS_DIR, `${slug}.md`);
    const content = await fs.readFile(filePath, "utf-8");

    const titleLine = content.split("\n").find((l) => l.startsWith("# "));
    const title = titleLine
      ? titleLine.replace(/^#\s+/, "").replace(/Runbook:\s*/i, "")
      : slug;

    return { slug, title, content };
  } catch {
    return null;
  }
}
