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
      "段落输入一次性完成一段编辑，AI加速识别，减少选词，适合长文与笔记场景。",
    pro: ProService.NO,
  },
  {
    title: "翻译与双语写作",
    description:
      "输入拼音直接输出英文，输入拼音直接输出双语，输入拼音直接完成语言润色，减少中间环节，增加效率。",
    pro: ProService.NO,
  },
  {
    title: "AI秘书AI猫娘",
    description: "前缀触发不同 AI 助手，情感连接、翻译、事务管理，代码讲解等场景。",
    pro: ProService.NO,
  },
  {
    title: "频繁AI对话需求",
    description: "随时随地和AI对话，AI搜索，AI查找。",
    pro: ProService.NO,
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
        输入法可能是AI对话最好的入口，写作、代码、翻译随时随地对话，一气呵成。
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
