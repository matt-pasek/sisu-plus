import React, { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  ariaLabel?: string;
  className?: string;
  icon?: JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  variant?: 'primary' | 'onSurface' | 'accent';
}

export const Button: React.FC<Props> = ({
  ariaLabel,
  children,
  className = '',
  icon,
  onClick,
  disabled,
  title,
  variant = 'primary',
}) => {
  const disabledClass = disabled
    ? 'cursor-not-allowed! border-border bg-container text-lightGrey/90! hover:bg-container!'
    : '';

  let variantClass = '';
  switch (variant) {
    case 'primary':
      variantClass = 'border-border bg-container text-offwhite hover:bg-offwhite/10';
      break;
    case 'onSurface':
      variantClass = 'border-border bg-container2/80 text-offwhite hover:bg-offwhite/10';
      break;
    case 'accent':
      variantClass = 'border-accent bg-accent/20 text-accent hover:bg-accent/30';
      break;
  }

  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex min-h-10 cursor-pointer items-center justify-center gap-1 rounded-lg border border-solid px-3 py-2 text-xs font-medium transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 select-none active:scale-[0.96] ${disabledClass} ${variantClass} ${className}`}
    >
      {icon && <div className="flex items-center justify-center">{icon}</div>}
      {children}
    </button>
  );
};
