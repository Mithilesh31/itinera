import Link from "next/link";
import { Plane, Sparkles } from "lucide-react";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-semibold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Plane className="h-4 w-4" />
          </span>
          Itinera
        </Link>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <h1 className="text-center font-display text-2xl font-semibold">
            Welcome back
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Sign in to plan and share your trips.
          </p>

          <div className="mt-8 space-y-3">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                <GoogleIcon /> Continue with Google
              </button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("demo", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                <Sparkles className="h-4 w-4" /> Continue with demo account
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            The demo account lets you explore Itinera instantly — no signup needed.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.47 14.97.5 12 .5A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z"
      />
    </svg>
  );
}
