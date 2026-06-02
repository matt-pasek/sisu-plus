import { LandingTranslation } from '@/app/locales/en/landing/landing.translation.en';

export const landingTranslation: LandingTranslation = {
  nav: {
    features: 'Ominaisuudet',
    privacy: 'Tietosuoja',
    roadmap: 'Tiekartta',
    install: 'Asenna',
    home: 'Etusivu',
    addToChrome: 'Lisää Chromeen',
    backToSisu: 'Takaisin Sisu+:aan',
  },
  hero: {
    badge: 'Uusi',
    shipped: 'v{{version}} julkaistu',
    titleStart: 'Sisu jonka ansaitsemme,',
    titleAccent: 'vihdoin.',
    body: 'Selainlaajennus joka korjaa Sisun. Etusivu, aikajana, opintorakenne, ilmoittautumiset. Kaikki mitä ennen piti kaivaa esiin, nyt yhdessä paikassa. Opiskelijoille, opiskelijalta.',
    addToChromeFree: 'Lisää Chromeen - ilmainen',
    sourceCode: 'Lähdekoodi',
    seeChanged: 'Katso mikä muuttui',
    activeUsers: '25+ aktiivista Chrome-käyttäjää',
    mobileNote: 'Sisu+ ei ole vielä optimoitu mobiililaitteille.',
  },
  features: {
    kicker: 'Mitä sisältä löytyy',
    title: 'Vähemmän kaivelua, enemmän tietoa seuraavasta askeleesta.',
    body: 'Sisu piilottaa paljon. Kurssitiedot eri sivuilla, määräajat haudattuna Moodleen, opintosuunnitelmasi välilehdissä jotka eivät yhdisty. Sisu+ kokoaa kaiken yhteen.',
    cards: [
      {
        title: 'Etusivu, josta on heti hyötyä',
        body: 'Opintopisteet, arvosanat, opinto-oikeus, aktiiviset kurssit ja määräajat näkyvät yhdessä rauhallisessa näkymässä.',
      },
      {
        title: 'Aikajana jota voi muokata',
        body: 'Siirrä suunniteltuja kursseja periodien välillä, tarkista muutokset ja vahvista päivitetty ajoitus takaisin Sisuun.',
      },
      {
        title: 'Varoitukset oikealla hetkellä',
        body: 'Esitieto- ja ajoitusongelmat pysyvät poissa tieltä, kunnes alat muuttaa suunnitelmaa.',
      },
      {
        title: 'Opintorakenne',
        body: 'Koko tutkintosuunnitelmasi yhdessä näkymässä. Näe mikä lasketaan mihinkin, tarkista ilmoittautumistilanne, valitse suoritustapa. Kurssiversion vaihtaminenkin onnistuu.',
      },
      {
        title: 'Kurssin tiedot ilman klikkausta',
        body: 'Arvosana, arvosteluasteikko, suoritustapa, suorituspäivä. Kaikki mikä ennen vei kolme klikkausta löytyy nyt yhdeltä kortilta.',
      },
      {
        title: 'Ilmoittautumiset yhdessä paikassa',
        body: 'Ilmoittaudu, peruuta tai peru ilmoittautuminen suoraan Sisu+:ssa. Oikeaa sivua ei tarvitse enää etsiä Sisusta.',
      },
    ],
  },
  privacy: {
    kicker: 'Selaimesi, sinun tietosi',
    title: 'Tietosi pysyvät omalla koneellasi. Piste.',
    body: 'Sisu+ toimii suoraan Sisun sisällä - ei tiliä, ei palvelinta, eikä kukaan tallenna opintosuunnitelmaasi muualle. Kaikki pysyy selaimessasi juuri siellä, mihin sen jätit.',
    points: [
      'Toimii Sisun sisällä samassa selaimen välilehdessä',
      'Lukee kurssejasi ja aikatauluasi samalla tavalla kuin sinä',
      'Tallentaa asetukset laitteellesi, ei palvelimillemme',
      'Tietosi eivät poistu koneeltasi',
    ],
  },
  roadmap: {
    kicker: 'Mitä on tulossa',
    title: 'Korjataan asiat, jotka oikeasti hidastavat.',
    body: 'Suunnitelma on yksinkertainen: vähemmän klikkauksia tarvittavan tiedon löytämiseen, selkeämmät kurssitiedot ja aikajana, joka ei pakota arvaamaan. Tuetut yliopistot ensin, sitten lisää kampuksia pyyntöjen mukaan.',
    columns: [
      {
        version: 'v1.0',
        title: 'Ensimmäinen julkaisu',
        status: 'Julkaistu',
        items: [
          'Henkilökohtainen etusivu',
          'Moodlen määräaikanäkymä',
          'Muokattava opintoaikajana',
          'Esitietovaroitukset',
        ],
      },
      {
        version: 'v1.2',
        title: 'Kurssinhallinta',
        status: 'Julkaistaan nyt',
        items: [
          'Opintorakenne',
          'Suoritukset ja kurssitiedot',
          'Ilmoittautumiset',
          'Kurssiversion hallinta',
          'Suomen kieli',
        ],
        current: true,
      },
      {
        version: 'Seuraavaksi',
        title: 'Lisää syvyyttä',
        status: 'Suunnitteilla',
        items: ['Kalenterinäkymä', 'Mobiilinäkymän viimeistely', 'Lisää aikajanan ohjausta', 'Lisää yliopistoja'],
      },
    ],
  },
  support: {
    kicker: 'Tue projektia',
    title: 'Tykkäätkö Sisu+:sta ja haluat tukea kehitystä?',
    body: 'Tarjoa minulle mansikka-lime-energiajuoma Ko-fissa, niin toimitan uusia ominaisuuksia vielä nopeammin. Se auttaa kattamaan pienet kulut ja myöhäisillan viimeistelyt, joilla Sisu+ pysyy liikkeessä.',
    aria: 'Tue Sisu+:n kehitystä Ko-fissa',
    action: 'Syötä minulle akkuja',
    hint: 'Tue kehitystä Ko-fin kautta',
  },
  universities: {
    kicker: 'Missä se toimii',
    title: 'Sinun yliopistosi, sinun Sisu+.',
    live: 'Tuetut yliopistot',
    requestTitle: 'Haluatko sen omaan yliopistoosi?',
    requestBody:
      'Sisu+ on rakennettu tukemaan suomalaisia Sisu-yliopistoja. Jos yliopistoasi ei ole listalla, lähetä minulle Sisun URL ja voin tarkistaa tuen.',
    steps: [
      'yliopistosi nimen ja Sisun URL-osoitteen kanssa',
      'Varmistamme yhdessä, että kaikki toimii',
      'Kampuksesi saa saman selkeämmän etusivun ja aikajanan',
    ],
    emailStrong: 'Lähetä sähköpostia',
    emailRest: 'yliopistosi nimen ja Sisun URL-osoitteen kanssa',
    action: 'Lähetä viesti yliopiston lisäämiseksi',
  },
  footer: {
    copyright: 'Kaikki oikeudet pidätetään.',
    affiliation: 'Ei yhteyttä tuettuihin yliopistoihin tai Funidata Oy:hyn.',
    privacyPolicy: 'Tietosuojakäytäntö',
    sourceCode: 'Lähdekoodi',
    supportDevelopment: 'Tue kehitystä',
    contact: 'Yhteys',
    myGithub: 'GitHubini',
  },
  policy: {
    kicker: 'Tietosuojakäytäntö',
    title: 'Sisu+:n tietosuojakäytäntö',
    effectiveDate: 'Voimassa alkaen: 26. huhtikuuta 2026',
    intro: 'Sisu+ on selainlaajennus, joka parantaa Sisun opiskelusuunnittelukokemusta.',
    sections: [
      {
        title: 'Laajennuksen käsittelemät tiedot',
        body: [
          'Sisu+ voi käyttää käyttäjän aktiivisen Sisu-istunnon tietoja, kuten opintosuunnitelmia, kursseja, opintopisteitä, ilmoittautumisia, etenemistietoja ja muuta kirjautuneelle käyttäjälle saatavilla olevaa opintosuunnitteludataa tuetuilla Sisu-verkkotunnuksilla, kuten https://sisu.lut.fi ja https://sisu.lab.fi.',
          'Sisu+ voi tilapäisesti lukea Sisun valtuutusotsakkeita ja tarvittavia istuntoevästeitä pyytääkseen Sisu API -dataa kirjautuneen käyttäjän puolesta.',
          'Jos käyttäjä ottaa Moodle-määräaikojen integraation käyttöön, Sisu+ tallentaa käyttäjän antaman Moodle-kalenterin URL-osoitteen ja käyttää sitä kalenteri- ja määräaikatietojen hakemiseen.',
          'Sisu+ tallentaa laajennuksen asetukset, käyttötilan ja Moodle-määrityksen Chromen tallennustilaan.',
        ],
      },
      {
        title: 'Miten tietoja käytetään',
        body: [
          'Tietoja käytetään vain Sisu+:n ominaisuuksien tarjoamiseen selaimessa, kuten etusivunäkymiin, opintojen etenemiseen, aikajanasuunnitteluun, kurssitietoihin ja valinnaiseen Moodle-määräaikanäkymään.',
        ],
      },
      {
        title: 'Tietojen jakaminen',
        body: [
          'Sisu+ ei myy käyttäjätietoja.',
          'Sisu+ ei käytä käyttäjätietoja mainontaan.',
          'Sisu+ ei lähetä käyttäjätietoja kehittäjän omille palvelimille.',
          'Sisu+ viestii Sisun ja Moodlen kanssa vain siltä osin kuin laajennuksen käyttäjälle näkyvät ominaisuudet sitä tarvitsevat.',
        ],
      },
      {
        title: 'Tietojen tallennus',
        body: [
          'Sisu+ tallentaa asetukset ja tilapäiset istuntotiedot Chromen laajennusten tallennusrajapintojen avulla. Todennus- ja istuntotietoja käytetään vain Sisu-datan hakemiseen nykyisen selainistunnon aikana.',
        ],
      },
      {
        title: 'Etäkoodi',
        body: ['Sisu+ ei suorita etä-JavaScriptiä tai etäkoodia.'],
      },
      {
        title: 'Yhteys',
        body: [
          'Jos sinulla on kysyttävää tästä tietosuojakäytännöstä, ota yhteyttä osoitteeseen contact@matt-pasek.dev.',
        ],
      },
    ],
  },
  preview: {
    dashboard: 'Etusivu',
    timeline: 'Aikajana',
    moodleDeadlines: 'Moodlen määräajat',
    activeCourses: 'Aktiiviset kurssit',
    thisSemester: 'Tämä lukukausi',
    live: 'LIVE',
    spring: 'Kevät 2026',
    timelineBody: 'Vedä kursseja, tarkista opintopisteet ja vahvista takaisin Sisuun.',
    reset: 'Palauta',
    confirm: 'Vahvista',
    due: 'Erääntyy {{date}}',
    periods: ['Periodi 3', 'Periodi 4', 'Kesä', 'Periodi 1'],
    summerRange: 'Kesä - elo',
    regularRange: 'Maalis - touko',
    creditsCurrent: '12 / 100 op',
  },
  releasePreview: {
    aria: 'Sisu+:n julkaisun kohokohdat',
    kicker: 'Julkaisunäkymä',
    title: 'Opintosuunnitelma toimii vihdoin yhtenä kokonaisuutena.',
    version: 'v1.2',
    structure: {
      code: 'Tietotekniikan kandidaatti',
      title: 'Opintorakenne',
      credits: '124 / 180 op',
      done: 'valmis',
      ready: 'valmis',
    },
    checklist: [
      'Pakolliset opinnot lasketaan oikeaan moduuliin',
      'Suoritustapa valitaan ennen ilmoittautumista',
      'Kurssiversion päivitys valmiina vuodelle 2027-2028',
    ],
    cards: [
      {
        eyebrow: 'Päivitä kurssit',
        title: 'Uudet versiot ilman Sisu-selailua',
        body: 'Näe vanhentuneet suunnitellut kurssit, vertaa kohdeversioon ja päivitä suunnitelma yhdessä näkymässä.',
        meta: '3 päivitystä',
      },
      {
        eyebrow: 'Suoritustapa',
        title: 'Valitse oikea reitti ennen ilmoittautumista',
        body: 'Tutkinto-opintojen suoritustavat pysyvät kurssikortilla, joten tentti- ja luentovaihtoehdot eivät katoa.',
        meta: 'tapa 2',
      },
      {
        eyebrow: 'Ilmoittautumiset',
        title: 'Ilmoittaudu, peru tai poista samasta paikasta',
        body: 'Toteutukset näkyvät opintosuunnitelman yhteydessä, eivät toisella Sisu-sivulla jota pitää etsiä.',
        meta: 'auki nyt',
      },
    ],
  },
  heroShowcase: {
    aria: 'Visuaalinen esitys siitä, miten Sisu+ kokoaa hajallaan olevat Sisun opintosuunnittelutoiminnot',
    ghostTitle: 'sisu.university.fi/student',
    ghostTabs: {
      plan: 'Suunnitelma',
      timing: 'Ajoitus',
      registration: 'Ilmoittautuminen',
    },
    ghostRows: [
      { label: 'Kurssiversio', value: 'piilossa', tone: 'muted' },
      { label: 'Moodlen määräaika', value: 'muualla', tone: 'warn' },
      { label: 'Suoritustapa', value: '3 klikkausta', tone: 'danger' },
      { label: 'Kurssitiedot', value: 'uusi välilehti', tone: 'muted' },
    ],
    productKicker: 'Sisu+ kerros',
    productTitle: 'Yksi ohjausnäkymä opinnoille.',
    productStatus: 'Sisun sisällä',
    structure: {
      label: 'Opintorakenne',
      title: 'Tietotekniikan kandidaatti',
      credits: '124 / 180 op',
      meta: 'tutkinnon eteneminen',
    },
    panels: [
      {
        label: 'Aikajana',
        title: 'Siirrä kursseja periodien välillä',
        body: 'Muokkaa suunnitelmaa, tarkista varoitukset ja vahvista takaisin Sisuun.',
        stat: '12 op',
      },
      {
        label: 'Kurssiversiot',
        title: 'Vanhat kurssit löytyvät ajoissa',
        body: 'Huomaa vanhat suunnitellut versiot ennen ilmoittautumista tai ajoituksen sotkeutumista.',
        stat: 'tarkista',
      },
      {
        label: 'Ilmoittautuminen',
        title: 'Ilmoittautuminen oikeassa kontekstissa',
        body: 'Valitse toteutus poistumatta opintosuunnitelmasta.',
        stat: 'auki',
      },
    ],
    command: {
      label: 'Mikä muuttui',
      title: 'Sisu ei tunnu enää hajanaiselta.',
      body: 'Määräajat, eteneminen, kurssitiedot, versiot ja ilmoittautumiset nousevat esiin silloin kun niitä tarvitset.',
    },
    signals: {
      users: '25+ aktiivista käyttäjää',
      local: 'Ei tiliä tai palvelinta',
      sisu: 'Toimii Sisun sisällä',
    },
  },
};
