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

/**
 * 占位内容：等收集到真实用户反馈后替换。
 *
 * - `image` 留空时会自动回落到头像首字（AvatarFallback），不加载任何外部图片。
 *   填上真实头像路径（建议放 public/ 下）即可显示。
 * - `rating` 目前不参与渲染，星级是组件里写死的五颗星。
 */
const reviewList: ReviewProps[] = [
  {
    image: "",
    name: "用户名占位 01",
    userName: "用户身份占位",
    comment: "真实用户反馈占位。收集到内测反馈后替换这段文字。",
    rating: 5.0,
  },
  {
    image: "",
    name: "用户名占位 02",
    userName: "用户身份占位",
    comment: "真实用户反馈占位。收集到内测反馈后替换这段文字。",
    rating: 5.0,
  },
  {
    image: "",
    name: "用户名占位 03",
    userName: "用户身份占位",
    comment: "真实用户反馈占位。收集到内测反馈后替换这段文字。",
    rating: 5.0,
  },
  {
    image: "",
    name: "用户名占位 04",
    userName: "用户身份占位",
    comment: "真实用户反馈占位。收集到内测反馈后替换这段文字。",
    rating: 5.0,
  },
  {
    image: "",
    name: "用户名占位 05",
    userName: "用户身份占位",
    comment: "真实用户反馈占位。收集到内测反馈后替换这段文字。",
    rating: 5.0,
  },
  {
    image: "",
    name: "用户名占位 06",
    userName: "用户身份占位",
    comment: "真实用户反馈占位。收集到内测反馈后替换这段文字。",
    rating: 5.0,
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
                      <AvatarImage src={review.image} alt={review.name} />
                      <AvatarFallback>{review.name.slice(0, 1)}</AvatarFallback>
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
