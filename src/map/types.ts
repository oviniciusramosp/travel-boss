export type MapPinKind = 'place' | 'hotel' | 'stop';

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  /** Dot color. Chrome stays achromatic; only map dots may use category color. */
  color?: string;
  kind?: MapPinKind;
  /** Material ligature or pin markup. Drawn in a later phase. */
  icon?: string;
  featured?: boolean;
  number?: number;
};

export type MapPadding = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type MapRadius = { lat: number; lng: number; km: number } | null;

export type MapRouteSegment = {
  mode: 'walk' | 'transit';
  latlngs: [number, number][];
  color?: string;
  /** Neutral chord. Dashed, unlike a transit spine. */
  dash?: boolean;
};

/** Numbered stop on the trip overview. `via` is the departure toward the next city. */
export type MapOverviewCity = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  number: number;
  via?: string;
};

export type MapHandle = {
  /** Replace every pin of this kind. Other kinds stay. */
  setPins(kind: MapPinKind, pins: MapPin[]): void;
  setRadius(ring: MapRadius): void;
  /** Walk dashes and transit spines. Pass [] to clear. */
  setRoute(segments: MapRouteSegment[], opts?: { fit?: boolean }): void;
  /**
   * Trip overview: numbered cities and dashed great-circle connectors.
   * `null` clears it. `fade` (default when there are cities) dims stop pins.
   * `fit` frames the cities. Neither option moves the camera otherwise.
   */
  setOverview(cities: readonly MapOverviewCity[] | null, opts?: { fit?: boolean; fade?: boolean }): void;
  /** Highlight one overview node. `null` clears it. Does not move the camera. */
  hoverOverview(id: string | null): void;
  /** Click on an overview node. Returns an unsubscribe. */
  onOverview(fn: (id: string) => void): () => void;
  fit(): void;
  /** Whether a coordinate is inside the current map view. */
  inView(lat: number, lng: number): boolean;
  /** Center a coordinate. Zoom defaults to a block-level view. */
  flyTo(lat: number, lng: number, zoom?: number): void;
  /** Highlight a pin without moving the camera. `null` clears the hover. */
  hover(id: string | null): void;
  /** Highlight and frame the pin in the padded view. */
  select(id: string): void;
  /**
   * Visual selection. `null` clears it without moving the camera.
   * An id selects, same as `select`.
   */
  highlight(id: string | null): void;
  /** Returns an unsubscribe. Pin hover, not list hover. */
  onHover(fn: (id: string | null) => void): () => void;
  /** Returns an unsubscribe. */
  onSelect(fn: (id: string) => void): () => void;
  /** Panel and other chrome. `fit` and `select` center in the free area. */
  setPadding(padding: MapPadding): void;
};
