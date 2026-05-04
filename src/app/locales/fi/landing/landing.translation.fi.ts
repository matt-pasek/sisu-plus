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
    body: 'Selainlaajennus, joka ajattelee Sisu-kokemuksen uudelleen. Selkeämpi etusivu, opintojen aikajana, Moodle-integraatio ja muuta. Opiskelijoille, opiskelijalta.',
    addToChromeFree: 'Lisää Chromeen - ilmainen',
    sourceCode: 'Lähdekoodi',
    seeChanged: 'Katso mikä muuttui',
    mobileNote: 'Sisu+ ei ole vielä optimoitu mobiililaitteille.',
  },
  features: {
    kicker: 'Etusivu ja aikajana',
    title: 'Vähemmän kaivelua, enemmän tietoa seuraavasta askeleesta.',
    body: 'Ensimmäinen julkaisu korjaa ne asiat, jotka vievät eniten aikaa: tilanteen tarkistamisen, Moodlen määräaikojen seuraamisen ja kurssien siirtämisen rikkomatta vahingossa esitietoja.',
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
        version: 'v1.0.0',
        title: 'Ensimmäinen julkaisu',
        status: 'Julkaistu nyt',
        items: [
          'Henkilökohtainen etusivu',
          'Moodlen määräaikanäkymä',
          'Muokattava opintoaikajana',
          'Esitietovaroitukset',
        ],
        current: true,
      },
      {
        version: 'Seuraavaksi',
        title: 'Lisää apua suunnitteluun',
        status: 'Työn alla',
        items: [
          'Selkeämmät kurssitiedot',
          'Kalenterilähtöinen opintosuunnittelu',
          'Paremmat tyhjät tilat',
          'Lisää aikajanan ohjausta',
        ],
      },
      {
        version: 'Myöhemmin',
        title: 'Laajennus kampuksille',
        status: 'Suunnitteilla',
        items: [
          'Lisää Sisu-yliopistoja',
          'Palautteeseen perustuvat parannukset',
          'Mobiilinäkymän viimeistely',
          'Nopeampi käyttöönotto',
        ],
      },
    ],
  },
  support: {
    kicker: 'Tue projektia',
    title: 'Tykkäätkö Sisu+:sta ja haluat tukea kehitystä?',
    body: 'Tarjoa minulle mansikka-lime-energiajuoma Ko-fissa, niin toimitan uusia ominaisuuksia vielä nopeammin. Se auttaa kattamaan pienet kulut ja myöhäisillan viimeistelyt, joilla Sisu+ pysyy liikkeessä.',
    aria: 'Tue Sisu+:n kehitystä Ko-fissa',
    action: 'Syötä minulle akkuja',
    hint: '(Ko-fi avautuu uuteen välilehteen)',
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
};
