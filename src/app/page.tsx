import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Hexagon, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-zinc-800/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20">
            <Hexagon className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            PersonalOS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-600/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
          <Zap className="h-3 w-3" />
          Performance Infrastructure for High-Agency Individuals
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl md:text-6xl">
          Your Operating System
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            for Peak Performance
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-zinc-400 sm:text-lg">
          Drive clarity. Increase output velocity. Reduce cognitive overhead.
          PersonalOS is the execution layer for individuals who refuse to be
          average.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Start Building
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800/50"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-16 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Daily Execution",
              desc: "Deep work blocks, task categories, energy tracking",
            },
            {
              icon: Shield,
              title: "ClientOS",
              desc: "CRM, projects, invoices, revenue tracking",
            },
            {
              icon: BarChart3,
              title: "Analytics",
              desc: "Performance score, output metrics, compounding",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 text-left transition-colors hover:border-zinc-700/50"
            >
              <feature.icon className="mb-2 h-5 w-5 text-emerald-400" />
              <p className="text-sm font-medium text-zinc-200">
                {feature.title}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-6 py-4 text-center text-xs text-zinc-600">
        PersonalOS — Performance infrastructure. Not productivity theater.
      </footer>
    </div>
  );
}
