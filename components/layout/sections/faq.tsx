import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Aipara 支持哪些平台？",
    answer: "当前聚焦桌面端（Rime 生态），计划支持 Windows / macOS / Linux；移动端在规划中。",
    value: "item-1",
  },
  {
    question: "离线能用吗？隐私如何保障？",
    answer:
      "Rime 本地输入可离线；AI/云转写需联网且仅在触发时发送内容，未来将提供更细粒度的隐私配置。",
    value: "item-2",
  },
  {
    question: "段落输入与传统输入法的区别？",
    answer:
      "标点与拼音可共存，不会提前顶屏；支持整段输入、光标搜索/跳转、候选滚动与差异高亮，适合长文与混合内容。",
    value: "item-3",
  },
  {
    question: "AI 功能可以关闭或自定义吗？",
    answer: "可以。可切换为纯 Rime，本地转换；也可选择使用或禁用云端/多模型，并配置提示词与触发前缀。",
    value: "item-4",
  },
  {
    question: "团队版提供什么能力？",
    answer: "团队词库/短语同步，多角色配额，统一配置下发与优先支持，适合团队协作场景。",
    value: "item-5",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          常见问题
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          你可能关心的细节
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
