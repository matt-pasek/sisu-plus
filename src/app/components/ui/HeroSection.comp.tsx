import React from 'react';

interface Props extends React.HTMLAttributes<HTMLElement> {
  /** A live backdrop, faded out at both side edges and washed toward the text on the left. */
  background?: React.ReactNode;
  children?: React.ReactNode;
}

export const HeroSection: React.FC<Props> = ({ background, className = '', children, ...props }) => (
  <section
    className={`relative overflow-hidden rounded-2xl bg-container shadow-[0_1px_3px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.045),0_24px_60px_-34px_rgba(0,0,0,0.9)] ${className}`}
    {...props}
  >
    {background && (
      <>
        <div className="pointer-events-none absolute inset-0 mask-[linear-gradient(90deg,transparent_0%,black_13%,black_88%,transparent_100%)] opacity-95">
          {background}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(82,201,137,0.16),transparent_30%),linear-gradient(90deg,rgba(21,21,28,0.96)_0%,rgba(21,21,28,0.74)_28%,rgba(21,21,28,0.42)_55%,rgba(21,21,28,0.9)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/55 to-transparent" />
      </>
    )}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
    {children}
  </section>
);
