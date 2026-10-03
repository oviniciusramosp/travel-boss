import { describe, expect, it } from 'vitest';
import { changedStopKeys } from './diff';
import { parseTrip } from './parse';
import { stopKey } from './view-state';

function trip(body: string) {
  return parseTrip(
    'europa',
    'content/trips/europa.md',
    `# Europa

## Paris
city: paris

### Dia 1 — Chegada

${body}
`,
  );
}

const base = `- 09:00 [Louvre](place:par-louvre) — Entrada
- 10:00 [Orsay](place:par-orsay)`;

describe('changedStopKeys', () => {
  it('detects a period boundary change even when the stop text is unchanged', () => {
    const before = trip('- [Louvre](place:par-louvre)\n  - período: manhã');
    const after = trip('- [Louvre](place:par-louvre)\n  - período: tarde');
    expect(changedStopKeys(before, after).size).toBe(1);
  });
  const louvre = stopKey('paris', 0, 'Dia 1 — Chegada', 0, 'par-louvre', 'Louvre');
  const orsay = stopKey('paris', 0, 'Dia 1 — Chegada', 1, 'par-orsay', 'Orsay');

  it('marks nothing on the first document and nothing when the text is the same', () => {
    const parsed = trip(base);
    expect(changedStopKeys(null, parsed).size).toBe(0);
    expect(changedStopKeys(parsed, trip(base)).size).toBe(0);
  });

  it('marks a new stop and an edited stop, not the untouched neighbor', () => {
    const edited = trip(`- 09:00 [Louvre](place:par-louvre) — Fila
- 10:00 [Orsay](place:par-orsay)
- 12:00 [Notre-Dame](place:par-notre-dame)`);
    const keys = changedStopKeys(trip(base), edited);
    expect(keys.has(louvre)).toBe(true);
    expect(keys.has(orsay)).toBe(false);
    expect(
      keys.has(stopKey('paris', 0, 'Dia 1 — Chegada', 2, 'par-notre-dame', 'Notre-Dame')),
    ).toBe(true);
  });

  it('marks a stop when its via changes', () => {
    const withVia = trip(`- 09:00 [Louvre](place:par-louvre) — Entrada
  - via: metrô · 12 min
- 10:00 [Orsay](place:par-orsay)`);
    expect(changedStopKeys(trip(base), withVia).has(louvre)).toBe(true);
    expect(changedStopKeys(trip(base), withVia).has(orsay)).toBe(false);
  });
});
