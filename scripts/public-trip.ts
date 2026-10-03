/** Remove reservation credentials and personal details before Markdown enters the build. */
export function publicTrip(raw: string): string {
  const privateLabel = /^\s*\*\*(?:reserva|reservation|contato|contact|e-mail|email|pagamento|payment|cartão|card|endereço da reserva|booking address):\*\*/i;
  const credential = /\b(?:PIN|senha|password|localizador|confirmation(?: number)?|confirmação|código de (?:acesso|reserva)|booking reference)(?:\s*[:：]\s*|\s+)\S+/i;
  const reservation = /\b(?:[Rr]eserva|[Rr]eservation)\s*[:：]?\s+[A-Z0-9-]{5,}\b/;
  const lines = raw.split('\n').flatMap(line => {
    if (privateLabel.test(line)) return [];
    const match = credential.exec(line) ?? reservation.exec(line);
    if (!match) return [line];
    // Preserve the stop and its public note when a credential was added inline.
    const prefix = line.slice(0, match.index).replace(/[\s;·—\\]+$/, '');
    return /^\s*-\s/.test(prefix) && prefix.includes('](place:') ? [prefix] : [];
  });
  // Removing booking lines must not make a stop consume its next leg or stop.
  return lines.map((line, index) => {
    const next = lines[index + 1]?.trim() ?? '';
    return !next || /^(?:- |#{1,3} )/.test(next) ? line.replace(/\\[ \t]*$/, '') : line;
  }).join('\n');
}
