import { describe, expect, it } from 'vitest';
import { previewChange } from './agent-preview';

const raw = `# Trip
## Paris
city: paris
dates: 2026-10-04 → 2026-10-06
budget: comida €20
### Dia 1
- 09:00 [Louvre](place:par-louvre) — Saída com as malas
  - comentário: confira o horário
- 12:00 [Café](place:par-cedric-grolet-meurice) — Almoço
  - comida: €15
- 14:00 [Orly](place:par-ory)
### Dia 2
- 10:00 [Louvre](place:par-louvre)
### Dia 3
Narrativa do último dia.
- 10:00 [Louvre](place:par-louvre) — Guardar as malas
`;
describe('semantic edit preview', () => {
  it('reports budget deltas and respects authored zero without touching source', () => {
    const preview = previewChange('test', raw, raw.replace('comida: €15', 'comida: €0'));
    expect(preview.changedDates).toEqual(['2026-10-04']);
    expect(preview.dates[0]?.effects).toContain('budget');
    expect(preview.dates[0]?.before?.budget.food).toBe(15);
    expect(preview.dates[0]?.after?.budget.food).toBe(0);
    expect(preview.dates[0]?.budgetDelta.food).toBe(-15);
  });
  it('recalculates future dates when an earlier luggage action changes', () => {
    const preview = previewChange('test', raw, raw.replace('Saída com as malas', 'Visita'));
    expect(preview.changedDates).toEqual(['2026-10-04', '2026-10-05', '2026-10-06']);
    expect(preview.dates.every(date => date.effects.includes('luggage'))).toBe(true);
    expect(preview.dates[1]?.before?.luggage.incoming).toBe(true);
    expect(preview.dates[1]?.after?.luggage.incoming).toBe(false);
  });
  it('reports changed period boundaries when lunch becomes dinner', () => {
    const preview = previewChange('test', raw, raw.replace('— Almoço', '— Jantar'));
    expect(preview.dates[0]?.effects).toContain('periods');
    expect(preview.dates[0]?.after?.periods.find(row => row.placeId === 'par-cedric-grolet-meurice')?.period).toBe('evening');
  });
  it('reports resolved comments on their date and ignores line shifts on later dates', () => {
    const preview = previewChange('test', raw, raw.replace('  - comentário: confira o horário\n', ''));
    expect(preview.changedDates).toEqual(['2026-10-04']);
    expect(preview.dates[0]?.effects).toEqual(['content']);
    expect(preview.limitations.join(' ')).toContain('No live routes');
  });
  it('shows plain note changes even when they do not change computed timing or costs', () => {
    const preview = previewChange('test', raw, raw.replace('— Almoço', '— Almoço na área coberta'));
    expect(preview.changedDates).toEqual(['2026-10-04']);
    expect(preview.dates[0]?.effects).toContain('content');
    expect(preview.dates[0]?.after?.content.rows[1]?.note).toBe('Almoço na área coberta');
  });
  it('reports same-period time changes even when no network route can be checked', () => {
    const preview = previewChange('test', raw, raw.replace('09:00', '10:00'));
    expect(preview.dates[0]?.effects).toContain('schedule');
    expect(preview.dates[0]?.after?.schedule[0]?.time).toBe('10:00');
  });
  it('reports verified boarding conflicts from the same departure calculations as the app', () => {
    const value = '# Trip\n## Paris\ncity: paris\ndates: 2026-10-04 → 2026-10-04\n### Dia 1\n- 09:00 [Orly](place:par-ory)\n  - via: trem teste · 30 min\n  - embarque: 2026-10-04 · trem teste · A → B · 09:10 → 09:40\n- 10:00 [Louvre](place:par-louvre)\n';
    const preview = previewChange('test', value, value.replace('09:10 → 09:40', '08:50 → 09:20'));
    expect(preview.dates[0]?.effects).toContain('transfers');
    expect(preview.dates[0]?.before?.transfers[0]?.legs[0]?.timing?.conflict).toBe(false);
    expect(preview.dates[0]?.after?.transfers[0]?.legs[0]?.timing?.conflict).toBe(true);
  });
  it('reports removed dates and can scope the output while computing incoming state from the whole trip', () => {
    const preview = previewChange('test', raw, raw.slice(0, raw.indexOf('### Dia 3')), ['2026-10-06']);
    expect(preview.changedDates).toEqual(['2026-10-06']);
    expect(preview.dates[0]?.after).toBeNull();
    const scoped = previewChange('test', raw, raw.replace('Saída com as malas', 'Visita'), ['2026-10-05']);
    expect(scoped.dates[0]?.before?.luggage.incoming).toBe(true);
  });
});
