import React from 'react';
import { NavLink } from 'react-router';

const NaviLink: React.FC<{ to: string; name: string }> = ({ to, name }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `rounded-md bg-offwhite/0 px-2 py-1 text-lightGrey transition-all duration-200 hover:bg-offwhite/10 hover:text-offwhite ${isActive ? 'bg-offwhite/10 text-offwhite' : ''}`
    }
  >
    {name}
  </NavLink>
);

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky z-50 flex w-screen gap-5 border-b-2 border-solid border-border bg-container px-6 py-3">
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
        <span className="transition-colors hover:text-white/80">credit count</span>
        <span className="transition-colors hover:text-white/80">Mateusz Pasek</span>
      </div>
    </nav>
  );
};
