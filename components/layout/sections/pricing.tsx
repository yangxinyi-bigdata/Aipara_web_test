import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDownToLine, Check, Laptop, Monitor } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DownloadInfo {
  os: string;
  variant: string;
  version: string;
  size: string;
  highlights: string[];
  buttonText: string;
  secondaryText: string;
  Icon: LucideIcon;
}

const downloads: DownloadInfo[] = [
  {
    os: "macOS",
    variant: "Apple Silicon / Intel · 适配 macOS 12+",
    version: "v1.2.0 · 最近更新",
    size: "DMG · 120 MB",
    highlights: [
      "全局唤起快捷键与候选联想提示",
      "兼容 Spotlight / Alfred 工作流，不干扰常用启动器",
      "自动更新与崩溃日志上报，便于问题追踪",
    ],
    buttonText: "下载 macOS 版",
    secondaryText: "查看安装指南",
    Icon: Laptop,
  },
  {
    os: "Windows",
    variant: "Windows 10 / 11 · 64 位",
    version: "v1.2.0 · 最近更新",
    size: "EXE · 105 MB",
    highlights: [
      "覆盖 Win32 / UWP 输入框，保持段落级输入体验",
      "剪贴板直连模式，长文本转写不卡顿",
      "企业网络代理配置，便捷接入内网环境",
    ],
    buttonText: "下载 Windows 版",
    secondaryText: "安装常见问题",
    Icon: Monitor,
  },
];

export const PricingSection = () => {
  return (
    <section id="download" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        下载 Aipara 输入法
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        选择你的系统，立即开始流畅输入
      </h2>

      <h3 className="md:w-2/3 mx-auto text-xl text-center text-muted-foreground pb-12">
        提供 macOS 与 Windows 双版本。当前版本覆盖最新功能，后续自动更新。
      </h3>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {downloads.map(
          ({
            os,
            variant,
            version,
            size,
            highlights,
            buttonText,
            secondaryText,
            Icon,
          }) => (
            <Card key={os} className="h-full border-[1.5px]">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 text-primary p-2">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{os} 版</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {variant}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {version}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{size}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                  <span className="rounded-full bg-primary/5 text-primary px-3 py-1">
                    官方构建
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1">
                    {variant}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1">{size}</span>
                </div>

                <ul className="space-y-3 text-sm text-foreground">
                  {highlights.map((item) => (
                    <li key={item} className="flex gap-2 items-start">
                      <Check className="h-4 w-4 text-primary mt-[2px]" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-wrap gap-3">
                <Button className="flex-1 min-w-[200px]">
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  {buttonText}
                </Button>
                <Button variant="ghost" className="text-sm">
                  {secondaryText}
                </Button>
              </CardFooter>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
