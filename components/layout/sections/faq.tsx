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
    answer: "当前聚焦桌面端 Windows / macOS ；未来将会支持安卓和iPhone/iPad等移动端。",
    value: "item-1",
  },
  {
    question: "离线能用吗？隐私如何保障？",
    answer:
      "本地输入可离线；AI识别/云输入法需联网且仅在触发时发送内容。",
    value: "item-2",
  },
  {
    question: "段落输入与传统输入法的区别？",
    answer:
      "基于AI时代重新思考输入法的输入逻辑，设计了段落输入模式，可一次性输入一整段的内容，方便AI识别和AI对话，同时可减少选词，提高效率。",
    value: "item-3",
  },
  {
    question: "AI 功能可以关闭或自定义吗？",
    answer: "可以。全部功能可自定义配置，可关闭；也可选择使用或禁用云端/多模型，并配置提示词与触发前缀。",
    value: "item-4",
  },
  {
    question: "未来是否会收费？",
    answer: "当前已有功能全部免费，未来退出智能聊天，智能编码等高级功能可能会收费。",
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
