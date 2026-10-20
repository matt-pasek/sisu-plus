import React from 'react';

interface Props {
  lead?: string | null;
  items: string[];
}

const Separator: React.FC = () => <span className="mx-2 text-lightGrey/30">·</span>;

export const HeroEyebrow: React.FC<Props> = ({ lead, items }) => (
  <p className="font-mono text-[13px] font-semibold tracking-[0.02em] text-lightGrey/80 uppercase">
    {lead && <span className="text-lighterGreen/70">{lead}</span>}
    {items.map((item, index) => (
      <React.Fragment key={item}>
        {(lead || index > 0) && <Separator />}
        {item}
      </React.Fragment>
    ))}
  </p>
);
