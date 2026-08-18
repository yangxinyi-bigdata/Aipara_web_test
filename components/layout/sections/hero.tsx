"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * 首屏媒体素材配置。
 *
 * 目前没有视频素材，`video` 为 null，只显示 poster 静态图。
 * 素材录好后：把文件放进 public/，取消下面 video 的注释并填上文件名即可，
 * 组件其余部分不用改。
 *
 * 视频要求：无声、可循环、8-12 秒；桌面版和移动版分开出，
 * 移动版建议裁掉周边留白、只保留候选面板，字才看得清。
 */
const heroMedia = {
  // 静态封面：视频加载中、浏览器拦截自动播放、用户开启「减少动态效果」时都显示它
  poster: `${basePath}/hero-poster.jpg`,
  posterWidth: 1920,
  posterHeight: 1080,
  alt: "段落输入法整段输入演示",
  video: {
    desktop: `${basePath}/hero-desktop.mp4`,
    mobile: `${basePath}/hero-mobile.mp4`,
  } as { desktop: string; mobile: string } | null,
};

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const mediaClassName =
  "w-full md:w-[960px] mx-auto rounded-lg relative leading-none border border-t-2 border-secondary border-t-primary/30";

const HeroMedia = () => {
  const { poster, posterWidth, posterHeight, alt, video } = heroMedia;
  const [videoSrc, setVideoSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!video) return;
    // 用户在系统里开启了「减少动态效果」时不播视频，保留静态封面
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const mql = window.matchMedia(MOBILE_QUERY);
    const pickSource = () =>
      setVideoSrc(mql.matches ? video.mobile : video.desktop);

    pickSource();
    mql.addEventListener("change", pickSource);
    return () => mql.removeEventListener("change", pickSource);
  }, [video]);

  if (videoSrc) {
    return (
      <video
        key={videoSrc}
        className={mediaClassName}
        src={videoSrc}
        poster={poster}
        aria-label={alt}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <Image
      width={posterWidth}
      height={posterHeight}
      className={mediaClassName}
      src={poster}
      alt={alt}
      priority
    />
  );
};

export const HeroSection = () => {
  return (
    <section className="container w-full">
      <div className="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-12 md:py-20">
        <div className="text-center space-y-6">
          <Badge variant="outline" className="text-sm py-2">
            中文输入法新范式
          </Badge>

          <div className="max-w-screen-md mx-auto text-center text-4xl md:text-6xl font-bold">
            <h1>一口气打完一整段</h1>
          </div>

          <p className="max-w-screen-sm mx-auto text-xl text-muted-foreground">
            整段输入不停顿，AI 识别告别选词。
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button asChild className="w-5/6 md:w-1/4 font-bold group/arrow">
              <Link href="#download">
                立即下载
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="w-5/6 md:w-1/4 font-bold"
            >
              <Link
                href="#features"
                target="_self"
              >
                看看怎么打字
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative group mt-10">
          <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl"></div>

          <HeroMedia />

          <div className="absolute bottom-0 left-0 w-full h-20 md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-lg"></div>
        </div>
      </div>
    </section>
  );
};
