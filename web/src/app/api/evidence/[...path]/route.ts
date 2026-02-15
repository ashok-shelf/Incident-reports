import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { INCIDENTS_DIR } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;

  // Expect exactly 3 segments: year/slug/filename
  if (segments.length !== 3) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const [year, slug, filename] = segments;

  // Validate segments
  if (!/^\d{4}$/.test(year)) {
    return new NextResponse("Not Found", { status: 404 });
  }
  if (!/^INC-\d+-[\w-]+$/.test(slug)) {
    return new NextResponse("Not Found", { status: 404 });
  }
  if (!/^[\w.-]+\.(png|jpg|jpeg|gif|webp)$/i.test(filename)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = path.join(INCIDENTS_DIR, year, slug, "evidence", filename);
  const resolvedPath = path.resolve(filePath);

  // Prevent path traversal
  if (!resolvedPath.startsWith(path.resolve(INCIDENTS_DIR))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await fs.readFile(resolvedPath);
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
