# Copy pipeline (IG / LinkedIn)

How Gemini drafts become publication-ready captions for testimonios.

## Goal

Each draft must sound like the **fellow** telling their story — not a brand essay or community-manager post.

## Pipeline

```text
story + form type
    → understanding (structured JSON)
    → narrative strategy (type × platform)
    → draft (Gemini 3.1 → fallback 2.5)
    → validate (+ optional fidelity LLM)
    → repair once if needed
    → hashtags block (#NoCountry #DemoDay #TalentoIT)
```

Entry points: `POST /api/agent/procesar` or admin **Procesar** (`lib/agent/agent-actions.ts`).

## Voice (hard rules)

| Allowed | Rejected |
|---------|----------|
| First person: yo / me / mi / mis | Third-person narrator (“ella consiguió…”, “su historia”) |
| Hook from lived experience | Impersonal openers (“Entrar al mundo IT…”) |
| Soft CTA in first person | Brand CTAs (“Te leo en comentarios”, “seguinos”) |

Validators live in `lib/agent/copy-validator.ts`. Repair prompt rewrites voice errors in first person.

## Platform notes

| Platform | Rules |
|----------|--------|
| Instagram | Short lines, max 2 emojis, first-person CTA |
| LinkedIn | 2–3 paragraphs, no casual emojis, professional first person |

Hashtags: exactly `#NoCountry #DemoDay #TalentoIT` on a final blank-separated line — no extras, not mid-body.

## Fidelity

- Do not invent jobs, companies, numbers, or outcomes.
- Affirmative hire language only if the source confirms it; seeking language is fine.
- Optional second pass: `GEMINI_FIDELITY_LLM=true` (see [ENV.agent.md](./ENV.agent.md)).

## Human gate

Admin reviews drafts in `/admin/[id]` → approve / edit / reject. Edited text publishes as-is (no auto re-Gemini). Social posting stays manual.
