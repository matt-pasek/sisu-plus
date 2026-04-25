import { IcsCalendar } from 'ts-ics';
import React from 'react';
import { daysUntil } from '@/app/helpers/daysUntilToday';

interface Props {
  deadlines?: IcsCalendar;
}

interface DateStyles {
  container: string;
  date: string;
}

const getDateStyle = (days: number): DateStyles => {
  if (days <= 2) {
    return { container: 'bg-danger/15 border-danger/20', date: 'text-danger' };
  } else if (days <= 5) {
    return { container: 'bg-warn/15 border-warn/20', date: 'text-warn' };
  } else {
    return { container: 'bg-container2 border-border2', date: 'text-darkishGrey' };
  }
};

export const MoodleDeadlinesContent: React.FC<Props> = ({ deadlines }) => {
  const body = Boolean(deadlines?.events?.length) ? (
    deadlines?.events?.map((ev) => {
      const days = daysUntil(ev?.end?.date);
      const dateStyle = getDateStyle(days);

      return (
        <div
          key={ev.uid}
          className={`flex flex-col gap-1 rounded border border-solid px-2 py-1 ${dateStyle.container}`}
        >
          <div className="flex justify-between gap-2">
            <span className="line-clamp-1 text-xs font-medium text-ellipsis text-offwhite">{ev.summary}</span>
            <span className={`text-xs font-medium ${dateStyle.date}`}>{days}d</span>
          </div>
          <span className="text-xs font-light text-offwhite">
            {ev.categories ? ev.categories[0].split(' ')[0] : ''}
          </span>
        </div>
      );
    })
  ) : (
    <p>No deadlines approaching</p>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">{body}</div>
      <p className="shrink-0 border-t border-border pt-2 text-center text-xs font-light text-darkishGrey">
        Open Moodle
      </p>
    </div>
  );
};
