import { signInWithMagicLink } from "./actions";

export const dynamic = "force-dynamic"; // depends on searchParams

interface PageProps {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const errorMessage =
    params.error === "unauthorized"
      ? "This email is not authorized for the admin dashboard."
      : params.error === "expired"
        ? "Your magic link expired. Request a fresh one below."
        : params.error
          ? "Something went wrong. Try again."
          : null;
  const sentTo = params.sent === "1" ? (params.email ?? null) : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[420px] space-y-8 bg-bb-bg p-10 border border-bb-line shadow-sm">
        <header className="space-y-2 text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-primary">Barbaria</p>
          <h1 className="font-serif text-[28px] leading-tight">Admin dashboard</h1>
          <p className="font-sans text-[13px] text-bb-on-surface-variant">
            Sign in with your magic link.
          </p>
        </header>

        {sentTo ? (
          <div className="space-y-3 text-center">
            <p className="font-sans text-[14px] text-bb-on-surface">
              Magic link sent to <span className="font-medium">{sentTo}</span>.
            </p>
            <p className="font-sans text-[12px] text-bb-on-surface-variant">
              Check your inbox (and spam) for a link from Barbaria, valid for ~1 hour.
            </p>
          </div>
        ) : (
          <form action={signInWithMagicLink} className="space-y-4">
            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full bg-transparent border-0 border-b border-bb-line py-3 text-bb-on-surface focus:outline-none focus:border-bb-primary"
                placeholder="you@maison.com"
              />
            </label>

            <button
              type="submit"
              className="w-full bg-bb-primary text-bb-bg px-8 py-4 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
            >
              Send magic link
            </button>

            {errorMessage && (
              <p className="font-sans text-[12px] text-bb-primary text-center" role="alert">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
