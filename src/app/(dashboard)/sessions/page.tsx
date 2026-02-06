'use client';

import { SessionsList } from '@/components/dashboard/sessions-list';

export default function SessionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sessions</h1>
        <p className="text-muted-foreground mt-1">
          Manage your active sessions across all devices
        </p>
      </div>

      <SessionsList />
    </div>
  );
}
