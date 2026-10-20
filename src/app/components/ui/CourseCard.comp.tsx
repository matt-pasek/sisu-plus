import React from 'react';
import { motion, type MotionProps } from 'motion/react';

type CourseCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, keyof MotionProps> &
  MotionProps & {
    edgeColor: string;
    heading: React.ReactNode;
    code?: React.ReactNode;
    credits?: React.ReactNode;
    badge?: React.ReactNode;
    children?: React.ReactNode;
  };

export const CourseCard = React.forwardRef<HTMLDivElement, CourseCardProps>(
  ({ badge, children, className = '', code, credits, edgeColor, heading, ...props }, ref) => (
    <motion.article
      ref={ref}
      className={`group relative flex w-full min-w-0 flex-col justify-between rounded-xl bg-container px-2.5 py-2.5 transition-[box-shadow,opacity,scale] duration-150 ease-out ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-2.5 w-1 rounded-full"
        style={{ backgroundColor: edgeColor }}
      />
      <h3 className="line-clamp-2 pl-3.5 text-[13px] leading-[1.3] font-semibold text-pretty text-offwhite">
        {heading}
      </h3>
      {(code || credits || badge) && (
        <div className="flex min-w-0 items-center gap-2 pl-3.5">
          <p className="flex min-w-0 items-center gap-x-1.5 font-mono text-[11px] leading-4 whitespace-nowrap text-[#a3a3c4]">
            {code && <span className="min-w-0 truncate">{code}</span>}
            {code && credits && <span aria-hidden="true">·</span>}
            {credits && <span className="shrink-0 font-semibold text-[#7ea0ff] tabular-nums">{credits}</span>}
          </p>
          {badge && <span className="ml-auto flex shrink-0 items-center">{badge}</span>}
        </div>
      )}
      {children}
    </motion.article>
  ),
);

CourseCard.displayName = 'CourseCard';
