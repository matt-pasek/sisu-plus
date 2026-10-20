import type { Term } from '@/app/types/Term.type';
import type { LoadBar } from './LoadBar.type';

export interface LoadTermGroup {
  key: string;
  term: Term;
  bars: LoadBar[];
}
