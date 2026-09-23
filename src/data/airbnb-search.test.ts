import { describe, it, expect } from 'vitest';
import { normalizeAirbnb } from '../../scripts/airbnb-search.mjs';
import { accommodationEligibility, hotelEvidence } from '../../scripts/hotel-ranking.mjs';
import { validateRankingHotels } from '../../scripts/hotel-search.mjs';
const params = { checkin: '2026-10-16', checkout: '2026-10-18', adults: 2, centre: {lat:41.9028,lng:12.4964}, maxKm:5, maxTotal:2500, minScore:7 };
const row = { room_id:'1410087494097601901', name:'Room', title:'Room in Rome', coordinates:{latitude:41.90,longitud:12.50}, rating:{value:4.8,reviewCount:'244'}, images:[], price:{unit:{amount:1200},break_down:[{description:'2 nights x R$1,039.80',amount:2079.59,currency:'R$'},{description:'Taxes',amount:141.79,currency:'R$'},{description:'Total',amount:2221.38,currency:'R$'}]} };
const details = {rating:{cleanliness:4.8}, amenities:[{values:[{title:'Wifi',available:true}]}]};
describe('free Airbnb integration', () => {
  it('preserves long IDs and uses the explicit BRL stay total including taxes', () => {
    const h=normalizeAirbnb(row,params,details);
    expect(h.id).toBe('airbnb:1410087494097601901');
    expect(h.priceTotal).toBe(2221.38);
    expect(h.priceNight).toBe(1110.69);
    expect(normalizeAirbnb(row,{...params,checkout:'2026-10-19'},details)).toBeNull();
    expect(h.booking.url).toContain('adults=2');
    expect(h.booking.categoryScores).toEqual({cleanliness:9.6,comfort:null,facilities:null,staff:null});
  });
  it('rejects nightly-only, foreign currency, over-budget and out-of-radius results', () => {
    expect(normalizeAirbnb({...row,price:{unit:{amount:500}}},params)).toBeNull();
    expect(normalizeAirbnb({...row,price:{break_down:[{description:'Total',amount:400,currency:'€'}]}},params)).toBeNull();
    expect(normalizeAirbnb(row,{...params,maxTotal:2000})).toBeNull();
    expect(normalizeAirbnb({...row,coordinates:{latitude:42,longitud:13}},params)).toBeNull();
  });
  it('requires confirmed Wi-Fi without inventing a staff equivalent', () => {
    expect(accommodationEligibility(normalizeAirbnb(row,params)).status).toBe('pending');
    expect(accommodationEligibility(normalizeAirbnb(row,params,details)).status).toBe('eligible');
    expect(accommodationEligibility(normalizeAirbnb(row,params,{...details,amenities:[{values:[{title:'Wifi',available:false}]}]})).status).toBe('excluded');
  });
  it('keeps approximate location unscored for safety and full quality weight from the overall rating', () => {
    const h=normalizeAirbnb(row,params,details);
    const r=hotelEvidence(h,{points:[],transport:[],totalPoints:0},[],[]);
    expect(r.components.safety).toBeNull();
    expect(r.evidenceCoverage).toBeCloseTo(0.5);
    expect(r.score).toBe(96);
    expect(r.provisional).toBe(true);
  });
  it('uses overall rating independently of cleanliness and rejects missing ratings', () => {
    const h=normalizeAirbnb({...row,rating:{value:4.5}},params,{...details,rating:{cleanliness:1}});
    expect(hotelEvidence(h,{points:[],transport:[],totalPoints:0},[],[]).components.quality).toBe(90);
    expect(accommodationEligibility({...h,booking:{...h.booking,categoryScores:{}}}).status).toBe('eligible');
    expect(accommodationEligibility({...h,airbnb:{rating:null}}).unknown).toContain('overall');
  });
  it('does not trust client-provided Airbnb ratings during reranking', () => {
    expect(()=>validateRankingHotels([{...normalizeAirbnb(row,params,details),id:'airbnb:nonexistent-test'}])).toThrow('Refaça a busca');
  });
});
