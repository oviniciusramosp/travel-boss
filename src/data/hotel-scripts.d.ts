// Travel-boss does not set allowJs. These search modules stay JavaScript;
// the declarations only let src/data typecheck the same imports.
declare module '*.mjs' {
  export function accommodationEligibility(...args: any[]): any;
  export function accommodationType(...args: any[]): any;
  export function azulHotelUrl(...args: any[]): any;
  export function bestBookingMatch(...args: any[]): any;
  export function bookingEligibility(...args: any[]): any;
  export function bookingHotelUrl(...args: any[]): any;
  export function bookingImageLarge(...args: any[]): any;
  export function bookingPhotoUrl(...args: any[]): any;
  export function bookingReference(...args: any[]): any;
  export function evaluateJev(
    hotels: any,
    options?: { apiKey?: string; fetchImpl?: (url: any, init: any) => any; pause?: any },
  ): Promise<any>;
  export function filterCandidates(hotels: any, params: any): any[];
  export function haversineM(...args: any[]): any;
  export function hotelEvidence(...args: any[]): any;
  export function hotelRegion(...args: any[]): any;
  export function isMatch(...args: any[]): any;
  export function nameOverlap(...args: any[]): any;
  export function nightsBetween(...args: any[]): any;
  export function normalizeAirbnb(...args: any[]): any;
  export function normalizeHotelName(...args: any[]): any;
  export function parseBookingScore(...args: any[]): any;
  export function parseCategoryScores(...args: any[]): any;
  export function pickZone(...args: any[]): any;
  export function rankHotels(hotels: any, context: any, options?: any): Promise<{ hotels: any[]; ranking: any }>;
  export function rankingTargets(...args: any[]): any;
  export function simplifyHotelName(...args: any[]): any;
  export function validateRankingHotels(...args: any[]): any;
  export function walkingDestinationScore(...args: any[]): any;
  export function walkingMatrix(...args: any[]): Promise<any>;
}
