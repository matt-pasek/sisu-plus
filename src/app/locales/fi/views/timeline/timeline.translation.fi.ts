import { TimelineTranslation } from '@/app/locales/en/views/timeline/timeline.translation.en';

export const timelineTranslation: TimelineTranslation = {
  actions: {
    addCourse: 'Lisää kurssi',
    autoSchedule: 'Aikatauluta automaattisesti',
    confirm: 'Vahvista',
    confirming: 'Vahvistetaan...',
    reset: 'Palauta aikajanan muutokset',
    scheduling: 'Aikataulutetaan...',
  },
  board: {
    completed: 'suoritettu',
    done: 'Valmis',
    dropHere: 'Pudota tähän',
    noCourses: 'Ei kursseja',
    noPeriods: 'Aikajanan periodeja ei ole vielä saatavilla.',
    offeredHere: 'Tarjolla täällä',
    planned: 'Suunniteltu',
    workloadTitle: 'Kuormitus periodissa {{period}}: {{credits}}',
  },
  course: {
    fallback: 'Kurssi',
    dismissPrerequisite: 'Minulla on vastaava esitieto',
    noModule: 'Ei moduulia',
    unnamed: 'Nimetön kurssi',
  },
  pool: {
    empty: 'Jokaisella suunnitellulla kurssilla on opintoperiodi.',
    hidePrevious: 'Piilota aiemmat',
    outsideTimeline: 'Näytetyn aikajanan ulkopuolella',
    searchPlaceholder: 'Haku...',
    showSummer: 'Näytä kesä',
    title: 'Kurssipooli',
    unscheduleDrop: 'Pudota poistaaksesi ajoitus',
    withoutVisiblePeriod: '{{count}} kurssi ilman näkyvää ajoitusperiodia.',
  },
  semester: {
    autumn: 'Syksy',
    spring: 'Kevät',
    now: 'NYT',
  },
  status: {
    active: 'Aktiivinen',
    done: 'Valmis',
    planned: 'Suunniteltu',
  },
  toolbar: {
    issue: '{{count}} ongelma',
    unsaved: '{{count}} tallentamatta',
  },
  title: 'Aikajana',
  validation: {
    missingPeriod: 'Ei järjestetä periodeissa {{periods}}.',
    prerequisite: '{{course}} pitää suorittaa ennen tätä kurssia.',
    requiredCourse: 'vaadittu kurssi',
    unknownModule: 'Tuntematon moduuli',
  },
};
