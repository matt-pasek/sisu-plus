import {
  accountDropdownTranslation,
  AccountDropdownTranslation,
} from '@/app/locales/en/components/ui/accountDropdown.translation.en';
import { changelogTranslation, ChangelogTranslation } from '@/app/locales/en/components/changelog.translation.en';
import { errorsTranslation, ErrorsTranslation } from '@/app/locales/en/components/errors/errors.translation.en';
import { navbarTranslation, NavbarTranslation } from '@/app/locales/en/components/ui/navbar.translation.en';

export type ComponentsTranslation = {
  accountDropdown: AccountDropdownTranslation;
  changelog: ChangelogTranslation;
  errors: ErrorsTranslation;
  navbar: NavbarTranslation;
};

export const componentsTranslation: ComponentsTranslation = {
  accountDropdown: accountDropdownTranslation,
  changelog: changelogTranslation,
  errors: errorsTranslation,
  navbar: navbarTranslation,
};
