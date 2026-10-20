export type AddRowState = 'idle' | 'adding' | 'added' | 'busy';

export interface AddProgress {
  pendingAddId: string | null;
  lastAddedId: string | null;
}

export const getAddRowState = (courseUnitId: string, { pendingAddId, lastAddedId }: AddProgress): AddRowState => {
  if (lastAddedId === courseUnitId) return 'added';
  return pendingAddId === courseUnitId ? 'adding' : 'idle';
};
