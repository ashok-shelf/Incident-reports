import remarkGfm from "remark-gfm";

/**
 * Preprocess markdown content to rewrite relative paths for web rendering.
 * This runs on the raw string before MDX compilation, so it's guaranteed to work
 * regardless of how the MDX pipeline handles AST nodes.
 */
export function preprocessContent(
  content: string,
  options: { context: "incident" | "runbook"; year?: string; slug?: string }
): string {
  let processed = content;

  // Rewrite evidence image paths: evidence/filename.png -> /api/evidence/year/slug/filename.png
  if (options.context === "incident" && options.year && options.slug) {
    processed = processed.replace(
      /\(evidence\/([^)]+)\)/g,
      `(/api/evidence/${options.year}/${options.slug}/$1)`
    );
    // Also handle image src in any raw HTML (unlikely but safe)
    processed = processed.replace(
      /src="evidence\/([^"]+)"/g,
      `src="/api/evidence/${options.year}/${options.slug}/$1"`
    );
  }

  // Rewrite incident report links: incidents/2026/INC-001-db-outage/report.md -> /incidents/INC-001-db-outage
  processed = processed.replace(
    /\((?:\.\.\/)?incidents\/\d{4}\/([^/]+)\/report\.md\)/g,
    "(/incidents/$1)"
  );

  // Rewrite runbook links: some-runbook.md -> /runbooks/some-runbook (only bare filenames, not paths)
  processed = processed.replace(
    /\(([a-z0-9-]+)\.md\)/g,
    "(/runbooks/$1)"
  );

  return processed;
}

export function getRemarkPlugins() {
  return [remarkGfm];
}
