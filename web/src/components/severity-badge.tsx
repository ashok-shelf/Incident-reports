interface SeverityBadgeProps {
  severity: string;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const level = severity.toUpperCase();

  const styles: Record<string, string> = {
    P0: "bg-black text-white border-black font-bold",
    P1: "bg-neutral-800 text-white border-neutral-800",
    P2: "bg-neutral-200 text-black border-neutral-400",
    P3: "bg-neutral-100 text-neutral-500 border-neutral-300",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-mono border ${styles[level] || styles.P3}`}
    >
      {level}
    </span>
  );
}
