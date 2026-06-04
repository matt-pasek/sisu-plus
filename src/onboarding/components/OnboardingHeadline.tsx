import type { CSSProperties } from 'react';

type HeadlineWord =
  | string
  | {
      text: string;
      color?: string;
    };

interface Props {
  lines: HeadlineWord[][];
  size: string;
  baseDelay?: number;
  stagger?: number;
  className?: string;
}

export function OnboardingHeadline({ lines, size, baseDelay = 0, stagger = 0.075, className = '' }: Props) {
  let wordIndex = 0;

  return (
    <h1
      className={['ob-word-headline', className].filter(Boolean).join(' ')}
      style={{ '--ob-headline-size': size } as CSSProperties}
    >
      {lines.map((line, lineIndex) => (
        <span className="ob-word-line" key={lineIndex}>
          {line.map((word, index) => {
            const normalized = typeof word === 'string' ? { text: word } : word;
            const delay = baseDelay + wordIndex * stagger;
            wordIndex += 1;

            return (
              <span className="ob-word-mask" key={`${normalized.text}-${index}`}>
                <span
                  className="ob-word"
                  style={
                    {
                      '--ob-word-delay': `${delay}s`,
                      color: normalized.color ?? 'inherit',
                    } as CSSProperties
                  }
                >
                  {normalized.text}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
