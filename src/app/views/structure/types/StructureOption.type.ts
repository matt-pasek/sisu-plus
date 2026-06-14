export type StructureOption = {
  id: string;
  groupId: string;
  type: 'module' | 'course';
  code: string | null;
  name: string;
  credits: number | null;
  selected: boolean;
};
