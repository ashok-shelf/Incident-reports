import Link from "next/link";
import { getIncidentsList } from "@/lib/incidents";
import { SeverityBadge } from "@/components/severity-badge";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const incidents = await getIncidentsList();

  return (
    <div>
      <header className="mb-12">
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
          INCIDENT LOG
        </h1>
        <p className="text-sm font-mono text-neutral-500">
          {incidents.length} documented incident{incidents.length !== 1 ? "s" : ""}
        </p>
      </header>

      <div className="space-y-0">
        {incidents.map((incident) => (
          <Link
            key={incident.id}
            href={`/incidents/${incident.slug}`}
            className="block border-t border-neutral-200 py-6 hover:bg-neutral-50 -mx-4 px-4 transition-colors"
          >
            <div className="flex items-start gap-4">
              <SeverityBadge severity={incident.severity} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-mono text-sm text-neutral-500">
                    {incident.id}
                  </span>
                  <span className="font-mono text-sm text-neutral-400">
                    {incident.date}
                  </span>
                </div>
                <h2 className="font-body text-base leading-snug mb-2">
                  {incident.title}
                </h2>
                <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
                  <span>Duration: {incident.duration}</span>
                  <span>{incident.status}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {incidents.length > 0 && (
          <div className="border-t border-neutral-200" />
        )}
      </div>

      {incidents.length === 0 && (
        <p className="text-neutral-500 font-mono text-sm">
          No incidents documented yet.
        </p>
      )}
    </div>
  );
}
