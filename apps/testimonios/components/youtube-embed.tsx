type YoutubeEmbedProps = {
  src: string;
  title?: string;
};

/** Iframe 16:9. `src` debe ser `youtube.com/embed/{id}`, no un watch URL. */
export function YoutubeEmbed({
  src,
  title = "Video de YouTube",
}: YoutubeEmbedProps) {
  return (
    <div className="aspect-video overflow-hidden rounded-md border border-border bg-bg-base">
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="size-full"
      />
    </div>
  );
}
