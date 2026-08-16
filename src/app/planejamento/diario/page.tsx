'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';

export default function PlanejamentoDiarioRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/calendario?view=day');
  }, [router]);

  return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--border-color)] border-t-[var(--text-primary)] animate-spin" />
      </div>
    </MainLayout>
  );
}
