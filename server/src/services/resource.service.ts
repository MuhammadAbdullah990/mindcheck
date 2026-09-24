import { prisma } from '../prisma/client.js';

/**
 * Ordered worst→best. A resource tagged with `severityMin: "mild"` should
 * surface for someone who scored mild, moderate or severe — but not for
 * someone who scored minimal. So we include a resource when the user's
 * severity is at least as severe as the resource's threshold.
 */
const SEVERITY_ORDER = [
  'normal',
  'minimal',
  'mild',
  'moderate stress',
  'moderate',
  'moderately severe',
  'severe',
  'high perceived stress',
  'extremely severe',
] as const;

function severityRank(severity: string): number {
  const idx = SEVERITY_ORDER.indexOf(severity as (typeof SEVERITY_ORDER)[number]);
  // Unknown strings sort as "mild" rather than throwing, so a new severity
  // band added to the scoring engine can't crash resource matching.
  return idx === -1 ? SEVERITY_ORDER.indexOf('mild') : idx;
}

export type ResourceDTO = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  phone: string | null;
  type: string;
  category: string;
  country: string;
};

type ResourceRow = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  phone: string | null;
  type: string;
  category: string;
  country: string;
  severityMin: string;
};

/** Crisis resources are always returned, whatever the score. */
const CRISIS_RESOURCES: ResourceDTO[] = [
  {
    id: 'crisis-us-988',
    title: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential 24/7 support from trained counselors. Call or text any time.',
    url: 'https://988lifeline.org',
    phone: '988',
    type: 'HOTLINE',
    category: 'crisis',
    country: 'US',
  },
  {
    id: 'crisis-us-text',
    title: 'Crisis Text Line',
    description: 'Text HOME to 741741 to connect with a trained crisis counselor, 24/7.',
    url: 'https://www.crisistextline.org',
    phone: '741741',
    type: 'HOTLINE',
    category: 'crisis',
    country: 'US',
  },
  {
    id: 'crisis-pk-umang',
    title: 'Umang Mental Health Helpline',
    description: 'Free counselling and support in Urdu, for individuals and families in Pakistan.',
    url: null,
    phone: '0311-7786264',
    type: 'HOTLINE',
    category: 'crisis',
    country: 'PK',
  },
  {
    id: 'crisis-pk-rozan',
    title: 'Rozan Counseling',
    description: 'Free professional counselling helpline in Pakistan.',
    url: 'http://www.rozan.org.pk',
    phone: '0800-22-444',
    type: 'HOTLINE',
    category: 'crisis',
    country: 'PK',
  },
  {
    id: 'crisis-pk-taskeen',
    title: 'Taskeen',
    description: 'Free online counselling platform for students and youth in Pakistan.',
    url: 'https://taskeen.org',
    phone: null,
    type: 'ORGANIZATION',
    category: 'crisis',
    country: 'PK',
  },
  {
    id: 'crisis-intl-iasp',
    title: 'International Association for Suicide Prevention',
    description: 'Directory of verified crisis centres worldwide.',
    url: 'https://www.iasp.info/resources/Crisis_Centres/',
    phone: null,
    type: 'ORGANIZATION',
    category: 'crisis',
    country: 'global',
  },
  {
    id: 'crisis-intl-befrienders',
    title: 'Befrienders Worldwide',
    description: 'Emotional support centres in over 30 countries, staffed by trained volunteers.',
    url: 'https://befrienders.org',
    phone: null,
    type: 'ORGANIZATION',
    category: 'crisis',
    country: 'global',
  },
];

const toDTO = (r: ResourceRow): ResourceDTO => ({
  id: r.id,
  title: r.title,
  description: r.description,
  url: r.url,
  phone: r.phone,
  type: r.type,
  category: r.category,
  country: r.country,
});

/**
 * Resources to show on a results page: everything at or above the user's
 * severity threshold for their category, plus crisis lines. Crisis lines are
 * hard-coded rather than seeded so they remain available even if the database
 * seed is missing or has been edited.
 */
export async function getResourcesForResult(
  severityLevel: string,
  category: string,
): Promise<ResourceDTO[]> {
  const rows = await prisma.resource.findMany({
    where: { isActive: true, category: { in: [category, 'general'] } },
    orderBy: { sortOrder: 'asc' },
  });

  const userRank = severityRank(severityLevel);
  const matched = rows
    .filter((r) => severityRank(r.severityMin) <= userRank)
    .map(toDTO);

  return dedupe([...CRISIS_RESOURCES, ...matched]);
}

export async function listResources(filters: {
  category?: string;
  country?: string;
}): Promise<ResourceDTO[]> {
  const where: Record<string, unknown> = { isActive: true };
  if (filters.category) where.category = filters.category;
  if (filters.country) where.country = { in: [filters.country, 'global'] };

  const rows = await prisma.resource.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
  return dedupe([...rows.map(toDTO), ...CRISIS_RESOURCES]);
}

function dedupe(resources: ResourceDTO[]): ResourceDTO[] {
  const seen = new Set<string>();
  return resources.filter((r) => {
    const key = r.id ?? `${r.title}|${r.phone ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
