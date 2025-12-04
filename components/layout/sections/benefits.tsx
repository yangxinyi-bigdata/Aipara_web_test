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
    title: "整段拼音不顶屏",
    description:
      "标点、符号与拼音共存，一次输入整段内容，确认后再上屏，减少频繁中断和回删。",
  },
  {
    icon: "Search",
    title: "光标搜索与跳转",
    description:
      "Ctrl/Cmd+F 搜索拼音片段，Tab 循环；支持标点级跳转与点击定位，长段编辑更快。",
  },
  {
    icon: "Languages",
    title: "中英混输与标点替换",
    description:
      "反引号进入英文模式无需切换输入法，候选可统一中文标点；在 Notion 等场景仍保留英文标点触发快捷键。",
  },
  {
    icon: "Sparkles",
    title: "AI 转写与多模型候选",
    description:
      "云端/本地多路转换结合历史上下文生成候选词，提高长段拼音转汉字的命中率。",
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
            Aipara 让长段输入与 AI 结合更高效
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            围绕“整段输入”“AI 转写”“中英混输”三个场景，提供从光标定位到候选高亮的全链路体验。
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
