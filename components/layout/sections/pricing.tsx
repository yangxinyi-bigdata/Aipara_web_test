import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

enum PopularPlan {
  NO = 0,
  YES = 1,
}

interface PlanProps {
  title: string;
  popular: PopularPlan;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
}

const plans: PlanProps[] = [
  {
    title: "基础版",
    popular: PopularPlan.NO,
    price: 0,
    description: "体验整段输入、中英混输与基础 AI 转写。",
    buttonText: "开始体验",
    benefitList: [
      "整段拼音不顶屏",
      "标点/拼音共存",
      "反引号中英混输",
      "单模型 AI 转写",
      "社区支持",
    ],
  },
  {
    title: "专业版",
    popular: PopularPlan.YES,
    price: 29,
    description: "多模型候选、粘贴模式、提示词预设与候选差异高亮。",
    buttonText: "升级专业版",
    benefitList: [
      "多模型并行转写",
      "粘贴模式直连 AI",
      "候选滚动与差异高亮",
      "提示词/角色预设",
      "优先支持",
    ],
  },
  {
    title: "团队版",
    popular: PopularPlan.NO,
    price: 59,
    description: "团队词库与配置同步，分角色配额与协作支持。",
    buttonText: "联系我们",
    benefitList: [
      "团队词库/短语同步",
      "多设备配置下发",
      "自定义角色/配额",
      "邮箱/电话支持",
      "优先内测通道",
    ],
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        版本计划
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        按需选择适合你的输入体验
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground pb-14">
        先用基础版上手，再按需求升级，团队版支持共享词库与配置。
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-4">
        {plans.map(
          ({ title, popular, price, description, buttonText, benefitList }) => (
            <Card
              key={title}
              className={
                popular === PopularPlan?.YES
                  ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10 border-[1.5px] border-primary lg:scale-[1.1]"
                  : ""
              }
            >
              <CardHeader>
                <CardTitle className="pb-2">{title}</CardTitle>

                <CardDescription className="pb-4">
                  {description}
                </CardDescription>

                <div>
                  <span className="text-3xl font-bold">¥{price}</span>
                  <span className="text-muted-foreground"> /月</span>
                </div>
              </CardHeader>

              <CardContent className="flex">
                <div className="space-y-4">
                  {benefitList.map((benefit) => (
                    <span key={benefit} className="flex">
                      <Check className="text-primary mr-2" />
                      <h3>{benefit}</h3>
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  variant={
                    popular === PopularPlan?.YES ? "default" : "secondary"
                  }
                  className="w-full"
                >
                  {buttonText}
                </Button>
              </CardFooter>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
