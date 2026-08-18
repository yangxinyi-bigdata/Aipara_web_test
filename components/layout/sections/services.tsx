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
    title: "写长文档的人",
    description:
      "论文、报告、周记，一段一段地打完再上屏；Markdown 边打边成型，标题和列表直接带格式。",
    pro: ProService.NO,
  },
  {
    title: "开发者",
    description:
      "代码编辑器自动切英文标点和 vim 模式，写注释时中英混输不用切换；专业术语进个人词库。",
    pro: ProService.NO,
  },
  {
    title: "每天处理大量消息的人",
    description:
      "长回复用语音说完直接上屏，优化助手补好标点和语气；不满意就地让 AI 改写。",
    pro: ProService.NO,
  },
  {
    title: "做翻译和双语内容的人",
    description:
      "输入拼音直接拿到译文候选，不用切到翻译网站再复制回来。",
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
        不同的人，用法完全不同
      </h2>
      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        段落输入、语音、AI 助手可以自由组合，下面是几种典型搭配。
      </h3>

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
