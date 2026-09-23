export type MapPinKind = 'place' | 'hotel' | 'stop';

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  /** Dot color. Chrome stays achromatic; only map dots may use category color. */
  color?: string;
  kind?: MapPinKind;
};

export type MapRadius = { lat: number; lng: number; km: number } | null;

export type MapRouteSegment = {
  mode: 'walk' | 'transit';
  latlngs: [number, number][];
  color?: string;
};

export type MapHandle = {
  /** Replace every pin of this kind. Other kinds stay. */
  setPins(kind: MapPinKind, pins: MapPin[]): void;
  setRadius(ring: MapRadius): void;
  /** Walk dashes and transit spines. Pass [] to clear. */
  setRoute(segments: MapRouteSegment[], opts?: { fit?: boolean }): void;
  fit(): void;
  /** Center a coordinate. Zoom defaults to a block-level view. */
  flyTo(lat: number, lng: number, zoom?: number): void;
  highlight(id: string | null): void;
  /** Returns an unsubscribe. */
  onSelect(fn: (id: string) => void): () => void;
};
