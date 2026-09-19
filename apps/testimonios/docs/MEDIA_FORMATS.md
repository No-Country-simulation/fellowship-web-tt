# Media formats (FFmpeg worker)

Preserve original testimony A/V — no generative rewrite.

| Platform | Output size | Notes |
|----------|-------------|-------|
| Instagram | 1080×1920 (9:16) | scale+pad; watermark bottom-right |
| LinkedIn | 1920×1080 (16:9) | scale+pad; watermark bottom-right |

Optional env `WATERMARK_PATH` = local PNG of No Country logo.

Audio: loudnorm when track present (worker pipeline steps).
