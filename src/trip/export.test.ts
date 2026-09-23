import { describe, expect, it } from 'vitest';
import { tripToHtml, tripToMarkdown } from './export';
import { parseTrip } from './parse';

const raw = `# Europa

## Paris
city: paris
dates: 2026-04-02 → 2026-04-06

### Dia 1 — Chegada

- 09:00 [Orly](place:par-ory) — Desembarque
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
});
