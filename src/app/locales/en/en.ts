import { viewsTranslation, ViewsTranslation } from '@/app/locales/en/views/views.translation.en';
import { componentsTranslation, ComponentsTranslation } from '@/app/locales/en/components/components.translation.en';
import {
  controlCenterTranslation,
  ControlCenterTranslation,
} from '@/app/locales/en/controlCenter/controlCenter.translation.en';
import { landingTranslation, LandingTranslation } from '@/app/locales/en/landing/landing.translation.en';
import { utilTranslation, UtilTranslation } from '@/app/locales/en/util/util.translation.en';

export const I18N_NAMESPACE = 'sisu';

export interface Translations {
  [I18N_NAMESPACE: string]: {
    components: ComponentsTranslation;
    controlCenter: ControlCenterTranslation;
    landing: LandingTranslation;
    util: UtilTranslation;
    views: ViewsTranslation;
  };
}

export const en: Translations = {
  [I18N_NAMESPACE]: {
    components: componentsTranslation,
    controlCenter: controlCenterTranslation,
    landing: landingTranslation,
    util: utilTranslation,
    views: viewsTranslation,
  },
};
