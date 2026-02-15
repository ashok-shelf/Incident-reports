import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/incidents");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">
          INCIDENT REPORTS
        </h1>
        <div className="w-16 h-0.5 bg-black mx-auto mb-3" />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          ShelfExecution — Internal
        </p>
      </div>

      <LoginForm />
    </main>
  );
}
