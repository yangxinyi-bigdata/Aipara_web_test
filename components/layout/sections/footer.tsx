import { Separator } from "@/components/ui/separator";
import { DuanluoMark } from "@/components/icons/duanluo-mark";
import Link from "next/link";

export const FooterSection = () => {
  return (
    <footer id="footer" className="container py-24 sm:py-32">
      <div className="p-10 bg-card border border-secondary rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
          <div className="col-span-full xl:col-span-2">
            <Link href="#" className="flex font-bold items-center">
              <DuanluoMark className="w-9 h-9 mr-2 bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg border border-secondary text-white" />

              <h3 className="text-2xl">段落输入法</h3>
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">链接</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                视频教程
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                帮助文档
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">下载</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Windows
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Mac
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">帮助</h3>
            <div>
              <Link href="#contact" className="opacity-60 hover:opacity-100">
                联系我们
              </Link>
            </div>

            <div>
              <Link href="#faq" className="opacity-60 hover:opacity-100">
                常见问题
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">社区</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                微信/QQ 群
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                博客
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        <section className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <h3 className="text-foreground">
            &copy; 2025 段落输入法 · 与 AI 深度集成
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 md:justify-end">
            <span>长沙段落科技有限公司</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground hover:underline"
            >
              湘ICP备2026016017号-1
            </a>
          </div>
        </section>
      </div>
    </footer>
  );
};
