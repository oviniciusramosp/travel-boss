import { contextsFromRaw } from './agent-context';
import { revisionOf } from './agent-service';

type Context = ReturnType<typeof contextsFromRaw>[number];
function semantic(context: Context | undefined) {
  if (!context) return null;
  // Lines and revisions are source addresses, not semantic effects. Removing a
  // comment earlier in the file must not report every later date as changed.
  return {
    cities: context.cities,
    budget: context.budget,
    review: context.days.map(day => ({ city: day.city, title: day.title, closedPeriods: day.closedPeriods, closed: day.closed })),
    content: { narratives: context.days.map(day => day.notes.map(note => note.text)), rows: context.rows.map(row => ({ anchor: row.anchor,
      note: row.note, status: row.status, comments: row.comments?.map(comment => comment.text),
      decisions: row.decisions?.map(decision => decision.text) })) },
    schedule: context.rows.map(row => ({ anchor: row.anchor, placeId: row.placeId, label: row.label, time: row.time, departureTime: row.departureTime })),
    periods: context.rows.map(row => ({ anchor: row.anchor, placeId: row.placeId, label: row.label, period: row.period })),
    luggage: { incoming: context.luggage.incoming, outgoing: context.luggage.outgoing,
      stops: context.rows.filter(row => row.luggage).map(row => ({ anchor: row.anchor, placeId: row.placeId, label: row.label })) },
    transfers: context.transfers.map(({ fromLine: _from, toLine: _to, ...transfer }) => transfer),
    errors: context.errors.map(({ line: _line, ...error }) => error),
    warnings: context.warnings,
  };
}
/** No network or writes. Compare every date: luggage edits can affect later days. */
export function previewChange(id: string, before: string, after: string, dates?: readonly string[]) {
  const previous = contextsFromRaw(id, before), next = contextsFromRaw(id, after);
  const allDates = [...new Set([...previous, ...next].map(context => context.date))].sort();
  const changes = allDates.filter(date => !dates || dates.includes(date)).flatMap(date => {
    const from = semantic(previous.find(context => context.date === date));
    const to = semantic(next.find(context => context.date === date));
    const effects = (['cities', 'budget', 'review', 'content', 'schedule', 'periods', 'luggage', 'transfers', 'errors'] as const)
      .filter(key => JSON.stringify(from?.[key]) !== JSON.stringify(to?.[key]));
    return effects.length ? [{ date, effects, before: from, after: to, budgetDelta: {
      food: Math.round(((to?.budget.food ?? 0) - (from?.budget.food ?? 0)) * 100) / 100,
      ticket: Math.round(((to?.budget.ticket ?? 0) - (from?.budget.ticket ?? 0)) * 100) / 100,
    } }] : [];
  });
  return { id, previousRevision: revisionOf(before), revision: revisionOf(after), changedDates: changes.map(change => change.date),
    dates: changes,
    limitations: ['No live routes, opening hours, fares or availability were fetched.',
      'Budgets use the same per-person catalog estimates and authored overrides as the app.',
      'Only computable effects are reported; absence of a conflict is not a feasibility guarantee.'],
  };
}
