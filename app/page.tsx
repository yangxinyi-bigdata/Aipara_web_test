import { BenefitsSection } from "@/components/layout/sections/benefits";
import { CommunitySection } from "@/components/layout/sections/community";
import { ContactSection } from "@/components/layout/sections/contact";
import { FAQSection } from "@/components/layout/sections/faq";
import { FeaturesSection } from "@/components/layout/sections/features";
import { FooterSection } from "@/components/layout/sections/footer";
import { HeroSection } from "@/components/layout/sections/hero";
import { PricingSection } from "@/components/layout/sections/pricing";
import { ServicesSection } from "@/components/layout/sections/services";
// 用户评价区暂不展示，恢复时同时取消这行与下方 <TestimonialSection /> 的注释
// import { TestimonialSection } from "@/components/layout/sections/testimonial";

export const metadata = {
  title: "段落输入法 · Duanluo AI输入法",
  description:
    "段落输入法是基于AI时代的新需求构建的中文输入法，段落输入法的目标是消灭选词,一次性完成整段数输入。",
  openGraph: {
    type: "website",
    url: "https://www.duanluo.chat",
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
      {/* 用户评价区暂不展示：内容仍是占位文案，对外露出会削弱可信度，
          Apple Developer Program 组织入网也会人工查看官网是否为真实运营站点。
          组件与占位数据都保留在 components/layout/sections/testimonial.tsx，
          收集到真实反馈后替换文案，再取消下面这行注释即可恢复。 */}
      {/* <TestimonialSection /> */}
      <FAQSection />
      <PricingSection />
      <ContactSection />
      <CommunitySection />
      <FooterSection />
    </>
  );
}
