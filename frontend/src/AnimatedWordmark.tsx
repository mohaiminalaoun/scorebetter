import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type Word = { text: string; script?: 'bn' };

// The wordmark strokes itself on, holds, fades, and loops through the
// translations forever. Timings mirror the CSS animation in styles.css.
const WORDS: Word[] = [
  { text: 'ScoreBetter' },
  { text: 'ভালো স্কোর', script: 'bn' },
  { text: 'Mas Mahusay' },
  { text: 'Puntúa Mejor' },
];

const STEP_MS = 1100 + 1500 + 600;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function AnimatedWordmark() {
  const [reduced] = useState(prefersReducedMotion);
  const [tick, setTick] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setTick((t) => t + 1), STEP_MS);
    return () => clearInterval(timer);
  }, [reduced]);

  // Fit the viewBox to the freshly rendered word so it scales to the full width.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    const text = textRef.current;
    if (!svg || !text) return;
    const fit = () => {
      const b = text.getBBox();
      svg.setAttribute('viewBox', `${b.x - 6} ${b.y - 6} ${b.width + 12} ${b.height + 12}`);
    };
    fit();
    document.fonts?.ready.then(fit);
  }, [tick]);

  const word = WORDS[tick % WORDS.length];

  return (
    <div className="wordmark" aria-label="ScoreBetter">
      <svg ref={svgRef} viewBox="0 0 400 60" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <text
          key={tick}
          ref={textRef}
          x="0"
          y="48"
          className={'wordmark-word' + (word.script === 'bn' ? ' is-bn' : '')}
        >
          {word.text}
        </text>
      </svg>
    </div>
  );
}
