import { ControlCenterTranslation } from '@/app/locales/en/controlCenter/controlCenter.translation.en';

export const controlCenterTranslation: ControlCenterTranslation = {
  activate: {
    descriptionActive: 'Rauhallinen kerros suunnitteluun, määräaikoihin ja opiskelutahtiin.',
    descriptionPaused: 'Keskeytetty. Alkuperäinen Sisu näkyy tämän ohjaimen takana.',
    title: 'Ota SISU+ käyttöön',
    helperActive: 'Korvaa alkuperäiset opiskelijasivut.',
    helperPaused: 'Palaa parannettuun etusivuun.',
  },
  footer: {
    madeWithLove: 'SISU+ v{{version}} tehty huolella',
    by: 'tekijä',
    contact: 'yhteys',
  },
  moodle: {
    checkUrl: 'Tarkista URL',
    connectedHelper: 'Liitä Moodlen viety kalenterilinkki kerran. SISU+ käyttää sitä vain määräaikawidgeteissä.',
    label: 'Moodle-synkronointi',
    validUrl: 'Kalenterin URL',
  },
  onboarding: {
    back: 'Takaisin',
    complete: 'Vahvista',
    finishSetup: 'Viimeistele',
    firstRunSetup: 'Ensimmäinen käyttöönotto',
    continue: 'Jatka',
    progressLabel: 'Käyttöönoton eteneminen',
    skip: 'Ohita',
    steps: ['Tervetuloa', 'Ohjain', 'Käyttöön', 'Näkymät', 'Moodle'],
    turnOn: 'Ota SISU+ käyttöön',
    welcome: {
      title: 'Sisu pysyy koskemattomana, kunnes päätät vaihtaa.',
      body: 'Asennuksen jälkeen SISU+ käynnistyy keskeytettynä. Tästä ohjaimesta voit ottaa parannetun käyttöliittymän käyttöön, määrittää Moodlen määräajat ja palata alkuperäiseen Sisuun tarvittaessa.',
      cardTitle: 'Sinä päätät',
      cardBody: 'Parannettu etusivu korvaa opiskelijasivut vasta, kun otat sen käyttöön.',
      syncNotice: 'Ensikäynnistyksen tila ja käyttöönoton eteneminen tallennetaan Chrome synciin.',
    },
    control: {
      title: 'Tutustu ohjaimeen',
      body: 'Tämä kelluva painike on SISU+:n tilan pysyvä paikka. Avaa se keskeyttääksesi laajennuksen, jatkaaksesi sitä tai päivittääksesi Moodle-synkronoinnin.',
      currentMode: 'Nykyinen tila',
      activeMode: 'SISU+ on käytössä',
      nativeMode: 'Alkuperäinen Sisu on käytössä',
    },
    switchOn: {
      title: 'Vaihda parannettuun käyttöliittymään.',
      body: 'SISU+ lataa opiskelijasivun kerran uudelleen ja jatkaa kierrosta parannetussa etusivussa. Voit keskeyttää sen taas samasta ohjaimesta.',
      status: 'Tila',
      active: 'SISU+ on jo käytössä.',
      paused: 'SISU+ on tällä hetkellä keskeytetty.',
    },
    views: {
      title: 'Kaksi näkymää, yksi opintosuunnitelma.',
      dashboardTitle: 'Etusivu',
      dashboardBody:
        'Muokattava yhteenveto aktiivisista kursseista, opintopisteistä, määräajoista, arvosanoista ja opiskelutahdista.',
      timelineTitle: 'Aikajana',
      timelineBody: 'Lukukausittainen suunnittelutaulu, jossa voit siirtää kursseja ja huomata esitietojen ongelmat.',
    },
    moodle: {
      title: 'Yhdistä Moodlen määräajat',
      body: 'Avaa Moodlen kalenterivienti, valitse kaikki tapahtumat ja oma aikaväli, ja liitä luotu URL tähän.',
      openExport: 'Avaa Moodlen kalenterivienti',
      urlLabel: 'Moodlen kalenterin URL',
      validHint: 'Voit viimeistellä nyt tai jättää tämän tyhjäksi ja lisätä sen myöhemmin ohjaimesta.',
      invalidHint: 'URL:n pitää tulla Moodlen kalenteriviennistä ja sisältää kalenteripolku.',
    },
  },
  pausedNotice: 'Keskeytetty tila pitää tämän ohjaimen erillään, kun Sisu hoitaa sivun.',
  status: {
    active: 'Käytössä',
    paused: 'Keskeytetty',
  },
  title: 'SISU+',
  tip: {
    dormantTitle: 'Valmiina kun olet',
    dormantBody: 'SISU+ pysyy lepotilassa keskeytettynä, joten voit käyttää Sisua normaalisti.',
    planningTitle: 'Suunnittelu helpommaksi',
    planningBody: 'SISU+ seuraa esitietoja ja suunniteltuja opetusperiodeja.',
    dashboardTitle: 'Muokkaa omaksi',
    dashboardBody: 'Etusivun widgettejä voi muuttaa reunoista muokkaustilassa.',
  },
  toggle: {
    open: 'Avaa SISU+ ohjaimet',
    close: 'Sulje SISU+ ohjaimet',
  },
};
