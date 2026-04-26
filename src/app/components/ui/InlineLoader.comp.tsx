import MetaBalls from '@/app/components/MetaBalls.comp';
import React from 'react';

export const InlineLoader: React.FC = () => (
  <MetaBalls color="#ffffff" ballCount={20} animationSize={35} enableTransparency={true} clumpFactor={1} speed={0.3} />
);
