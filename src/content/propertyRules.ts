const PROPERTY_RULE = /@property\s+[\w-]+\s*\{[^}]*\}/g;

export const extractPropertyRules = (css: string): string => (css.match(PROPERTY_RULE) ?? []).join('\n');

const REGISTERED_ID = 'sisu-plus-property-rules';

// Browsers ignore @property inside shadow roots, which leaves Tailwind's translate, scale and shadow
// variables without initial values. Registrations made by the document apply inside shadow trees too.
export const registerPropertyRules = (css: string): void => {
  if (document.getElementById(REGISTERED_ID)) return;
  const style = document.createElement('style');
  style.id = REGISTERED_ID;
  style.textContent = extractPropertyRules(css);
  document.head.appendChild(style);
};
