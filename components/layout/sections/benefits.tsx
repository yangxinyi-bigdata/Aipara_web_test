import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface BenefitsProps {
  icon: string;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: "AlignVerticalJustifyCenter",
    title: "标点符号不上屏",
    description:
      "标点符号，英文与拼音共存，一次输入整段，一次识别整段，减少选词时间。",
  },
  {
    icon: "Search",
    title: "光标搜索与跳转",
    description:
      "字母搜索跳转光标，标点符号跳转光标，长段文本快速编辑。",
  },
  {
    icon: "Languages",
    title: "最快速AI对话",
    description:
      "随时发起AI对话，通过特定前缀触发和不同AI助手的对话功能，随时随地和AI宠物，AI秘书，AI翻译对话，效率大爆炸。",
  },
  {
    icon: "Sparkles",
    title: "AI转写",
    description:
      "AI/云端/本地多路实时分析，结合历史上下文生成候选词，提高长段拼音转汉字的命中率。",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className="text-lg text-primary mb-2 tracking-wider">
            核心优势
          </h2>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Aipara 目标是使用AI技术消灭选词
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            创造新的"段落输入"范式，使用AI技术一次性从拼音转换到正确的中文，甚至可以顺便完成语言润色。
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon, title, description }, index) => (
            <Card
              key={title}
              className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={32}
                    color="hsl(var(--primary))"
                    className="mb-6 text-primary"
                  />
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
