import {
  accountDropdownTranslation,
  AccountDropdownTranslation,
} from '@/app/locales/en/components/ui/accountDropdown.translation.en';
import { errorsTranslation, ErrorsTranslation } from '@/app/locales/en/components/errors/errors.translation.en';
import { navbarTranslation, NavbarTranslation } from '@/app/locales/en/components/ui/navbar.translation.en';

export type ComponentsTranslation = {
  accountDropdown: AccountDropdownTranslation;
  errors: ErrorsTranslation;
  navbar: NavbarTranslation;
};

export const componentsTranslation: ComponentsTranslation = {
  accountDropdown: accountDropdownTranslation,
  errors: errorsTranslation,
  navbar: navbarTranslation,
};
