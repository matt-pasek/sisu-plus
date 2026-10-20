import React from 'react';
import type { AccentText } from '@/app/views/timeline/types';

interface Props {
  text: AccentText;
}

export const AccentPhrase: React.FC<Props> = ({ text }) => (
  <>
    {text.before}
    {text.accent && <span className="text-lighterGreen">{text.accent}</span>}
    {text.after}
  </>
);
