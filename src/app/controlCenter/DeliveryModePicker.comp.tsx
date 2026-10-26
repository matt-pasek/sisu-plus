import React from 'react';
import type { TFunction } from 'i18next';
import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';

interface Props {
  label: string;
  value: NotificationDeliveryMode;
  onChange: (mode: NotificationDeliveryMode) => void;
  t: TFunction<'translation', 'controlCenter'>;
}

const DELIVERY_MODES: NotificationDeliveryMode[] = ['off', 'in-app', 'out-of-app', 'both'];

export const DeliveryModePicker: React.FC<Props> = ({ label, value, onChange, t }) => (
  <div
    role="radiogroup"
    aria-label={label}
    className="flex shrink-0 gap-0.5 rounded-lg bg-background p-0.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
  >
    {DELIVERY_MODES.map((mode) => {
      const selected = value === mode;
      return (
        <button
          key={mode}
          role="radio"
          aria-checked={selected}
          className={`min-h-7 cursor-pointer rounded-md px-2 text-[11px] font-medium transition-[background-color,color] duration-150 ${
            selected
              ? 'bg-container2 text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
              : 'text-lightGrey hover:text-offwhite'
          }`}
          onClick={() => onChange(mode)}
          type="button"
        >
          {t(`notifications.delivery.${mode}`)}
        </button>
      );
    })}
  </div>
);
