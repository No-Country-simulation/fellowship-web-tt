import { getLlmsFullTxt } from "@/lib/llms-txt";

export const dynamic = "force-static";

export function GET() {
  return new Response(getLlmsFullTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
