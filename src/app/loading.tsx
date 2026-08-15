'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <MainLayout>
      <DashboardSkeleton />
    </MainLayout>
  );
}
