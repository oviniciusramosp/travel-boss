import type { LouvreFloor } from './travel-indoor';

export interface IndoorPathPart {
  floor: LouvreFloor;
  /** Drawing coordinates on the official plan; an indicative walking centreline. */
  points: readonly (readonly [number, number])[];
}

// One incoming route per visit step. Floor changes are separate parts: never draw
// a straight line between floors. Traced against the official plans (2026-09-27).
// Denon follows the Louvre Masterpieces trail via 703, 706, 708, 710 and 711,
// avoiding the closed room 709. Richelieu uses the official Cour Puget trail.
// These are planning lines, not surveyed door positions or live indoor navigation.
export const louvrePaths: readonly (readonly IndoorPathPart[])[] = [
  [{ floor: -2, points: [[495, 280], [530, 280]] }],
  [
    { floor: -2, points: [[530, 280], [530, 315]] },
    { floor: -1, points: [[530, 325], [530, 351], [530, 374]] },
    { floor: 0, points: [[532, 354], [580, 354], [640, 354]] },
    { floor: 1, points: [[662, 352], [662, 382], [656, 410], [656, 422], [600, 427], [533, 429], [533, 392]] },
  ],
  [{ floor: 1, points: [[533, 392], [533, 354], [481, 354]] }],
  [
    { floor: 1, points: [[481, 354], [533, 354], [585, 354], [640, 354]] },
    { floor: 0, points: [[640, 354], [640, 343], [680, 343], [735, 343], [805, 343], [805, 332], [848, 332], [848, 343], [906, 343]] },
  ],
  [
    { floor: 0, points: [[906, 343], [870, 343], [848, 343], [848, 332], [830, 332]] },
    { floor: -1, points: [[828, 326], [828, 349]] },
  ],
  [
    { floor: -1, points: [[828, 349], [828, 326], [815, 313], [752, 313], [737, 297], [737, 275], [720, 252], [650, 252], [590, 252]] },
    { floor: -2, points: [[578, 280], [570, 280]] },
  ],
  [
    { floor: -2, points: [[570, 280], [530, 280], [530, 224]] },
    { floor: -1, points: [[531, 180], [531, 135], [550, 135], [570, 119], [600, 119]] },
  ],
  [{ floor: -1, points: [[600, 119], [570, 119], [550, 135], [531, 135], [515, 135], [480, 135], [466, 111]] }],
  [
    { floor: -1, points: [[466, 111], [480, 135], [515, 135], [531, 135], [531, 180]] },
    { floor: -2, points: [[530, 224], [530, 280], [490, 280]] },
  ],
];
