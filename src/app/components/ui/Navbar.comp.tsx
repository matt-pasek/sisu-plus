import React from 'react';
import { NavLink } from 'react-router';
import { getCreditsByModule } from '@/app/api/dataPoints/getCreditsByModule';

const NaviLink: React.FC<{ to: string; name: string }> = ({ to, name }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `rounded-md px-3 py-1 text-sm text-lightGrey transition-all duration-200 hover:bg-offwhite/5 hover:text-offwhite ${isActive ? 'bg-offwhite/5 text-offwhite' : ''}`
    }
  >
    {name}
  </NavLink>
);

export const Navbar: React.FC = () => {
  const { modules, totalTarget, isLoading } = getCreditsByModule();
  return (
    <nav className="sticky z-50 flex w-screen gap-5 border-b-2 border-solid border-border bg-container px-6 py-2">
      <div className="flex items-center gap-1 text-lg font-medium">
        <div className="size-2 rounded-full bg-accent" />
        SISU <span className="mb-1 text-xl text-accent">+</span>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium">
        <NaviLink to={'/student/frontpage'} name="Dashboard" />
        <NaviLink to={'/student/plan'} name="Timeline" />
        <NaviLink to={'/student/structure'} name="Structure" />
        <NaviLink to={'/student/enrolments'} name="Registration" />
      </div>
      <div className="ml-auto flex items-center gap-3 text-sm font-medium">
        {!isLoading && (
          <span className="rounded-xl bg-lighterGreen/20 px-2 py-0.5 text-xs font-light text-lighterGreen transition-colors">
            {modules.map((m) => m.done).reduce((a, b) => a + b, 0)} / {totalTarget} cr
          </span>
        )}
        <span className="transition-colors hover:text-white/80">Mateusz Pasek</span>
      </div>
    </nav>
  );
};
