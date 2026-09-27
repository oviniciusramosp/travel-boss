import { describe, expect, it } from 'vitest';
import { dayToMarkdown, tripToHtml, tripToMarkdown } from './export';
import { parseTrip } from './parse';

const raw = `# Europa

## Paris
city: paris
dates: 2026-04-02 → 2026-04-06

### Dia 1 — Chegada

- 09:00 [Orly](place:par-ory) — Desembarque
  - comentário: chegar mais cedo?
- [Sumido](place:par-nao-existe)

Notas com <script> e **negrito**.
`;

describe('export', () => {
  const trip = parseTrip('europa', 'content/trips/europa.md', raw);
  const markdown = tripToMarkdown(trip, (slug, placeId) =>
    slug === 'paris' && placeId === 'par-ory'
      ? 'https://maps.example/orly'
      : null,
  );
  const html = tripToHtml(markdown);

  it('rewrites place links and drops the city line', () => {
    expect(markdown).toContain('[Orly](https://maps.example/orly)');
    expect(markdown).not.toContain('city:');
    expect(markdown).not.toContain('place:par-ory');
    expect(markdown).toContain('Sumido (lugar não encontrado)');
    expect(markdown.startsWith('# Europa')).toBe(true);
    expect(markdown).toContain('## Paris');
    expect(markdown).toContain('### Dia 1 — Chegada');
    expect(markdown).toContain('- 09:00 ');
    expect(markdown).not.toContain('comentário');
  });

  it('builds headings, lists and links as html', () => {
    expect(html).toContain('<h1>Europa</h1>');
    expect(html).toContain('<h2>Paris</h2>');
    expect(html).toContain('<a href="https://maps.example/orly">Orly</a>');
    expect(html).toContain('<li>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('<strong>negrito</strong>');
    expect(html).not.toContain('<script>');
  });

  it('round-trips a nested via leg and nests the html list', () => {
    const source = `# Europa

## Paris
city: paris

### Dia 1 — Museu

- 09:00 [Louvre](place:par-louvre) — Entrada
  - via: metrô M14 + RER E · 35 min
- 10:00 [Notre-Dame](place:par-notre-dame)
`;
    const parsed = parseTrip('europa', 'content/trips/europa.md', source);
    const exported = tripToMarkdown(parsed, (_slug, placeId) =>
      `https://maps.example/${placeId}`,
    );
    expect(exported).toContain(
      '- 09:00 [Louvre](https://maps.example/par-louvre) — Entrada\n  - via: metrô M14 + RER E · 35 min\n- 10:00 [Notre-Dame](https://maps.example/par-notre-dame)',
    );

    const again = parseTrip('europa', 'content/trips/europa.md', exported);
    // Export drops `city:`, so the via sits on another line: the rest must match.
    expect(again.cities[0]?.days[0]?.stops[0]?.leg).toEqual({
      ...parsed.cities[0]?.days[0]?.stops[0]?.leg,
      line: expect.any(Number),
    });

    const nested = tripToHtml(exported);
    expect(nested).toMatch(
      /<li>09:00 <a href="https:\/\/maps\.example\/par-louvre">Louvre<\/a> — Entrada\s*<ul>\s*<li>via: metrô M14 \+ RER E · 35 min\s*<\/li>\s*<\/ul>\s*<\/li>/,
    );
    expect(nested).not.toMatch(/<\/li>\s*<ul>\s*<li>via:/);
  });

  it('round-trips a list note and resolves an inline place link', () => {
    const source = `# Europa

## Paris
city: paris

### Dia 1 — Museu

- 09:00 [Louvre](place:par-louvre)
- Lembrar [ingresso](place:par-orsay)
`;
    const parsed = parseTrip('europa', 'content/trips/europa.md', source);
    const exported = tripToMarkdown(parsed, (_slug, placeId) => `https://maps.example/${placeId}`);
    expect(exported).toContain('- Lembrar [ingresso](place:par-orsay)');
    expect(exported).not.toContain('item sem link');
    const html = tripToHtml(exported, (id) => `https://maps.example/${id}`);
    expect(html).toContain('<a href="https://maps.example/par-orsay">ingresso</a>');
  });

  it('writes hard breaks back as they were and as <br> in the html', () => {
    const source = `# Europa

## Paris
city: paris

### Dia 1 — Museu

- 09:00 [Louvre](place:par-louvre) — Entrada\\
  pela pirâmide
  - via: metrô · 12 min
- Lembrar\\
  do ingresso

Fila\\
na entrada.
`;
    const parsed = parseTrip('europa', 'content/trips/europa.md', source);
    const exported = tripToMarkdown(parsed, (_slug, placeId) => `https://maps.example/${placeId}`);
    expect(exported).toContain(
      '- 09:00 [Louvre](https://maps.example/par-louvre) — Entrada\\\n  pela pirâmide\n  - via: metrô · 12 min\n- Lembrar\\\n  do ingresso\n\nFila\\\nna entrada.',
    );
    expect(parseTrip('europa', 'content/trips/europa.md', exported).cities[0]?.days[0]?.stops[0]?.note).toBe(
      'Entrada\npela pirâmide',
    );
    const html = tripToHtml(exported);
    expect(html).toMatch(/— Entrada<br>pela pirâmide\s*<ul>\s*<li>via:/);
    expect(html).toContain('<li>Lembrar<br>do ingresso');
    expect(html).toContain('<p>Fila<br>na entrada.</p>');
  });

  it('leaves decisions out of the markdown, the day copy and the html', () => {
    const source = `# Europa

## Paris
city: paris

### Dia 1 — Museu

- 09:00 [Louvre](place:par-louvre) — Entrada
  - via: metrô · 12 min
  - decisão: 2026-09-27 · manter o Louvre\\
    mesmo acima do orçamento
- Lembrar do ingresso
  - decision: comprar na hora
- 10:00 [Orsay](place:par-orsay)
`;
    const parsed = parseTrip('europa', 'content/trips/europa.md', source);
    const href = (placeId: string) => `https://maps.example/${placeId}`;
    const exported = tripToMarkdown(parsed, (_slug, placeId) => href(placeId));
    expect(exported).toContain(
      '- 09:00 [Louvre](https://maps.example/par-louvre) — Entrada\n  - via: metrô · 12 min\n- Lembrar do ingresso\n- 10:00 [Orsay](https://maps.example/par-orsay)',
    );
    const day = dayToMarkdown(parsed.cities[0]!.days[0]!, href);
    for (const text of [exported, day, tripToHtml(exported)]) {
      expect(text).not.toMatch(/decis|orçamento|comprar na hora/i);
    }
  });

  it('keeps the city header via as written, including 3h10', () => {
    const source = `# Europa

## Paris
city: paris
dates: 2026-04-02 → 2026-04-06
via: trem Frecciarossa · 3h10

### Dia 1 — Saída

- 09:00 [Louvre](place:par-louvre)
`;
    const parsed = parseTrip('europa', 'content/trips/europa.md', source);
    const exported = tripToMarkdown(parsed, () => 'https://maps.example/par-louvre');
    expect(exported).toContain('2026-04-02 → 2026-04-06\nvia: trem Frecciarossa · 3h10');
    expect(exported).not.toContain('city:');
    const again = parseTrip('europa', 'content/trips/europa.md', exported);
    expect(again.cities[0]?.leg).toEqual({ ...parsed.cities[0]?.leg, line: expect.any(Number) });
    expect(tripToHtml(exported)).toContain('<p>via: trem Frecciarossa · 3h10</p>');
  });

  it('leaves the city budget out of the export, like the city slug', () => {
    const source = `# Europa

## Paris
city: paris
dates: 2026-10-04 → 2026-10-11
budget: Comida €47,50 · ingressos €30
via: trem Frecciarossa · 3h10

### Dia 1 — Museu

- 09:00 [Louvre](place:par-louvre)
`;
    const parsed = parseTrip('europa', 'content/trips/europa.md', source);
    const exported = tripToMarkdown(parsed, () => 'https://maps.example/par-louvre');
    expect(exported).toContain('## Paris\n2026-10-04 → 2026-10-11\nvia: trem Frecciarossa · 3h10\n');
    expect(exported).not.toContain('budget:');
    expect(tripToHtml(exported)).not.toContain('budget');
  });

  it('copies one day as markdown, with the via nested under its stop', () => {
    const source = `# Europa

## Paris
city: paris

### Dia 1 — Museu

- 09:00 [Louvre](place:par-louvre)
  - via: metrô · 12 min
- 10:00 [Orsay](place:par-orsay)

Fila na entrada.
`;
    const day = parseTrip('europa', 'content/trips/europa.md', source).cities[0]?.days[0];
    expect(day).toBeTruthy();
    const markdown = dayToMarkdown(day!, (placeId) => `https://maps.example/${placeId}`);
    expect(markdown.startsWith('### Dia 1 — Museu')).toBe(true);
    expect(markdown).toContain('- 09:00 [Louvre](https://maps.example/par-louvre)\n  - via: metrô · 12 min');
    expect(markdown).toContain('Fila na entrada.');
    expect(markdown).not.toContain('# Europa');
    expect(markdown).not.toContain('## Paris');
  });
});
