import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getIncidentBySlug } from "@/lib/incidents";
import { getRemarkPlugins, preprocessContent } from "@/lib/markdown";
import { getMDXComponents } from "@/components/mdx-components";
import { SeverityBadge } from "@/components/severity-badge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function IncidentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const incident = await getIncidentBySlug(slug);

  if (!incident) notFound();

  const meta = incident.metadata;

  return (
    <div>
      <Link
        href="/incidents"
        className="inline-block text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-8"
      >
        &larr; Back to incidents
      </Link>

      <header className="mb-10 pb-8 border-b border-black">
        <div className="flex items-center gap-3 mb-4">
          {meta["Severity"] && (
            <SeverityBadge severity={meta["Severity"].split(/\s/)[0]} />
          )}
          <span className="font-mono text-sm text-neutral-500">
            {meta["Incident ID"]}
          </span>
        </div>

        <h1 className="font-display text-2xl md:text-3xl tracking-tight leading-tight mb-4">
          {meta["Incident ID"]} —{" "}
          {meta["Severity"]?.replace(/^P\d\s*[—-]\s*/, "") || "Incident Report"}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {meta["Date"] && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                Date
              </p>
              <p className="font-body">{meta["Date"]}</p>
            </div>
          )}
          {meta["Duration"] && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                Duration
              </p>
              <p className="font-body">{meta["Duration"]}</p>
            </div>
          )}
          {meta["Affected Services"] && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                Services
              </p>
              <p className="font-body">{meta["Affected Services"]}</p>
            </div>
          )}
          {meta["Report Author"] && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                Author
              </p>
              <p className="font-body">{meta["Report Author"]}</p>
            </div>
          )}
        </div>
      </header>

      <article className="prose prose-neutral prose-lg max-w-none prose-headings:font-display prose-headings:tracking-tight prose-pre:bg-neutral-50 prose-pre:border prose-pre:border-neutral-200 prose-code:font-mono prose-code:text-sm prose-img:max-w-full prose-table:text-sm prose-th:font-mono prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-a:underline prose-a:underline-offset-2 prose-blockquote:border-l-black prose-blockquote:border-l-2 prose-hr:border-neutral-300">
        <MDXRemote
          source={preprocessContent(incident.content, {
            context: "incident",
            year: incident.year,
            slug: incident.slug,
          })}
          components={getMDXComponents()}
          options={{
            mdxOptions: {
              remarkPlugins: getRemarkPlugins(),
            },
          }}
        />
      </article>
    </div>
  );
}
