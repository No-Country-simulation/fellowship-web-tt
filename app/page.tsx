import { JsonLd } from "@/components/json-ld";
import { Differential } from "@/components/landing/differential";
import { Evidence } from "@/components/landing/evidence";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Guarantee } from "@/components/landing/guarantee";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Profiles } from "@/components/landing/profiles";
import { SocialProof } from "@/components/landing/social-proof";
import { getLandingJsonLd } from "@/lib/json-ld";

export default function Home() {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-x-clip">
      <JsonLd data={getLandingJsonLd()} />
      <Hero />
      <Differential />
      <Evidence />
      <HowItWorks />
      <Guarantee />
      <Profiles />
      <SocialProof />
      <Faq />
      <FinalCta />
    </main>
  );
}
