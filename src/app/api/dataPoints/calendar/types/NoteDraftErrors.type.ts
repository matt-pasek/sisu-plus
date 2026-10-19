export interface NoteDraftErrors {
  title?: 'required';
  time?: 'endBeforeStart';
  until?: 'beforeDate' | 'tooFar';
}
