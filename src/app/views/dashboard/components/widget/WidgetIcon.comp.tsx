import React from 'react';

const PATHS: Record<string, string> = {
  degree: 'M12 3.5 3.5 12 12 20.5 20.5 12 12 3.5Zm0 3.6 4.9 4.9L12 16.9 7.1 12 12 7.1Z',
  courses: 'M4.5 6.75h15M4.5 12h15M4.5 17.25h10',
  moodle: 'M6.75 3.75h10.5v16.5H6.75V3.75Zm2.4 4.5h5.7M9.15 12h5.7M9.15 15.6h3',
  stats: 'M4.5 19.5V12m7.5 7.5V4.5m7.5 15v-10',
  grade: 'm4.5 16.5 4.5-5.25 4.5 2.25 6-7.5',
  velocity: 'M4.5 7.5h9M4.5 12h15M4.5 16.5h12',
  timeline: 'M6 4.5v15m6-15v15m6-15v15',
  trophy:
    'M7 4.5h10v3a5 5 0 0 1-10 0v-3Zm0 1.5H4.5a2.5 2.5 0 0 0 2.5 2.5M17 6h2.5A2.5 2.5 0 0 1 17 8.5M9.5 19.5h5M12 12.5v4',
  workload: 'M4.5 18.75 9 12l3 3 7.5-9.75',
  countdown: 'M12 6v6l3.5 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  donut: 'M12 3a9 9 0 1 0 9 9M12 3v4.5M12 3a9 9 0 0 1 7.8 4.5',
  pace: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-6V4.5m0 15a9 9 0 1 0 0-18M14.1 9.9l3.15-3.15',
  exam: 'M7 3.75h7.5L18 7.25v13H7v-16.5Zm7.5 0v3.5H18M9.5 11.25h5M9.5 15h4',
  registration: 'M7 4.5h10v15H7v-15Zm3 4h4M10 12h4m-4 3.5 1.5 1.5 3-3',
  map: 'M9 4.5 4.5 6v13.5L9 18l6 1.5 4.5-1.5V4.5L15 6 9 4.5Zm0 0v13.5m6-12v13.5',
};

interface WidgetIconProps {
  name: keyof typeof PATHS;
}

export const WidgetIcon: React.FC<WidgetIconProps> = ({ name }) => (
  <div className="flex size-7.5 shrink-0 items-center justify-center rounded-[9px] bg-container2 text-lightGrey">
    <svg
      aria-hidden="true"
      className="size-4.25"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      viewBox="0 0 24 24"
    >
      <path d={PATHS[name]} />
    </svg>
  </div>
);
