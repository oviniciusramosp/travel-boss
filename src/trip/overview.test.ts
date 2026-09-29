import { describe, expect, it } from 'vitest';
import { intercityHops } from './overview';
import type { RouteHop } from './route';

const point = (id: string) => ({ id, lat: 0, lng: 0 });
const hop = (from: string, to: string, mode?: 'flight' | 'transit'): RouteHop => ({
  from: point(from), to: point(to), ...(mode ? { via: { mode, detail: mode } } : {}),
});

describe('trip overview', () => {
  it('keeps intercity trains, day trips in both directions, and flights', () => {
    const hops = [hop('par-gare-de-lyon', 'mil-centrale'), hop('mil-centrale', 'ven-santa-lucia'), hop('ven-santa-lucia', 'mil-centrale'), hop('rom-fco', 'lis-lis', 'flight'), hop('lis-lis', 'sp-gru', 'flight')];
    expect(intercityHops(hops)).toEqual(hops);
  });

  it('excludes local travel, walks and unknown intercity connections', () => {
    expect(intercityHops([hop('par-casa-do-gui', 'par-trocadero'), hop('mil-duomo', 'rom-colosseum'), hop('rom-fco', 'unknown', 'flight'), hop('rom-fco', 'lis-lis', 'transit')])).toEqual([]);
  });
});
