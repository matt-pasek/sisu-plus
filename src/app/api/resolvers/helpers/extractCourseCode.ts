export const extractCourseCode = (id: string | undefined) => {
  if (!id) return null;
  // Require at least 2 leading letters — filters out numeric-only legacy course IDs
  const match = id.match(/(?<=-)[A-Z]{2,}[A-Z0-9]*(?=-)/);
  return match ? match[0] : null;
};
