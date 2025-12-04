import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface FeaturesProps {
  icon: string;
  title: string;
  description: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: "Languages",
    title: "反引号中英混输",
    description:
      "在拼音中插入`英文`片段，无需切换输入法状态，保持创作节奏不中断。",
  },
  {
    icon: "ClipboardPaste",
    title: "粘贴模式直连 AI",
    description:
      "将代码/长文本以纯文本注入预编辑框，直接询问内置 AI，减少重复敲字。",
  },
  {
    icon: "History",
    title: "未上屏内容缓存",
    description:
      "切换应用后可恢复上一段未上屏文本，长段输入不再丢失。",
  },
  {
    icon: "ScrollText",
    title: "候选滚动与差异高亮",
    description:
      "长候选自动滚动，差异位高亮标记，让长段候选的细微差别一眼可见。",
  },
  {
    icon: "Sparkles",
    title: "AI 多模型并行",
    description:
      "云端/本地多路转换生成候选，结合上下文提高命中率，可按需选择上屏。",
  },
  {
    icon: "Search",
    title: "光标搜索跳转",
    description:
      "Ctrl/Cmd+F 搜索拼音片段，Tab 在结果间跳转；亦可按标点分句跳转。",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        功能总览
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        输入法核心能力一览
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        围绕长段输入、AI 转写、中英混输和候选呈现，提供全链路体验；保持 Rime 的可定制性，并加入云端扩展能力。
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }) => (
          <div key={title}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={24}
                    color="hsl(var(--primary))"
                    className="text-primary"
                  />
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
