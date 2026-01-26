'use client';

import { QADashboard } from '@/components/QADashboard';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000';

export default function Home() {
  return (
    <main>
      <QADashboard apiEndpoint={API_ENDPOINT} />
    </main>
  );
}
