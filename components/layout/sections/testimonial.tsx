"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

interface ReviewProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
  rating: number;
}

const reviewList: ReviewProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "林晨",
    userName: "技术写作者",
    comment:
      "长文档一口气打完再上屏，光标搜索+标点跳转很顶，用 AI 候选校对错误也快多了。",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "陈意",
    userName: "独立开发者",
    comment:
      "代码解释直接粘贴到预编辑框问 AI，不用切应用，差异高亮帮助我快速挑对候选。",
    rating: 4.8,
  },

  {
    image: "https://github.com/shadcn.png",
    name: "赵清",
    userName: "产品经理",
    comment:
      "反引号混输英文再切回中文，逻辑写作顺畅；未上屏缓存救过我好几次。",
    rating: 4.9,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "周理",
    userName: "数据科学家",
    comment:
      "多模型并行转写对专业名词识别更准，长段翻译效果比普通输入法好很多。",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "郁然",
    userName: "翻译工作者",
    comment:
      "候选滚动+差异高亮让我在长句里挑选最自然的译文，效率提升明显。",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "唐崇",
    userName: "运维工程师",
    comment:
      "命令行场景用中英混输很顺手，AI 纠错帮我减少低级拼写错误。",
    rating: 4.9,
  },
];

export const TestimonialSection = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          用户反馈
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
          高效输入实践者的真实声音
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="relative w-[80%] sm:w-[90%] lg:max-w-screen-xl mx-auto"
      >
        <CarouselContent>
          {reviewList.map((review) => (
            <CarouselItem
              key={review.name}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="bg-muted/50 dark:bg-card">
                <CardContent className="pt-6 pb-0">
                  <div className="flex gap-1 pb-6">
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                  </div>
                  {`"${review.comment}"`}
                </CardContent>

                <CardHeader>
                  <div className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src="https://avatars.githubusercontent.com/u/75042455?v=4"
                        alt="radix"
                      />
                      <AvatarFallback>SV</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <CardTitle className="text-lg">{review.name}</CardTitle>
                      <CardDescription>{review.userName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};
