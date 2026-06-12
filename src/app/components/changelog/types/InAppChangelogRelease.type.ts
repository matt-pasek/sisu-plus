import type { InAppChangelogPage } from './InAppChangelogPage.type';

export interface InAppChangelogRelease {
  version: string;
  title: string;
  subtitle: string;
  pages: InAppChangelogPage[];
}
