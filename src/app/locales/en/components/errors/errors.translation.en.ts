export type ErrorsTranslation = {
  code: string;
  root: {
    title: string;
    subtitle: string;
    guidance: string;
    unknown: string;
  };
};

export const errorsTranslation: ErrorsTranslation = {
  code: 'ERR',
  root: {
    title: 'An error has occurred',
    subtitle: "Whoops, this shouldn't have happened.",
    guidance:
      'Try refreshing the page. If the error continues, click the icon in bottom right corner and send me a screenshot of the error message.',
    unknown: 'Unknown Error',
  },
};
