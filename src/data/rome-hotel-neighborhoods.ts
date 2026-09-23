import { stayZonesForCity, stayHeatBand, staySafetyBand } from './travel-stay-heatmap';
import boundaries from './rome-hotel-boundaries.json';
import safetyResearch from './rome-neighborhood-safety.json';
const reviews = new Map(safetyResearch.reviews.map(review => [review.code, review]));
const researchSources = safetyResearch.sources as Record<string, {title: string; url: string; kind: string; access: string}>;
/** Additional hotel-search coverage. Boundaries come from cartographic urban zones, with central editorial areas excluded.
 * Scores are our coarse editorial interpretation, never numbers published by the sources.
 * 80 = calmer residential context; 70 = mixed/busy context. No claim of measured crime risk.
 * Sources describing urban form alone leave safety null; absence of warnings is not evidence of safety.
 */
const guide = 'https://www.romeing.it/where-to-live-in-rome/';
const safeGuide = 'https://italyonfoot.com/rome/romes-safest-neighborhoods-the-travelers-guide-to-a-secure-stay/';
const advice = 'https://www.gov.uk/foreign-travel-advice/italy/safety-and-security';
const reviewedAt = '2026-09-20';
const entries = [
  ['balduina-trionfale', 'Balduina / Trionfale', 41.9158, 12.448, 1050, 80, 'Contexto residencial mais tranquilo. Avaliação editorial aproximada; ladeiras e trajetos noturnos devem ser conferidos.', 'Calmer residential context. Approximate editorial assessment; check hills and night routes.', guide],
  ['aurelio', 'Aurelio / Gregorio VII', 41.8957, 12.437, 1250, 80, 'Área residencial descrita como geralmente segura pelo guia de hospedagem. Avaliação qualitativa; conferir a rua e o caminho ao transporte.', 'Residential area described as generally safe by the accommodation guide. Qualitative assessment; check the street and route to transport.', 'https://www.a-hotel.com/italy/138455-rome/?accommodation=parking&district=367-aurelio'],
  ['trieste-salario', 'Trieste', 41.9185, 12.505, 1250, 80, 'Guias descrevem uma base residencial tranquila. A nota é uma interpretação editorial, sem estatística local de criminalidade.', 'Guides describe a calm residential base. The score is an editorial interpretation without local crime statistics.', safeGuide],
  ['porta-pia', 'Salario / Porta Pia / XX Settembre', 41.9108, 12.4988, 650, 80, 'Extensão aproximada do contexto residencial de Salario; verificar o trajeto exato até o hotel. Confiança limitada nos limites da zona.', 'Approximate extension of the Salario residential context; check the exact hotel route. Limited confidence at area boundaries.', guide],
  ['nomentano', 'Nomentano / Piazza Bologna', 41.9168, 12.521, 1000, 80, 'Base residencial e universitária citada nos guias de bairros. Avaliação editorial aproximada, não medição de risco por rua.', 'Residential and university base covered by neighborhood guides. Approximate editorial assessment, not a street-level risk measurement.', 'https://beroomie.app/neighborhoods/rome/nomentano'],
  ['flaminio-parioli', 'Flaminio / Parioli', 41.925, 12.481, 1500, 80, 'Guias descrevem ruas residenciais mais tranquilas. Movimento varia em dias de eventos; avaliação editorial aproximada.', 'Guides describe calmer residential streets. Crowds vary on event days; approximate editorial assessment.', safeGuide],
  ['ponte-milvio', 'Ponte Milvio / Farnesina', 41.9395, 12.4655, 850, 70, 'Contexto residencial com bares e movimento noturno em Ponte Milvio. Nota editorial de contexto misto, não índice de crimes.', 'Residential context with bars and nightlife at Ponte Milvio. Editorial mixed-context score, not a crime index.', 'https://roma153.tecnocasa.it/roma/farnesina-pontemilvio/la-nostra-zona'],
  ['fleming', 'Fleming / Tor di Quinto', 41.947, 12.475, 850, null, 'Fontes descrevem o contexto residencial, mas não sustentam uma nota de segurança local. Revisão de segurança pendente.', 'Sources describe the residential context but do not support a local safety score. Safety review pending.', 'https://www.toscano.it/comune/zona-corso-francia-vigna-clara-fleming-ponte-milvio'],
  ['monte-sacro', 'Monte Sacro / Sacco Pastore', 41.935, 12.5325, 1000, 80, 'Guia de hospedagem descreve a região como geralmente segura e tranquila. Fonte comercial, confiança limitada; não usamos suas alegações de taxa de crimes.', 'Accommodation guide describes the area as generally safe and quiet. Commercial source, limited confidence; its crime-rate claims are not used.', 'https://www.all-luxury-apartments.com/blog-article-3891-discover-monte-sacro-in-rome.html'],
  ['pietralata', 'Pietralata / Monti Tiburtini', 41.917, 12.553, 1100, null, 'Há estudo urbano da região, mas ele não mede segurança atual para hóspedes. Não atribuímos nota sem evidência suficiente.', 'An urban study covers this area but does not measure current guest safety. No score is assigned without sufficient evidence.', 'https://sites.google.com/a/uniroma1.it/laboratorio-studi-urbani-dicea/i-luoghi/pietralata'],
  ['monteverde', 'Monteverde', 41.877, 12.453, 1350, 80, 'Guias descrevem uma base residencial tranquila; confirmar o trajeto noturno da rua escolhida.', 'Guides describe a calm residential base; check the night route for the chosen street.', safeGuide],
] as const;

type Boundary = { profileId: string; codes: string[]; names: string[]; lat: number; lng: number; polygons: [number, number][][][] };
const geometry = boundaries.zones as unknown as Record<string, Boundary>;
const profiles = new Map(entries.map(entry => [`roma-${entry[0]}`, entry]));
// Geometry is partitioned into individual urban zones; editorial context is separate.
const legacyById = new Map(stayZonesForCity('roma').map(z => [z.id, z]));
const legacyUrbanIds: Record<string, string> = {
  '17A': 'roma-prati', '1A': 'roma-centro', '1B': 'roma-trastevere',
  '1C': 'roma-aventino', '1D': 'roma-testaccio', '1E': 'roma-esquilino',
  '1G': 'roma-celio', '11C': 'roma-garbatella', '9D': 'roma-san-giovanni',
};
export const ROME_HOTEL_NEIGHBORHOODS = Object.entries(geometry).map(([id, boundary]) => {
  const profile = profiles.get(boundary.profileId);
  const legacy = legacyById.get(legacyUrbanIds[boundary.codes[0]]);
  const review = reviews.get(boundary.codes[0]);
  // An explicitly inconclusive review must not inherit a neighboring profile’s score.
  const safety = review ? review.safety : profile?.[5] ?? legacy?.safety ?? null;
  return {
    id, citySlug: 'roma', name: {en: boundary.names.join(' / '), 'pt-BR': boundary.names.join(' / ')},
    lat: boundary.lat, lng: boundary.lng, radiusM: 0, safety, legacySourceId: legacy?.id ?? null, mapBand: legacy && !review ? stayHeatBand(legacy) : staySafetyBand(safety),
    approximate: false, polygons: boundary.polygons, rings: boundary.polygons.map(p => p[0]),
    boundarySource: boundaries.source, boundaryCodes: boundary.codes,
    note: review ? review.note : profile ? {en: profile[7], 'pt-BR': profile[6]} : legacy ? legacy.note : {en: 'Mapped urban zone. No neighborhood safety assessment is available; this does not imply a safe or unsafe area.', 'pt-BR': 'Zona urbanística mapeada. Sem avaliação de segurança do bairro; isso não indica uma área segura ou insegura.'},
    reviewedAt: review ? safetyResearch.reviewedAt : reviewedAt,
    reviewStatus: review?.status ?? (profile || legacy ? 'editorial' : 'pending'),
    confidence: review || profile || legacy ? 'limited' : 'unassessed', assessment: safety == null ? 'unrated' : 'editorial-inference',
    sources: [...(review ? review.sourceIds.map(id => researchSources[id]) : profile ? [{ title: 'Contexto do bairro', url: profile[8] }, {title: 'Orientações oficiais de segurança', url: advice}] : []), {title: 'Limites cartográficos das zonas urbanísticas', url: boundaries.source}],
  };
});
export const ROME_HOTEL_COVERAGE = boundaries.coverage;
