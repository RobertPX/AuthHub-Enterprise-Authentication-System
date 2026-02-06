'use client';

import { LoginForm } from '@/components/auth/login-form';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-2xl">
        <Shield className="h-8 w-8" />
        AuthHub
      </Link>
      <LoginForm />
    </div>
  );
}
