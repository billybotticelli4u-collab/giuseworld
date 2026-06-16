import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The body (markdown) of each entry holds the main long-form text:
//  - Traccia: il testo della traccia
//  - Riflessione: il testo completo
//  - Elemento: la descrizione
//  - Sessione / Storia: il corpo libero
// Secondary prose blocks live in frontmatter as plain strings.

const tracce = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tracce' }),
  schema: z.object({
    titolo: z.string(),
    data: z.coerce.date(),
    audio: z.string().optional(),        // es. /audio/xyz.mp3 (self-hosted)
    embed: z.string().optional(),        // fallback SoundCloud/Spotify embed url
    contesto: z.string().optional(),     // "come è nata questa traccia"
    note: z.string().optional(),         // note al testo (opzionale)
    processo: z.string().optional(),     // testo introduttivo al processo collegato
    // Relazioni Molti-a-Molti: SOLO la Traccia le possiede (vedi sez. 5).
    sessioniCollegate: z.array(reference('sessioni')).optional(),
    storieCollegate: z.array(reference('storie')).optional(),
    riflessioniCollegate: z.array(reference('riflessioni')).optional(),
    elementiCollegati: z.array(reference('elementi')).optional(),
    bozza: z.boolean().default(false),
  }),
});

const sessioni = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sessioni' }),
  schema: z.object({
    titolo: z.string(),
    data: z.coerce.date(),
    contestoBreve: z.string().optional(),
    embed: z.string().optional(),        // Vimeo embed (title=0&byline=0&portrait=0&dnt=1)
    bozza: z.boolean().default(false),
  }),
});

const storie = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/storie' }),
  schema: z.object({
    titolo: z.string(),                  // nome persona / evento
    data: z.coerce.date(),
    immagine: z.string().optional(),
    contesto: z.string().optional(),
    impatto: z.string().optional(),
    bozza: z.boolean().default(false),
  }),
});

const riflessioni = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/riflessioni' }),
  schema: z.object({
    titolo: z.string(),
    data: z.coerce.date(),
    estratto: z.string().optional(),
    bozza: z.boolean().default(false),
  }),
});

const elementi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/elementi' }),
  schema: z.object({
    titolo: z.string(),
    data: z.coerce.date(),
    immagine: z.string().optional(),
    bozza: z.boolean().default(false),
  }),
});

export const collections = { tracce, sessioni, storie, riflessioni, elementi };
