import fs from "node:fs/promises";
import path from "node:path";
import { CHANGELOG_PATH, INCIDENTS_DIR } from "./constants";

export interface IncidentSummary {
  id: string;
  slug: string;
  year: string;
  date: string;
  severity: string;
  title: string;
  duration: string;
  status: string;
}

export interface IncidentDetail {
  slug: string;
  year: string;
  metadata: Record<string, string>;
  content: string;
}

export async function getIncidentsList(): Promise<IncidentSummary[]> {
  const content = await fs.readFile(CHANGELOG_PATH, "utf-8");
  const lines = content.split("\n");

  const incidents: IncidentSummary[] = [];

  for (const line of lines) {
    // Match table rows that contain incident links
    const linkMatch = line.match(
      /\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|/
    );
    if (!linkMatch) continue;

    const id = linkMatch[1]; // e.g. "INC-001"
    const linkPath = linkMatch[2]; // e.g. "incidents/2026/INC-001-db-outage/report.md"

    // Extract slug and year from path
    const pathMatch = linkPath.match(
      /incidents\/(\d{4})\/([^/]+)\/report\.md/
    );
    if (!pathMatch) continue;

    const year = pathMatch[1];
    const slug = pathMatch[2];

    // Split the full row by | and extract cells
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);

    if (cells.length < 6) continue;

    const date = cells[1];
    const severity = cells[2].replace(/\*\*/g, ""); // strip bold markers
    const title = cells[3];
    const duration = cells[4];
    const status = cells[5];

    incidents.push({ id, slug, year, date, severity, title, duration, status });
  }

  return incidents;
}

export async function getIncidentBySlug(
  slug: string
): Promise<IncidentDetail | null> {
  try {
    const years = await fs.readdir(INCIDENTS_DIR);

    for (const year of years) {
      const reportPath = path.join(INCIDENTS_DIR, year, slug, "report.md");
      try {
        const content = await fs.readFile(reportPath, "utf-8");
        const metadata = parseMetadataTable(content);
        return { slug, year, metadata, content };
      } catch {
        continue;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function parseMetadataTable(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const lines = content.split("\n");

  let inTable = false;

  for (const line of lines) {
    // Look for the first table (metadata table)
    if (line.includes("|") && line.includes("**")) {
      inTable = true;
    }

    if (inTable) {
      // Skip separator rows
      if (line.match(/^\|[\s-|]+\|$/)) continue;

      // Parse field-value rows like: | **Field** | Value |
      const match = line.match(
        /\|\s*\*\*([^*]+)\*\*\s*\|\s*(.+?)\s*\|/
      );
      if (match) {
        metadata[match[1]] = match[2];
      }

      // Stop at the horizontal rule after the table
      if (line.startsWith("---")) {
        break;
      }
    }
  }

  return metadata;
}
