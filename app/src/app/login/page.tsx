import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";

export const metadata = { title: "Sign in — Astra Velocity" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  if (session?.user) redirect(params.callbackUrl ?? "/");

  async function login(formData: FormData) {
    "use server";
    const callbackUrl = (formData.get("callbackUrl") as string) || "/";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: callbackUrl,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/login?error=invalid&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
      throw err; // next/navigation redirect
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-400">
            Artizent
          </p>
          <h1 className="mt-2 font-serif text-3xl text-white">Astra Velocity</h1>
          <p className="mt-2 text-sm text-slate-400">
            Insurance Data Governance Platform
          </p>
        </div>

        <form
          action={login}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl"
        >
          <input type="hidden" name="callbackUrl" value={params.callbackUrl ?? "/"} />
          {params.error && (
            <p className="rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
              Invalid email or password.
            </p>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-teal-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-teal-500"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-teal-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
