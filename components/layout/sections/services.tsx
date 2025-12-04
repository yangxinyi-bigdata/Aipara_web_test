import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

enum ProService {
  YES = 1,
  NO = 0,
}
interface ServiceProps {
  title: string;
  pro: ProService;
  description: string;
}
const serviceList: ServiceProps[] = [
  {
    title: "写作与长段输入",
    description:
      "整段拼音不顶屏，支持标点共存、光标搜索/跳转，适合长文与笔记场景。",
    pro: ProService.NO,
  },
  {
    title: "AI 转写与多模型候选",
    description:
      "云端/本地模型并行生成候选，提高命中率，可按需选择上屏。",
    pro: ProService.YES,
  },
  {
    title: "提示词与角色预设",
    description: "前缀触发不同 AI 助手，适配写作、翻译、代码讲解等场景。",
    pro: ProService.YES,
  },
  {
    title: "团队词库与云同步",
    description: "统一词库、快捷短语与配置，同步到多设备，支持团队共享。",
    pro: ProService.YES,
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        应用场景
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        让输入、创作与 AI 融合
      </h2>
      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        写作、代码、翻译、团队协作都能在同一输入框完成，从预编辑到 AI 回复一气呵成。
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full lg:w-[60%] mx-auto">
        {serviceList.map(({ title, description, pro }) => (
          <Card
            key={title}
            className="bg-muted/60 dark:bg-card h-full relative"
          >
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <Badge
              data-pro={ProService.YES === pro}
              variant="secondary"
              className="absolute -top-2 -right-3 data-[pro=false]:hidden"
            >
              PRO
            </Badge>
          </Card>
        ))}
      </div>
    </section>
  );
};
