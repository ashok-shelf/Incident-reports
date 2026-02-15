"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/login/actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-6">
      <div>
        <label
          htmlFor="username"
          className="block text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          className="w-full border-b-2 border-black bg-transparent py-2 text-lg font-body outline-none focus:border-neutral-500 transition-colors"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border-b-2 border-black bg-transparent py-2 text-lg font-body outline-none focus:border-neutral-500 transition-colors"
        />
      </div>

      {state?.error && (
        <p className="text-sm font-mono text-black bg-neutral-100 border border-black px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-black text-white py-3 text-sm font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:bg-neutral-400"
      >
        {isPending ? "Authenticating..." : "Enter"}
      </button>
    </form>
  );
}
