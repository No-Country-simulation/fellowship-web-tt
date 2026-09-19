"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonVariants } from "@repo/ui/button";
import {
  callProcesar,
  callPublicar,
  updateDraftAndStatus,
  type AdminContenido,
} from "@/lib/agent/agent-actions";
import type { Plataforma } from "@/lib/agent/types";
import { cn } from "@/lib/utils";

export function AdminAgentPanel(props: {
  testimonioId: string;
  initialRows: AdminContenido[];
  hasMedia: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ig, setIg] = useState(true);
  const [li, setLi] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const row of props.initialRows) {
      map[row.plataforma] = row.draft_copy ?? "";
    }
    return map;
  });

  function plataformas(): Plataforma[] {
    const out: Plataforma[] = [];
    if (ig) out.push("instagram");
    if (li) out.push("linkedin");
    return out;
  }

  return (
    <div className="mt-xl flex flex-col gap-lg border-t border-border pt-lg">
      <section>
        <h2 className="text-body font-medium text-text-primary">
          Procesar con agente
        </h2>
        <p className="mt-xs text-body-small text-text-secondary">
          {props.hasMedia
            ? "Hay audio/video: se encolará FFmpeg y luego Gemini."
            : "Solo texto: Gemini genera borradores directo."}{" "}
          El posteo a IG/LinkedIn sigue siendo manual.
        </p>
        <div className="mt-sm flex gap-md text-body-small text-text-secondary">
          <label className="flex items-center gap-xs">
            <input
              type="checkbox"
              checked={ig}
              onChange={(e) => setIg(e.target.checked)}
            />
            Instagram
          </label>
          <label className="flex items-center gap-xs">
            <input
              type="checkbox"
              checked={li}
              onChange={(e) => setLi(e.target.checked)}
            />
            LinkedIn
          </label>
        </div>
        <button
          type="button"
          disabled={pending || plataformas().length === 0}
          className={cn(buttonVariants({ variant: "secondary" }), "mt-sm")}
          onClick={() => {
            start(async () => {
              const res = await callProcesar(
                props.testimonioId,
                plataformas(),
              );
              setMessage(
                res.ok
                  ? "Procesamiento iniciado / borradores listos."
                  : res.error || "Error",
              );
              router.refresh();
            });
          }}
        >
          Procesar
        </button>
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="text-body font-medium text-text-primary">
          Borradores por plataforma
        </h2>
        {props.initialRows.length === 0 ? (
          <p className="text-body-small text-text-secondary">
            Todavía no hay filas de contenido. Ejecutá Procesar.
          </p>
        ) : null}
        {props.initialRows.map((row) => (
          <article
            key={row.id}
            className="rounded-button border border-border bg-bg-surface-2 p-md"
          >
            <div className="flex flex-wrap justify-between gap-xs text-body-small">
              <span className="font-medium text-text-primary">
                {row.plataforma}
              </span>
              <span className="text-text-secondary">{row.status}</span>
            </div>
            {row.media_asset_path ? (
              <p className="mt-xs text-caption text-text-secondary">
                Media: {row.media_asset_path}
              </p>
            ) : null}
            <textarea
              className="mt-sm min-h-28 w-full rounded-button border border-border bg-bg-surface-3 p-sm text-body-small text-text-primary"
              value={drafts[row.plataforma] ?? ""}
              onChange={(e) =>
                setDrafts((d) => ({
                  ...d,
                  [row.plataforma]: e.target.value,
                }))
              }
            />
            <div className="mt-sm flex flex-wrap gap-xs">
              <button
                type="button"
                disabled={pending}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                onClick={() => {
                  start(async () => {
                    await updateDraftAndStatus({
                      testimonioId: props.testimonioId,
                      plataforma: row.plataforma,
                      draftCopy: drafts[row.plataforma] ?? "",
                      status: "aprobado",
                    });
                    setMessage(`${row.plataforma}: aprobado en DB`);
                    router.refresh();
                  });
                }}
              >
                Aprobar
              </button>
              <button
                type="button"
                disabled={pending}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                onClick={() => {
                  start(async () => {
                    await updateDraftAndStatus({
                      testimonioId: props.testimonioId,
                      plataforma: row.plataforma,
                      draftCopy: drafts[row.plataforma] ?? "",
                      status: "rechazado",
                    });
                    setMessage(`${row.plataforma}: rechazado`);
                    router.refresh();
                  });
                }}
              >
                Rechazar
              </button>
              <button
                type="button"
                disabled={pending}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                onClick={() => {
                  start(async () => {
                    await updateDraftAndStatus({
                      testimonioId: props.testimonioId,
                      plataforma: row.plataforma,
                      draftCopy: drafts[row.plataforma] ?? "",
                      status: "listo_revision",
                    });
                    setMessage(`${row.plataforma}: draft guardado`);
                    router.refresh();
                  });
                }}
              >
                Guardar draft
              </button>
            </div>
          </article>
        ))}
      </section>

      <section>
        <h2 className="text-body font-medium text-text-primary">
          Publicar (solo DB)
        </h2>
        <p className="mt-xs text-body-small text-text-secondary">
          Marca filas <code>aprobado</code> → <code>publicado</code>. Después
          copiá el copy/media y publicá a mano en IG/LinkedIn.
        </p>
        <button
          type="button"
          disabled={pending}
          className={cn(buttonVariants({ variant: "secondary" }), "mt-sm")}
          onClick={() => {
            start(async () => {
              const res = await callPublicar(props.testimonioId);
              setMessage(
                res.ok
                  ? "Publicado en DB. Recordá el posteo manual."
                  : res.error || "Error",
              );
              router.refresh();
            });
          }}
        >
          Marcar publicado
        </button>
      </section>

      {message ? (
        <p className="text-body-small text-text-secondary" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
