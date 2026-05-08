import React from 'react';
import { motion, type MotionProps } from 'motion/react';

type CourseCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, keyof MotionProps> &
  MotionProps & {
    stripeClassName?: string;
    stripeStyle?: React.CSSProperties;
    heading: React.ReactNode;
    code?: React.ReactNode;
    credits?: React.ReactNode;
    badge?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
    headerClassName?: string;
    selected?: boolean;
  };

export const CourseCard = React.forwardRef<HTMLDivElement, CourseCardProps>(
  (
    {
      badge,
      children,
      className = '',
      code,
      credits,
      footer,
      heading,
      headerClassName = '',
      selected = false,
      stripeClassName = 'bg-darkishGrey',
      stripeStyle,
      ...props
    },
    ref,
  ) => (
    <motion.article
      ref={ref}
      className={`group relative flex w-full min-w-0 flex-col overflow-hidden rounded-[10px] bg-container shadow-[0_0_0_1px_rgba(255,255,255,0.055)] transition-[box-shadow,background-color,opacity,scale,transform] duration-150 ease-out hover:bg-container/95 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_10px_28px_rgba(0,0,0,0.18)] ${
        selected ? 'shadow-[0_0_0_1px_rgba(82,201,137,0.24)]' : ''
      } ${className}`}
      {...props}
    >
      <div className={`flex min-h-24 items-start justify-between gap-3 px-3.5 py-3 ${headerClassName}`}>
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-0.5 w-1 shrink-0 self-stretch rounded-full ${stripeClassName}`} style={stripeStyle} />
          <div className="min-w-0">
            <h3 className="text-sm leading-snug font-semibold text-balance text-offwhite">{heading}</h3>
            {(code || credits) && (
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-darkishGrey">
                {code && <span>{code}</span>}
                {code && credits && <span aria-hidden="true">·</span>}
                {credits && <span className="font-semibold text-[#7ea0ff]">{credits}</span>}
              </p>
            )}
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {children}

      {footer && (
        <div className="mt-auto border-t border-border/70 bg-container2/55 px-3.5 py-2 text-xs text-lightGrey">
          {footer}
        </div>
      )}
    </motion.article>
  ),
);

CourseCard.displayName = 'CourseCard';
