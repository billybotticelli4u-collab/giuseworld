import { getCollection, type CollectionEntry } from 'astro:content';

type AnyCol = 'tracce' | 'sessioni' | 'storie' | 'riflessioni' | 'elementi';

const SECTION: Record<AnyCol, { label: string; base: string }> = {
  tracce: { label: 'Traccia', base: '/archivio' },
  sessioni: { label: 'Sessione', base: '/processo' },
  storie: { label: 'Storia', base: '/storie' },
  riflessioni: { label: 'Riflessione', base: '/visione/riflessioni' },
  elementi: { label: 'Elemento', base: '/elementi' },
};

// Public URL for any entry.
export function urlFor(collection: AnyCol, id: string): string {
  return `${SECTION[collection].base}/${id}`;
}
export function sectionLabel(collection: AnyCol): string {
  return SECTION[collection].label;
}

// Only published entries (hide drafts). Extend here if you want future-date gating.
async function published<C extends AnyCol>(c: C): Promise<CollectionEntry<C>[]> {
  const all = await getCollection(c as any);
  return all.filter((e: any) => e.data.bozza !== true) as CollectionEntry<C>[];
}

export const getTracce = () => published('tracce');
export const getSessioni = () => published('sessioni');
export const getStorie = () => published('storie');
export const getRiflessioni = () => published('riflessioni');
export const getElementi = () => published('elementi');

const t = (e: any) => +new Date(e.data.data);
export const byDateDesc = <T extends { data: { data: Date } }>(a: T[]) =>
  [...a].sort((x, y) => t(y) - t(x));
export const byDateAsc = <T extends { data: { data: Date } }>(a: T[]) =>
  [...a].sort((x, y) => t(x) - t(y));

// Internal navigation: chronological (oldest -> newest). "precedente" = older.
export function prevNext<T extends { id: string; data: { data: Date } }>(
  entries: T[],
  currentId: string,
) {
  const asc = byDateAsc(entries);
  const i = asc.findIndex((e) => e.id === currentId);
  return {
    prev: i > 0 ? asc[i - 1] : null,            // pubblicato prima
    next: i >= 0 && i < asc.length - 1 ? asc[i + 1] : null, // pubblicato dopo
  };
}

// Inverse query: which Tracce link to this entry? (Relations live only on Traccia.)
export async function tracceCollegate(
  field: 'sessioniCollegate' | 'storieCollegate' | 'riflessioniCollegate' | 'elementiCollegati',
  targetId: string,
) {
  const tracce = await getTracce();
  return byDateDesc(
    tracce.filter((tr) =>
      (tr.data[field] ?? []).some((ref: any) => ref.id === targetId),
    ),
  );
}

// Timeline: aggregate every dated content type, newest first.
export type TimelineItem = {
  date: Date;
  collection: AnyCol;
  tipo: string;
  titolo: string;
  url: string;
};

const TYPE_RANK: Record<AnyCol, number> = {
  tracce: 0, sessioni: 1, storie: 2, riflessioni: 3, elementi: 4,
};

export async function buildTimeline(): Promise<TimelineItem[]> {
  const [tr, se, st, ri] = await Promise.all([
    getTracce(), getSessioni(), getStorie(), getRiflessioni(),
  ]);
  const map = (arr: any[], collection: AnyCol): TimelineItem[] =>
    arr.map((e) => ({
      date: new Date(e.data.data),
      collection,
      tipo: SECTION[collection].label,
      titolo: e.data.titolo,
      url: urlFor(collection, e.id),
    }));

  const items = [
    ...map(tr, 'tracce'),
    ...map(se, 'sessioni'),
    ...map(st, 'storie'),
    ...map(ri, 'riflessioni'),
  ];

  // Newest first; tie-break by type rank, then title.
  return items.sort((a, b) => {
    const d = +b.date - +a.date;
    if (d !== 0) return d;
    const r = TYPE_RANK[a.collection] - TYPE_RANK[b.collection];
    if (r !== 0) return r;
    return a.titolo.localeCompare(b.titolo, 'it');
  });
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
}
