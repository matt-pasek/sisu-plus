import { motion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

interface Props extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'text';
}

export function OnboardingButton({ children, className = '', disabled, variant = 'primary', ...props }: Props) {
  const buttonClass = ['ob-btn', `ob-btn-${variant}`, className].filter(Boolean).join(' ');

  return (
    <motion.button
      className={buttonClass}
      disabled={disabled}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--ob-pointer-x', `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty('--ob-pointer-y', `${event.clientY - rect.top}px`);
      }}
      type="button"
      whileTap={disabled ? undefined : { scale: 0.96 }}
      {...props}
    >
      {variant === 'primary' && (
        <>
          <span className="ob-btn-spotlight" aria-hidden="true" />
          <span className="ob-btn-edge" aria-hidden="true" />
        </>
      )}
      <span className="ob-btn-label">{children}</span>
    </motion.button>
  );
}
