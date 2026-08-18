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
    title: "不用再一句一顿",
    description:
      "传统输入法每打几个字就要停下来选词，思路一次次被打断。段落输入一口气打完整段再上屏。",
  },
  {
    icon: "Languages",
    title: "中英标点不用切模式",
    description:
      "拼音、英文、标点混在一起直接打，不用反复切换输入模式。",
  },
  {
    icon: "Search",
    title: "打错了不用整段重来",
    description:
      "字母搜索、标点跳转直接定位光标，长段文本就地修改。",
  },
  {
    icon: "ListChecks",
    title: "Markdown 边打边成型",
    description:
      "标题、列表、引用、分隔线，直接在输入法里完成，上屏就是带格式的文本。",
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
            段落输入法目标是使用AI技术消灭选词
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            创造新的&quot;段落输入&quot;范式，使用AI技术一次性从拼音转换到正确的中文，甚至可以顺便完成语言润色。
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
