import React, { useEffect } from 'react';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';

export const SpinnerLoader: React.FC = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="absolute z-10 flex h-screen w-screen items-center justify-center bg-background">
      <div className="size-1/3">
        <InlineLoader />
      </div>
    </div>
  );
};
