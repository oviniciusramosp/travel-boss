import { describe, expect, it } from 'vitest';
import { publicTrip } from '../../scripts/public-trip';

describe('public trip privacy', () => {
  it('removes reservation fields and personal details, preserving the public stay', () => {
    const source = '# Trip\n- 14:00 [Hotel](place:hotel) — Check-in\\\n  **Estadia:** 12–14/10\\\n  **Reserva:** Booking · confirmação 9876543210 · PIN 7654\\\n  **E-mail:** guest@example.test\\\n  **Cartão:** Visa 1234\\\n  **Pagamento:** payment details\\\n  **Contato:** +55 111111111\\\n  **Endereço da reserva:** private apartment\\\n  **Endereço:** Public hotel address';
    expect(publicTrip(source)).toBe('# Trip\n- 14:00 [Hotel](place:hotel) — Check-in\\\n  **Estadia:** 12–14/10\\\n  **Endereço:** Public hotel address');
    expect(source).toContain('PIN 7654');
  });
  it('preserves train stops when reservation codes are inline', () => {
    expect(publicTrip('- 10:00 [Station](place:station) — Italo 1234; reserva ABC123; €30')).toBe('- 10:00 [Station](place:station) — Italo 1234');
    expect(publicTrip('  - PIN: 7654\n  - senha: secret')).toBe('');
  });
  it('preserves ordinary travel instructions and prices', () => {
    const source = '- [Café](place:cafe) — Sem reserva; reservar 30 min\n  - comida: €15\n  - status: confirmado\n- [Museu](place:museum) — Ver pinturas e comprar cartão de transporte';
    expect(publicTrip(source)).toBe(source);
  });
});
