export const formatLeadTime = (minutes: number): string => {
  if (minutes >= 1440) return 'in 1 day';
  if (minutes >= 60) return `in ${minutes / 60} hour${minutes / 60 === 1 ? '' : 's'}`;
  return `in ${minutes} minutes`;
};
