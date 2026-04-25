import React, { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  icon?: JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'onSurface' | 'accent';
}

export const Button: React.FC<Props> = ({ children, icon, onClick, disabled, variant = 'primary' }) => {
  const disabledClass = disabled
    ? 'cursor-not-allowed border-border bg-container text-lightGrey/90! hover:bg-container!'
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
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-lg border border-solid px-3 py-2 text-xs font-medium transition-all duration-200 ${disabledClass} ${variantClass}`}
    >
      {icon}
      {children}
    </button>
  );
};
