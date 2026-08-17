import { BenefitsSection } from "@/components/layout/sections/benefits";
import { CommunitySection } from "@/components/layout/sections/community";
import { ContactSection } from "@/components/layout/sections/contact";
import { FAQSection } from "@/components/layout/sections/faq";
import { FeaturesSection } from "@/components/layout/sections/features";
import { FooterSection } from "@/components/layout/sections/footer";
import { HeroSection } from "@/components/layout/sections/hero";
import { PricingSection } from "@/components/layout/sections/pricing";
import { ServicesSection } from "@/components/layout/sections/services";
import { TestimonialSection } from "@/components/layout/sections/testimonial";

export const metadata = {
  title: "段落输入法 · Duanluo AI输入法",
  description:
    "段落输入法是基于AI时代的新需求构建的中文输入法，段落输入法的目标是消灭选词,一次性完成整段数输入。",
  openGraph: {
    type: "website",
    url: "https://duanluo.chat",
    title: "段落输入法 · Duanluo AI输入法",
    description:
      "段落输入法是基于AI时代的新需求构建的中文输入法，段落输入法的目标是消灭选词,一次性完成整段数输入。",
  },
  twitter: {
    card: "summary_large_image",
    title: "段落输入法 · Duanluo AI输入法",
    description:
      "段落输入法是基于AI时代的新需求构建的中文输入法，段落输入法的目标是消灭选词,一次性完成整段数输入。",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <FeaturesSection />
      <ServicesSection />
      <TestimonialSection />
      <FAQSection />
      <PricingSection />
      <ContactSection />
      <CommunitySection />
      <FooterSection />
    </>
  );
}
