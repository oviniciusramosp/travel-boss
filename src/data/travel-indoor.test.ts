import { describe, expect, it } from 'vitest';
import lower from '../../public/maps/louvre/niveau-1.svg?raw';
import ground from '../../public/maps/louvre/niveau0.svg?raw';
import upper from '../../public/maps/louvre/niveau1.svg?raw';
const plans: Record<number, string> = { [-1]: lower, 0: ground, 1: upper };
import { louvreRoute } from './travel-indoor';

describe('Louvre visit plan', () => {
  it('fits the 13:30–17:00 visit including reception and departure', () => {
    expect(louvreRoute.reduce((total, step) => total + step.minutes, 0)).toBeLessThanOrEqual(210);
    expect(louvreRoute.at(0)?.floor).toBe(-2);
    expect(louvreRoute.at(-1)?.floor).toBe(-2);
  });
  it('ships valid SVG roots for every used floor, with pins inside the plan', () => {
    for (const step of louvreRoute) {
      const svg = plans[Math.max(-1, step.floor)];
      expect(svg).toMatch(/^<svg\s+xmlns=/);
      expect(svg).not.toMatch(/<script|<foreignObject/);
      expect(step.point[0]).toBeGreaterThanOrEqual(0);
      expect(step.point[0]).toBeLessThan(949.2);
      expect(step.point[1]).toBeGreaterThanOrEqual(0);
      expect(step.point[1]).toBeLessThan(477.6);
    }
  });
  it('places gallery pins within the corresponding room in the official drawing', () => {
    for (const step of louvreRoute.filter(step => step.floor !== -2)) {
      const room = step.room.match(/(\d+)$/)?.[1];
      const svg = plans[Math.max(-1, step.floor)];
      const rect = svg.match(new RegExp(`<rect[^>]*id="_${room}"[^>]*>`))?.[0];
      expect(rect, step.room).toBeDefined();
      const attr = (name: string) => Number(rect?.match(new RegExp(` ${name}="([^"]+)"`))?.[1]);
      expect(step.point[0]).toBeGreaterThanOrEqual(attr('x'));
      expect(step.point[0]).toBeLessThanOrEqual(attr('x') + attr('width'));
      expect(step.point[1]).toBeGreaterThanOrEqual(attr('y'));
      expect(step.point[1]).toBeLessThanOrEqual(attr('y') + attr('height'));
    }
  });
});
