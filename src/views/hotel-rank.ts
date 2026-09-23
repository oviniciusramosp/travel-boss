import { pickLocale, type Locale } from '../catalog';

export type RankStatus = 'eligible' | 'pending' | 'excluded';

type Copy = { en: string; 'pt-BR': string };

export type RankInput = {
  position: number | null;
  score: number | null;
  provisional?: boolean;
  evidenceCoverage?: number;
  missingComponents?: string[];
  eligibility?: {
    status: RankStatus;
    failures?: string[];
    unknown?: string[];
    staffMinimum: number | null;
  };
  region?: {
    name: Copy;
    safety: number | null;
    coverage?: string;
  } | null;
  walkingMinutes: number | null;
  walkingCoverage?: number;
  reachableWithin30?: number;
  beyond90?: number;
  pointCount?: number;
};

export type ScoreHotel = {
  source?: string;
  locationApproximate?: boolean;
  booking: {
    wifiAvailable?: boolean | null;
    categoryScores?: Partial<Record<string, number | null | undefined>>;
  };
  ranking?: RankInput;
};

export type ScoreBar = {
  label: string;
  value: number | null;
  text: string;
};

export type ScoreCard = {
  score: number | null;
  eyebrow: string;
  title: string;
  detail: string;
  aria: string;
  airbnbNote: string | null;
  bars: ScoreBar[];
  wifi: string;
  staff: string;
  requirementNote: string | null;
  safety: { text: string; caution: boolean };
  coverage: string | null;
  walking: string;
};

const say = (locale: Locale, copy: Copy) => pickLocale(locale, copy);

export function tenth(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}

/** 0–100 ring. Missing evidence stays empty instead of becoming zero. */
export function clampScore(score: number | null | undefined): number | null {
  if (score == null || !Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function safetyIsCaution(safety: number | null | undefined): boolean {
  return safety != null && Number.isFinite(safety) && safety < 70;
}

const MISSING: Record<string, Copy> = {
  safety: { en: 'neighborhood safety', 'pt-BR': 'segurança do bairro' },
  walking: { en: 'walking routes', 'pt-BR': 'rotas a pé' },
  transit: { en: 'transport access', 'pt-BR': 'acesso ao transporte' },
  quality: { en: 'quality', 'pt-BR': 'qualidade' },
};

const UNKNOWN: Record<string, Copy> = {
  overall: { en: 'Airbnb overall rating', 'pt-BR': 'nota geral do Airbnb' },
  wifi: { en: 'Wi-Fi', 'pt-BR': 'Wi-Fi' },
  staff: { en: 'staff', 'pt-BR': 'funcionários' },
  cleanliness: { en: 'cleanliness', 'pt-BR': 'limpeza' },
  comfort: { en: 'comfort', 'pt-BR': 'conforto' },
  facilities: { en: 'facilities', 'pt-BR': 'comodidades' },
};

const BARS: readonly { key: string; label: Copy }[] = [
  { key: 'cleanliness', label: { en: 'Cleanliness', 'pt-BR': 'Limpeza' } },
  { key: 'comfort', label: { en: 'Comfort', 'pt-BR': 'Conforto' } },
  { key: 'facilities', label: { en: 'Facilities', 'pt-BR': 'Comodidades' } },
];

function placeName(locale: Locale, name: Copy | undefined): string {
  if (!name) return '';
  return say(locale, name);
}

/**
 * Card ranking block from the portfolio hotel card.
 * `null` until a rank pass has filled eligibility.
 */
export function scoreCard(locale: Locale, hotel: ScoreHotel): ScoreCard | null {
  const ranking = hotel.ranking;
  if (!ranking?.eligibility || ranking.provisional == null) return null;
  const status = ranking.eligibility.status;
  const score = clampScore(ranking.score);
  const title =
    status === 'eligible' && ranking.provisional
      ? say(locale, { en: 'Provisional score', 'pt-BR': 'Nota provisória' })
      : status === 'eligible'
        ? ranking.position != null
          ? `#${ranking.position} ${say(locale, { en: 'for our trip', 'pt-BR': 'para nosso roteiro' })}`
          : say(locale, { en: 'For our trip', 'pt-BR': 'Para nosso roteiro' })
        : status === 'excluded'
          ? say(locale, { en: 'Not eligible', 'pt-BR': 'Fora dos critérios' })
          : say(locale, { en: 'Needs confirmation', 'pt-BR': 'A confirmar' });
  const region = ranking.region;
  const safetyText = hotel.locationApproximate
    ? say(locale, {
        en: 'Approximate location: neighborhood safety not scored',
        'pt-BR': 'Localização aproximada: segurança do bairro sem nota',
      })
    : region
      ? `${placeName(locale, region.name)} · ${say(locale, { en: 'editorial safety', 'pt-BR': 'segurança editorial' })} ${
          region.safety == null
            ? say(locale, { en: 'not assessed', 'pt-BR': 'não avaliada' })
            : `${region.safety}/100`
        }${
          region.coverage !== 'polygon'
            ? say(locale, { en: ' (approximate area)', 'pt-BR': ' (área aproximada)' })
            : ''
        }`
      : say(locale, {
          en: 'Neighborhood: insufficient editorial data',
          'pt-BR': 'Bairro: dados editoriais insuficientes',
        });
  const airbnb = hotel.source === 'airbnb';
  const staffScore = hotel.booking.categoryScores?.staff;
  const staffMinimum = ranking.eligibility.staffMinimum;
  const failures = ranking.eligibility.failures ?? [];
  const unknown = ranking.eligibility.unknown ?? [];
  const requirementNote =
    status === 'excluded'
      ? `${say(locale, { en: 'Does not meet requirements', 'pt-BR': 'Não atende aos requisitos' })}: ${failures
          .map((key) =>
            key === 'staff'
              ? say(locale, {
                  en: `staff below ${tenth(locale, staffMinimum ?? 7)}`,
                  'pt-BR': `funcionários abaixo de ${tenth(locale, staffMinimum ?? 7)}`,
                })
              : say(locale, { en: 'no Wi-Fi', 'pt-BR': 'sem Wi-Fi' }),
          )
          .join(' · ')}`
      : status === 'pending' && unknown.length
        ? `${say(locale, { en: 'Needs confirmation', 'pt-BR': 'A confirmar' })}: ${unknown
            .map((key) => (UNKNOWN[key] ? say(locale, UNKNOWN[key]) : key))
            .join(', ')}`
        : null;
  const missing = ranking.missingComponents ?? [];
  const coverage = ranking.provisional
    ? `${say(locale, { en: 'Provisional score', 'pt-BR': 'Nota provisória' })} · ${Math.round((ranking.evidenceCoverage ?? 0) * 100)}% ${say(locale, { en: 'of criteria available', 'pt-BR': 'dos critérios disponíveis' })}${
        missing.length
          ? ` · ${say(locale, { en: 'Missing: ', 'pt-BR': 'Faltam: ' })}${missing
              .map((key) => (MISSING[key] ? say(locale, MISSING[key]) : key))
              .join(', ')}`
          : ` · ${say(locale, { en: 'limited neighborhood evidence', 'pt-BR': 'evidência de bairro limitada' })}`
      }`
    : null;
  const walking =
    ranking.walkingMinutes == null
      ? say(locale, { en: 'Walking routes unavailable', 'pt-BR': 'Rotas a pé indisponíveis' })
      : `${say(locale, {
          en: `Weighted average walk: ${ranking.walkingMinutes} min`,
          'pt-BR': `Caminhada média ponderada: ${ranking.walkingMinutes} min`,
        })} · ${ranking.reachableWithin30 ?? 0}/${ranking.pointCount ?? 0} ${say(locale, {
          en: 'places within 30 min',
          'pt-BR': 'pontos em até 30 min',
        })}${
          ranking.beyond90
            ? say(locale, {
                en: ` · ${ranking.beyond90} beyond 90 min`,
                'pt-BR': ` · ${ranking.beyond90} acima de 1h30`,
              })
            : ''
        }${(ranking.walkingCoverage ?? 1) < 1 ? say(locale, { en: ' · incomplete routes', 'pt-BR': ' · rotas incompletas' }) : ''}`;

  return {
    score,
    eyebrow: say(locale, { en: 'Our rating', 'pt-BR': 'Nossa nota' }),
    title,
    detail: say(locale, { en: 'Quality, neighborhood and itinerary', 'pt-BR': 'Qualidade, bairro e roteiro' }),
    aria: `${say(locale, { en: 'Our rating', 'pt-BR': 'Nossa nota' })}: ${score ?? say(locale, { en: 'pending', 'pt-BR': 'pendente' })}`,
    airbnbNote: airbnb
      ? say(locale, {
          en: 'The Airbnb rating is multiplied by 2 and shown on a 0–10 scale. It represents 50% of our score. Separate category ratings do not affect our score.',
          'pt-BR':
            'A nota do Airbnb é multiplicada por 2 e exibida de 0 a 10. Ela representa 50% da nossa nota. Notas por categoria não afetam nossa nota.',
        })
      : null,
    bars: airbnb
      ? []
      : BARS.map((bar) => {
          const value = hotel.booking.categoryScores?.[bar.key];
          const finite = value != null && Number.isFinite(value) ? value : null;
          return {
            label: say(locale, bar.label),
            value: finite,
            text: finite == null ? '—' : tenth(locale, finite),
          };
        }),
    wifi:
      hotel.booking.wifiAvailable === true
        ? say(locale, { en: 'Wi-Fi confirmed', 'pt-BR': 'Wi-Fi confirmado' })
        : hotel.booking.wifiAvailable === false
          ? say(locale, { en: 'No Wi-Fi', 'pt-BR': 'Sem Wi-Fi' })
          : say(locale, { en: 'Wi-Fi to confirm', 'pt-BR': 'Wi-Fi a confirmar' }),
    staff: airbnb
      ? say(locale, { en: 'Staff: not applicable', 'pt-BR': 'Funcionários: não se aplica' })
      : `${say(locale, { en: 'Staff', 'pt-BR': 'Funcionários' })}: ${
          staffScore != null && Number.isFinite(staffScore) ? tenth(locale, staffScore) : '—'
        } · ${say(locale, { en: 'min.', 'pt-BR': 'mín.' })} ${tenth(locale, staffMinimum ?? 7)}`,
    requirementNote,
    safety: { text: safetyText, caution: safetyIsCaution(region?.safety) },
    coverage,
    walking,
  };
}
