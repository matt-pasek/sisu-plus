export interface InAppChangelogPage {
  eyebrow: string;
  title: string;
  titlePrefix?: string;
  accent: string;
  body: string;
  tags: string[];
  titleSuffix?: string;
  badge?: string;
  showShare?: boolean;
  outro?: boolean;
  primaryCta?: string;
  mockup:
    | 'timeline'
    | 'structure'
    | 'versions'
    | 'calendar'
    | 'university'
    | 'dashboard'
    | 'registration'
    | 'notifications'
    | 'none';
}
