import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-black">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/incidents"
          className="font-display text-lg tracking-tight hover:opacity-70 transition-opacity"
        >
          INCIDENT REPORTS
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="/incidents"
            className="text-xs font-mono uppercase tracking-widest text-neutral-600 hover:text-black transition-colors"
          >
            Incidents
          </Link>
          <Link
            href="/runbooks"
            className="text-xs font-mono uppercase tracking-widest text-neutral-600 hover:text-black transition-colors"
          >
            Runbooks
          </Link>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
