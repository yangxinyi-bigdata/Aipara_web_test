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
    icon: "ScrollText",
    title: "段落输入",
    description:
      "AI段落输入法的终极目标是消灭选词，一次性输入一整个段落，段落中不只是中文，可以包含英文和标点符号等任意内容。",
  },
  {
    icon: "Languages",
    title: "跨语种输入",
    description:
      "输入拼音，可以直接获取到任意语言的候选词。或者在AI翻译助手当中实现输入拼音，同时完成双语输入。",
  },
  {
    icon: "ClipboardPaste",
    title: "AI拼音识别",
    description:
      "开发段落输入法的初衷：某天突然产生一个灵感，有没有可能直接将拼音发送给AI，让AI去猜测我们输入的是什么中文?",
  },
  {
    icon: "History",
    title: "未上屏内容缓存",
    description:
      "切换应用后可恢复上一段未上屏文本，长段输入不再丢失。",
  },

  {
    icon: "Sparkles",
    title: "快捷AI对话",
    description:
      "创造性的是有特定前缀触发和不同AI助手的对话功能，并且还可以设置持续对话，无需输入前缀直接持续和特定ai助手连续对话。",
  },
  {
    icon: "Search",
    title: "网页渲染",
    description:
      "跳出输入法范筹，在AI对话时直接生成临时网页渲染AI回复文本，不再收到输入法框架限制。",
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
        在AI时代重新思考，有没有可能利用AI全面重塑输入法输入体验，甚至极大的提高输入效率? 基于这个思考我大幅度重构了输入法的逻辑。
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
