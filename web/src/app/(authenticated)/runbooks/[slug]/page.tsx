import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getRunbookBySlug } from "@/lib/runbooks";
import { getRemarkPlugins, preprocessContent } from "@/lib/markdown";
import { getMDXComponents } from "@/components/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RunbookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const runbook = await getRunbookBySlug(slug);

  if (!runbook) notFound();

  return (
    <div>
      <Link
        href="/runbooks"
        className="inline-block text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-8"
      >
        &larr; Back to runbooks
      </Link>

      <header className="mb-10 pb-8 border-b border-black">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
          Runbook
        </p>
        <h1 className="font-display text-2xl md:text-3xl tracking-tight leading-tight">
          {runbook.title}
        </h1>
      </header>

      <article className="prose prose-neutral prose-lg max-w-none prose-headings:font-display prose-headings:tracking-tight prose-pre:bg-neutral-50 prose-pre:border prose-pre:border-neutral-200 prose-code:font-mono prose-code:text-sm prose-table:text-sm prose-th:font-mono prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-a:underline prose-a:underline-offset-2 prose-blockquote:border-l-black prose-blockquote:border-l-2 prose-hr:border-neutral-300">
        <MDXRemote
          source={preprocessContent(runbook.content, {
            context: "runbook",
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
