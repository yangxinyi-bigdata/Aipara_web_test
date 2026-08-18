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
    icon: "Cloud",
    title: "智能候选",
    description:
      "段落输入专用模型，云端转换，无需配置开箱即用，长段拼音也能一次给出准确候选。",
  },
  {
    icon: "Sparkles",
    title: "AI拼音助手",
    description:
      "配置自己的模型 API Key，把整段拼音交给大模型理解，可自选模型与提示词。",
  },
  {
    icon: "MessagesSquare",
    title: "AI对话助手",
    description:
      "前缀触发不同 AI 助手，翻译、改写、提问就地完成，结果直接出现在候选里；支持持续对话，无需重复输入前缀。",
  },
  {
    icon: "Mic",
    title: "语音输入",
    description:
      "输入法使用前缀唤起语音栏；识别结果交给优化助手修正错字、改变语气、完善格式。",
  },
  {
    icon: "BookMarked",
    title: "词库管理",
    description:
      "个人词库收录个人专用词汇，还能根据输入习惯自动学习新词。自定义短语一个编码补充整段文本。",
  },
  {
    icon: "AppWindow",
    title: "单应用状态管理",
    description:
      "设置单个应用独立记住中英文、标点和半全角状态，聊天软件用中文标点，代码编辑器自动切英文。",
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
