import { en, I18N_NAMESPACE, Translations } from '@/app/locales/en/en';
import { componentsTranslation } from '@/app/locales/fi/components/components.translation.fi';
import { controlCenterTranslation } from '@/app/locales/fi/controlCenter/controlCenter.translation.fi';
import { landingTranslation } from '@/app/locales/fi/landing/landing.translation.fi';
import { onboardingTranslation } from '@/app/locales/fi/onboarding/onboarding.translation.fi';
import { utilTranslation } from '@/app/locales/fi/util/util.translation.fi';
import { viewsTranslation } from '@/app/locales/fi/views/views.translation.fi';

export const fi: Translations = {
  [I18N_NAMESPACE]: {
    ...en.sisu,
    components: componentsTranslation,
    controlCenter: controlCenterTranslation,
    landing: landingTranslation,
    onboarding: onboardingTranslation,
    util: utilTranslation,
    views: viewsTranslation,
  },
};
