import MetaBalls from '@/app/components/MetaBalls.comp';
import React, { useEffect } from 'react';

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
        <MetaBalls
          color="#ffffff"
          ballCount={20}
          animationSize={35}
          enableTransparency={true}
          clumpFactor={1}
          speed={0.3}
        />
      </div>
    </div>
  );
};
