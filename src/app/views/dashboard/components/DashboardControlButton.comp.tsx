import React, { useId, useState } from 'react';

interface DashboardControlButtonProps {
  active?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  tooltip: string;
  tooltipSide?: 'left' | 'bottom';
}

export const DashboardControlButton: React.FC<DashboardControlButtonProps> = ({
  active = false,
  ariaLabel,
  children,
  className = '',
  onClick,
  tooltip,
}) => {
  const tooltipId = useId();
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);

  return (
    <div className={`${className}`}>
      <div className="group relative isolate">
        <button
          aria-describedby={tooltipId}
          aria-label={ariaLabel}
          className={`grid size-10 place-items-center rounded-xl border text-lightGrey shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-md transition-[background-color,border-color,color,transform,box-shadow] duration-150 hover:bg-offwhite/10 hover:text-offwhite focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-lighterGreen/75 active:scale-[0.96] ${
            active
              ? 'border-lighterGreen/40 bg-lighterGreen/15 text-lighterGreen shadow-[0_10px_30px_rgba(0,0,0,0.28),0_0_0_1px_rgba(82,201,137,0.12)]'
              : 'border-white/8 bg-background/50'
          }`}
          onClick={onClick}
          type="button"
          onPointerEnter={() => setTooltipVisible(true)}
          onPointerLeave={() => setTooltipVisible(false)}
        >
          {children}
        </button>
        <span
          className={`pointer-events-none absolute top-1/2 right-full z-50 mr-2 translate-x-0 -translate-y-1/2 rounded-lg border border-white/8 bg-background/95 px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] whitespace-nowrap text-offwhite uppercase shadow-[0_14px_34px_rgba(0,0,0,0.36)] transition-opacity duration-150 ${
            tooltipVisible ? 'opacity-100' : 'opacity-0'
          }`}
          id={tooltipId}
          role="tooltip"
        >
          {tooltip}
        </span>
      </div>
    </div>
  );
};
