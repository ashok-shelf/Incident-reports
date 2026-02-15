import Link from "next/link";
import { getRunbooksList } from "@/lib/runbooks";

export const dynamic = "force-dynamic";

export default async function RunbooksPage() {
  const runbooks = await getRunbooksList();

  return (
    <div>
      <header className="mb-12">
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
          RUNBOOKS
        </h1>
        <p className="text-sm font-mono text-neutral-500">
          Step-by-step diagnostic guides for known failure scenarios
        </p>
      </header>

      <div className="space-y-0">
        {runbooks.map((runbook) => (
          <Link
            key={runbook.slug}
            href={`/runbooks/${runbook.slug}`}
            className="block border-t border-neutral-200 py-6 hover:bg-neutral-50 -mx-4 px-4 transition-colors"
          >
            <h2 className="font-body text-base leading-snug mb-3">
              {runbook.title}
            </h2>
            {runbook.symptoms.length > 0 && (
              <ul className="space-y-1">
                {runbook.symptoms.map((symptom, i) => (
                  <li
                    key={i}
                    className="text-sm font-mono text-neutral-500 pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-neutral-300"
                  >
                    {symptom}
                  </li>
                ))}
              </ul>
            )}
          </Link>
        ))}

        {runbooks.length > 0 && (
          <div className="border-t border-neutral-200" />
        )}
      </div>
    </div>
  );
}
