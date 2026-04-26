export const daysUntil = (date?: Date) => {
  if (!date) return 0;
  const today = new Date();
  const timeDiff = date.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};
