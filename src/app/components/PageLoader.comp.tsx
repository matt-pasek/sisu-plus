import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import React from 'react';

export const PageLoader: React.FC = () => (
  <div className="flex min-h-[calc(100dvh-48px)] items-center justify-center">
    <InlineLoader />
  </div>
);
