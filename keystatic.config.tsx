import { config, fields, collection, singleton } from '@keystatic/core';

// Visual admin at /keystatic. Free, open-source. Edits the same Markdown files
// Astro reads, so there is no separate database to maintain.
// Relationship fields give the artist autocomplete linking (sez. 5 del brief):
// only the Traccia owns the links; the reverse appears automatically on the site.

export default config({
  // Local mode: edit on your machine via `npm run dev` -> /keystatic.
  // For editing live from any browser, switch to:
  //   storage: { kind: 'github', repo: 'tuo-utente/giuseworld' }
  storage: { kind: 'local' },

  ui: {
    brand: { name: 'GIUSE WORLD' },
  },

  singletons: {
    impostazioni: singleton({
      label: 'Impostazioni sito',
      path: 'src/data/site',
      format: { data: 'json' },
      schema: {
        nomeProgetto: fields.text({ label: 'Nome progetto' }),
        emailProgetto: fields.text({ label: 'Email del progetto' }),
        gateTraccia: fields.relationship({
          label: 'Traccia del Gate',
          collection: 'tracce',
          description: 'La traccia manifesto mostrata nel Gate.',
        }),
        gateBenvenuto: fields.text({ label: 'Testo di benvenuto (Gate)', multiline: true }),
        fondamentaManifesto: fields.text({ label: 'Fondamenta (manifesto Visione)', multiline: true }),
        mecenatePostiTotali: fields.integer({ label: 'Mecenate — posti totali', defaultValue: 10 }),
        mecenatePostiDisponibili: fields.integer({ label: 'Mecenate — posti disponibili', defaultValue: 10 }),
        paypal: fields.object({
          sostenitore: fields.text({ label: 'Link PayPal 5€' }),
          partecipante: fields.text({ label: 'Link PayPal 10€' }),
          mecenate: fields.text({ label: 'Link PayPal 100€' }),
        }, { label: 'Link PayPal' }),
        newsletterAction: fields.text({ label: 'Form action newsletter (Buttondown)' }),
        fondatori: fields.array(fields.text({ label: 'Nome' }), {
          label: 'Fondatori', itemLabel: (p) => p.value,
        }),
      },
    }),
  },

  collections: {
    tracce: collection({
      label: 'Archivio — Tracce',
      slugField: 'titolo',
      path: 'src/content/tracce/*',
      format: { contentField: 'testo' },
      schema: {
        titolo: fields.slug({ name: { label: 'Titolo' } }),
        data: fields.date({ label: 'Data' }),
        audio: fields.text({ label: 'File audio (es. /audio/xyz.mp3)' }),
        embed: fields.text({ label: 'Embed audio (fallback)', multiline: true }),
        contesto: fields.text({ label: 'Come è nata', multiline: true }),
        note: fields.text({ label: 'Note al testo (opzionale)', multiline: true }),
        processo: fields.text({ label: 'Processo creativo (intro)', multiline: true }),
        sessioniCollegate: fields.array(
          fields.relationship({ label: 'Sessione', collection: 'sessioni' }),
          { label: 'Sessioni di processo collegate', itemLabel: (p) => p.value ?? '' }),
        storieCollegate: fields.array(
          fields.relationship({ label: 'Storia', collection: 'storie' }),
          { label: 'Storie collegate', itemLabel: (p) => p.value ?? '' }),
        riflessioniCollegate: fields.array(
          fields.relationship({ label: 'Riflessione', collection: 'riflessioni' }),
          { label: 'Riflessioni collegate', itemLabel: (p) => p.value ?? '' }),
        elementiCollegati: fields.array(
          fields.relationship({ label: 'Elemento', collection: 'elementi' }),
          { label: 'Elementi iconici collegati', itemLabel: (p) => p.value ?? '' }),
        bozza: fields.checkbox({ label: 'Bozza (non pubblicare)', defaultValue: false }),
        testo: fields.markdoc({ label: 'Testo della traccia' }),
      },
    }),

    sessioni: collection({
      label: 'Processo — Sessioni',
      slugField: 'titolo',
      path: 'src/content/sessioni/*',
      format: { contentField: 'testo' },
      schema: {
        titolo: fields.slug({ name: { label: 'Titolo' } }),
        data: fields.date({ label: 'Data' }),
        contestoBreve: fields.text({ label: 'Contesto breve', multiline: true }),
        embed: fields.text({ label: 'Embed Vimeo', multiline: true }),
        bozza: fields.checkbox({ label: 'Bozza', defaultValue: false }),
        testo: fields.markdoc({ label: 'Corpo' }),
      },
    }),

    storie: collection({
      label: 'Storie',
      slugField: 'titolo',
      path: 'src/content/storie/*',
      format: { contentField: 'testo' },
      schema: {
        titolo: fields.slug({ name: { label: 'Nome persona / evento' } }),
        data: fields.date({ label: 'Data' }),
        immagine: fields.text({ label: 'Immagine (opzionale)' }),
        contesto: fields.text({ label: 'Contesto', multiline: true }),
        impatto: fields.text({ label: 'Impatto', multiline: true }),
        bozza: fields.checkbox({ label: 'Bozza', defaultValue: false }),
        testo: fields.markdoc({ label: 'Corpo (opzionale)' }),
      },
    }),

    riflessioni: collection({
      label: 'Visione — Riflessioni',
      slugField: 'titolo',
      path: 'src/content/riflessioni/*',
      format: { contentField: 'testo' },
      schema: {
        titolo: fields.slug({ name: { label: 'Titolo' } }),
        data: fields.date({ label: 'Data' }),
        estratto: fields.text({ label: 'Estratto', multiline: true }),
        bozza: fields.checkbox({ label: 'Bozza', defaultValue: false }),
        testo: fields.markdoc({ label: 'Testo completo' }),
      },
    }),

    elementi: collection({
      label: 'Elementi',
      slugField: 'titolo',
      path: 'src/content/elementi/*',
      format: { contentField: 'testo' },
      schema: {
        titolo: fields.slug({ name: { label: 'Titolo' } }),
        data: fields.date({ label: 'Data' }),
        immagine: fields.text({ label: 'Immagine principale' }),
        bozza: fields.checkbox({ label: 'Bozza', defaultValue: false }),
        testo: fields.markdoc({ label: 'Descrizione' }),
      },
    }),
  },
});
