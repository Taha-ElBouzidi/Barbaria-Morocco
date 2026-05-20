import { signInWithPassword } from "./actions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // Collapse "unauthorized" and "invalid_credentials" into one
  // generic message so an attacker cannot tell which admin emails
  // exist. The granular distinction stays in server logs.
  const errorMessage = params.error === "invalid_email"
    ? "Please enter a valid email address."
    : params.error === "unauthorized" || params.error === "invalid_credentials"
    ? "Invalid email or password."
    : params.error
    ? "Something went wrong. Try again."
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[420px] space-y-8 bg-bb-bg p-10 border border-bb-line shadow-sm">
        <header className="space-y-2 text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-primary">Barbaria</p>
          <h1 className="font-serif text-[28px] leading-tight">Admin dashboard</h1>
          <p className="font-sans text-[13px] text-bb-on-surface-variant">Sign in to continue.</p>
        </header>

        <form action={signInWithPassword} className="space-y-5">
          <label className="block">
            <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full bg-transparent border-0 border-b border-bb-line py-3 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
              placeholder="you@maison.com"
            />
          </label>

          <label className="block">
            <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              minLength={8}
              className="w-full bg-transparent border-0 border-b border-bb-line py-3 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-bb-primary text-bb-bg px-8 py-4 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
          >
            Sign in
          </button>

          {errorMessage && (
            <p className="font-sans text-[12px] text-bb-primary text-center" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
