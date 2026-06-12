import React from 'react';

interface Props {
  accent: string;
}

export const ChangelogAurora: React.FC<Props> = ({ accent }) => (
  <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden" aria-hidden="true">
    <span
      className="cl-aurora absolute top-[-55%] right-[-30%] left-[-30%] h-[150%] opacity-70 mix-blend-screen"
      style={{
        backgroundImage: `linear-gradient(105deg, transparent 14%, ${accent} 34%, #34c7a9 52%, #5b8df6 70%, transparent 88%)`,
        filter: 'blur(56px)',
        animation: 'clAuroraFlow1 24s ease-in-out infinite',
        willChange: 'transform',
      }}
    />
    <span
      className="cl-aurora absolute top-[-42%] right-[-30%] left-[-30%] h-[132%] opacity-45 mix-blend-screen"
      style={{
        backgroundImage: `linear-gradient(95deg, transparent 20%, #a78bfa 40%, ${accent} 60%, transparent 84%)`,
        filter: 'blur(56px)',
        animation: 'clAuroraFlow2 31s ease-in-out infinite',
        willChange: 'transform',
      }}
    />
    <span
      className="cl-aurora absolute top-[-48%] right-[-30%] left-[-30%] h-[140%] opacity-35 mix-blend-screen"
      style={{
        backgroundImage: `linear-gradient(115deg, transparent 22%, #34c7a9 46%, ${accent} 64%, transparent 88%)`,
        filter: 'blur(56px)',
        animation: 'clAuroraFlow3 19s ease-in-out infinite',
        willChange: 'transform',
      }}
    />
    <span
      className="cl-stars absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          'radial-gradient(1.5px 1.5px at 22% 28%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 72% 20%, rgba(255,255,255,0.6), transparent), radial-gradient(1.5px 1.5px at 86% 56%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 44% 70%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 60% 84%, rgba(255,255,255,0.45), transparent)',
        animation: 'clStarDrift 40s linear infinite',
      }}
    />
  </div>
);
