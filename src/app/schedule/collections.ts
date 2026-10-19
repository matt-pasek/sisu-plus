export const uniqueBy = <T>(items: T[], keyOf: (item: T) => string): T[] => [
  ...new Map(items.map((item) => [keyOf(item), item])).values(),
];
