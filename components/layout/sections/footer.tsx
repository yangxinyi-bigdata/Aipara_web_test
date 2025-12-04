import { Separator } from "@/components/ui/separator";
import { ChevronsDownIcon } from "lucide-react";
import Link from "next/link";

export const FooterSection = () => {
  return (
    <footer id="footer" className="container py-24 sm:py-32">
      <div className="p-10 bg-card border border-secondary rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
          <div className="col-span-full xl:col-span-2">
            <Link href="#" className="flex font-bold items-center">
              <ChevronsDownIcon className="w-9 h-9 mr-2 bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg border border-secondary" />

              <h3 className="text-2xl">Aipara 输入法</h3>
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">链接</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                下载
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                帮助文档
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                视频教程
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">平台</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Windows
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                macOS
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Linux
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">帮助</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                联系我们
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                常见问题
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                反馈
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
                Discord
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
        <section className="">
          <h3 className="">
            &copy; 2024 Aipara 输入法 · Rime 二次开发与 AI 深度集成
          </h3>
        </section>
      </div>
    </footer>
  );
};
