import Link from 'next/link';
import { Shield, Lock, Users, Key, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Shield className="h-6 w-6" />
              AuthHub
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Enterprise Authentication
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Secure, scalable, and modern authentication system for your applications. Built with
            Next.js, TypeScript, and industry best practices.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/api/health"
              className="inline-flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
            >
              API Health
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Secure Authentication</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              JWT tokens with refresh token rotation, bcrypt password hashing, and secure HTTP-only
              cookies.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Role-Based Access</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Built-in role system with USER, MANAGER, and ADMIN roles for granular access control.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Session Management</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Track and manage active sessions across devices with the ability to revoke any
              session.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Rate Limiting</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Built-in protection against brute force attacks with Redis-powered rate limiting.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Built with Modern Technologies</h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {['Next.js 14', 'TypeScript', 'Prisma', 'PostgreSQL', 'Redis', 'Tailwind CSS'].map(
              (tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              AuthHub - Enterprise Authentication System
            </div>
            <p className="text-sm text-muted-foreground">Built for demonstration purposes</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
