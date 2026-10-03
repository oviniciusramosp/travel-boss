/** Remove reservation credentials and personal details before Markdown enters the build. */
export function publicTrip(raw: string): string {
  const privateLabel = /^\s*\*\*(?:reserva|reservation|contato|contact|e-mail|email|pagamento|payment|cartão|card|endereço da reserva|booking address):\*\*/i;
  const credential = /\b(?:PIN|senha|password|localizador|confirmation(?: number)?|confirmação|código de (?:acesso|reserva)|booking reference)(?:\s*[:：]\s*|\s+)\S+/i;
  const reservation = /\b(?:[Rr]eserva|[Rr]eservation)\s*[:：]?\s+[A-Z0-9-]{5,}\b/;
  return raw.split('\n').flatMap(line => {
    if (privateLabel.test(line)) return [];
    const match = credential.exec(line) ?? reservation.exec(line);
    if (!match) return [line];
    // Preserve the stop and its public note when a credential was added inline.
    const prefix = line.slice(0, match.index).replace(/[\s;·—\\]+$/, '');
    return /^\s*-\s/.test(prefix) && prefix.includes('](place:') ? [prefix] : [];
  }).join('\n');
}
