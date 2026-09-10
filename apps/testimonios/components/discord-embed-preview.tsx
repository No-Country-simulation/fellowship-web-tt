import type { CommunityEmbed } from "@/lib/testimonials/community-embed";

type DiscordEmbedPreviewProps = {
  embed: CommunityEmbed;
};

/** Recreación visual del embed que manda el webhook a Discord. */
export function DiscordEmbedPreview({ embed }: DiscordEmbedPreviewProps) {
  const inlineFields = embed.fields.filter((field) => field.inline);
  const blockFields = embed.fields.filter((field) => !field.inline);

  return (
    <div className="overflow-hidden rounded-[4px] bg-[#2b2d31] text-[14px] leading-[1.375] text-[#dbdee1]">
      <div className="flex">
        <div className="w-1 shrink-0 bg-brand-pink" />
        <div className="min-w-0 flex-1 px-3 pt-2 pb-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={embed.authorIconUrl}
              alt=""
              className="size-6 rounded-full object-cover"
            />
            <p className="truncate text-[14px] font-medium text-white">
              {embed.authorName}
            </p>
          </div>
          <p className="mt-2 text-[16px] font-semibold text-white">
            {embed.title}
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words">
            {embed.description}
          </p>
          {inlineFields.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {inlineFields.map((field) => (
                <EmbedField key={field.name} field={field} />
              ))}
            </div>
          ) : null}
          {blockFields.map((field) => (
            <div key={field.name} className="mt-2">
              <EmbedField field={field} />
            </div>
          ))}
          {embed.imageUrl ? (
            // Captura pública de Storage; el embed de Discord la muestra igual.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={embed.imageUrl}
              alt=""
              className="mt-4 max-h-64 w-full rounded-[4px] object-cover"
            />
          ) : null}
          <p className="mt-2 text-[12px] text-[#b5bac1]">{embed.footer}</p>
        </div>
      </div>
    </div>
  );
}

function EmbedField({
  field,
}: {
  field: CommunityEmbed["fields"][number];
}) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] font-semibold text-[#b5bac1]">{field.name}</p>
      <p
        className={
          field.value.startsWith("http")
            ? "break-all text-[#00a8fc]"
            : "break-words"
        }
      >
        {field.value}
      </p>
    </div>
  );
}
