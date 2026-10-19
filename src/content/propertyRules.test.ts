/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { extractPropertyRules } from './propertyRules';

const css = `
@layer utilities {
  .translate-x-3 { --tw-translate-x: calc(.25rem * 3); translate: var(--tw-translate-x) var(--tw-translate-y); }
}
@property --tw-translate-x {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
`;

describe('extractPropertyRules', () => {
  test('keeps every @property rule and nothing else', () => {
    const rules = extractPropertyRules(css);
    expect(rules).toContain('@property --tw-translate-x');
    expect(rules).toContain('initial-value: 0 0 #0000;');
    expect(rules).not.toContain('.translate-x-3');
    expect(rules.match(/@property/g)).toHaveLength(2);
  });

  test('returns an empty string when there are none', () => {
    expect(extractPropertyRules('.a { color: red; }')).toBe('');
  });
});
