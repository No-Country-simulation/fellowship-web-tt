# Video pipeline (mp4 → Sanity → FFmpeg Micro → admin)

## Flujo

```
/enviar (mp4 opcional)
  → Sanity original
  → Supabase: video_original_url, video_status=original

Admin: Procesar
  → FFmpeg Micro: upload → transcribe (ES) → transcode (subs + watermark + 1080p)
  → Sanity processed
  → Supabase: video_processed_url, video_status=processed

Admin: Aprobar video  (≠ Publicar testimonio)
  → video_share_url = processed URL (link para enviarle al fellow)
  → borra original en Sanity
  → video_status=approved

Admin: Rechazar video
  → video_status=rejected (se puede Procesar de nuevo)
```

Redes (Buffer/Discord): sin cambio — no mandan el mp4.

## Estados `video_status`

| Estado | Significado |
|--------|-------------|
| `none` | Sin mp4 |
| `original` | Original en Sanity |
| `processing` | Job FFmpeg en curso |
| `processed` | Listo para preview / aprobar |
| `approved` | Share URL listo; original borrado |
| `rejected` | Procesado rechazado |

## Código

| Path | Rol |
|------|-----|
| `lib/sanity/*` | Upload/delete assets |
| `lib/ffmpeg-micro/client.ts` | API FFmpeg Micro |
| `lib/testimonials/video-pipeline.ts` | Orquestación |
| `lib/testimonials/video-actions.ts` | Server actions admin |
| `components/admin-video-panel.tsx` | Player + acciones |
| `supabase/migrations/20260924180000_video_pipeline.sql` | Columnas |

## Setup local

1. Crear proyecto Sanity + token write; pegar en `.env.local`.
2. API key FFmpeg Micro free → `FFMPEG_MICRO_API_KEY`.
3. Aplicar migración: `npx supabase db push` (desde app testimonios / proyecto linkeado).
4. `pnpm --filter testimonios dev`
