import type { OnboardingTranslation } from '@/app/locales/en/onboarding/onboarding.translation.en';

export const onboardingTranslation: OnboardingTranslation = {
  title: {
    kicker: 'OPINTOJEN HALLINTA, HILJAISESTI UUDISTETTU',
  },
  welcome: {
    headlineLine1: 'Parempi Sisu,',
    headlineLine2: 'sinulle rakennettu.',
    body: 'Sisu+ istuu yliopistosi Sisu-portaalin päällä ja tekee siitä jotain, mitä <bold>oikeasti haluat käyttää.</bold> Aloitetaan asennus – se kestää noin 30 sekuntia.',
    cta: 'Aloita',
  },
  university: {
    headline: 'Missä opiskelet?',
    body: 'Syötä Sisu-portaalisi URL-osoite, niin konfiguroimme kaiken automaattisesti.',
    quickPickLabel: 'Pikavalinnat:',
    inputPlaceholder: 'sisu.youruni.fi',
    inputAriaLabel: 'Sisu-portaalisi URL',
    groupAriaLabel: 'Sisu-URL-syöttö',
    cta: 'Jatka',
  },
  permission: {
    headline: 'Salli käyttöoikeus',
    headlineRe: 'Myönnä käyttöoikeus uudelleen',
    body: 'Sisu+ tarvitsee luvan käyttää yliopistosi Sisu- ja Moodle-portaaleja.',
    bodyRe:
      'Sisu+-asetuksesi synkronoituivat toiselta laitteelta. Myönnä käyttöoikeus verkkotunnukseen {{domain}} jatkaaksesi.',
    denied:
      'Käyttöoikeus evättiin. Sisu+ tarvitsee pääsyn molempiin verkkotunnuksiin toimiakseen. Yritä uudelleen alla.',
    ctaTryAgain: 'Yritä uudelleen',
    ctaGranted: 'Käyttöoikeus myönnetty',
    ctaAllow: 'Salli käyttöoikeus',
    back: 'Takaisin',
  },
  success: {
    headlineWord1: 'Olet',
    headlineWord2: 'sisällä.',
    body: 'Siirry Sisu-portaaliisi. Sisu+ aktivoituu automaattisesti kun kirjaudut sisään.',
    openSisu: 'Avaa Sisu',
    close: 'Sulje',
  },
};
