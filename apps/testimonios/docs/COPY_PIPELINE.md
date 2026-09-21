# Copy pipeline (IG / LinkedIn)

How Gemini fills the caption fields in `/admin/[id]`.

## Goal

A post from **No Country** for Instagram or LinkedIn: short brand intro + quoted fellow quote + name + that network + hashtags.

## Pipeline

```text
story + quote + form type
    → Gemini writes only the intro (1–2 sentences, No Country voice)
    → code assembles intro + "quote" + name + IG/LI + #NoCountry #DemoDay #TalentoIT
```

Entry: **Generar con IA** (`lib/testimonials/generate-caption.ts`). Does not persist until Guardar / Publicar (`ig_caption` / `li_caption`).

Discord uses the same default intro, fixed (not generated, not editable). LinkedIn uses `li_caption` + Video + captura; Instagram uses `ig_caption` + PNG card.

## Default intro

`Desde No Country compartimos esta historia de nuestro talento`

Gemini may rewrite that intro. Quote, name, handle and hashtags stay in code.

## Voice

- Intro is the community account, not the fellow in first person.
- Do not copy the quote, invent jobs, or add extra hashtags.
- Reply with the intro only — no “acá te dejo opciones”.

## Human gate

Admin reviews in `/admin/[id]` → edit / Guardar / Publicar. Discord va por webhook; Instagram y LinkedIn por Buffer (si hay channel IDs).
