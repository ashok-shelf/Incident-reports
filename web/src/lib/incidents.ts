import fs from "node:fs/promises";
import path from "node:path";
import { INCIDENTS_DIR } from "./constants";

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

/**
 * Auto-discover all incidents by scanning the filesystem.
 * No need to update CHANGELOG.md — just create the folder and report.md.
 */
export async function getIncidentsList(): Promise<IncidentSummary[]> {
  const incidents: IncidentSummary[] = [];

  try {
    const years = await fs.readdir(INCIDENTS_DIR);

    for (const year of years) {
      // Skip non-directory entries
      const yearPath = path.join(INCIDENTS_DIR, year);
      const yearStat = await fs.stat(yearPath);
      if (!yearStat.isDirectory()) continue;

      const slugs = await fs.readdir(yearPath);

      for (const slug of slugs) {
        const reportPath = path.join(yearPath, slug, "report.md");
        try {
          const content = await fs.readFile(reportPath, "utf-8");
          const metadata = parseMetadataTable(content);

          // Extract the incident ID from the slug (e.g. INC-001 from INC-001-db-outage)
          const idMatch = slug.match(/^(INC-\d+)/);
          const id = metadata["Incident ID"] || idMatch?.[1] || slug;

          incidents.push({
            id,
            slug,
            year,
            date: metadata["Date"] || "",
            severity: (metadata["Severity"] || "").split(/\s/)[0], // "P0 — Complete..." -> "P0"
            title: extractTitle(content),
            duration: metadata["Duration"] || "",
            status: extractStatus(content),
          });
        } catch {
          // No report.md in this folder, skip
          continue;
        }
      }
    }
  } catch {
    // incidents dir doesn't exist yet
    return [];
  }

  // Sort by date descending (newest first)
  incidents.sort((a, b) => b.date.localeCompare(a.date));

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

/**
 * Extract the incident title from the H1 or H2 heading.
 * Looks for patterns like "## Incident: Title Here"
 * or falls back to the first H1 after stripping "Production Incident Report"
 */
function extractTitle(content: string): string {
  const lines = content.split("\n");

  for (const line of lines) {
    // "## Incident: Complete Production Outage — ..."
    const incidentMatch = line.match(/^##?\s+(?:Incident:\s*)?(.+)/);
    if (incidentMatch) {
      const title = incidentMatch[1].trim();
      // Skip generic headings
      if (title !== "Production Incident Report" && title.length > 10) {
        return title;
      }
    }
  }

  // Fallback: use the slug-derived title
  return "";
}

/**
 * Try to find a status line at the bottom of the report.
 * Look for patterns like "*Status: ..."
 */
function extractStatus(content: string): string {
  const statusMatch = content.match(/\*Status:\s*([^*]+)\*/);
  if (statusMatch) return statusMatch[1].trim();

  // Check action items for pending/complete counts
  const pending = (content.match(/⬜/g) || []).length;
  const complete = (content.match(/✅/g) || []).length;
  const inProgress = (content.match(/🔄/g) || []).length;

  if (pending + complete + inProgress > 0) {
    if (pending === 0 && inProgress === 0) return "✅ All actions complete";
    return `🔄 ${complete} done, ${pending + inProgress} remaining`;
  }

  return "📋 Report filed";
}
