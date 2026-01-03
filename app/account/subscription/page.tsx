"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Crown,
  Gem,
  LogIn,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCloudbaseClient, type CloudbaseClient } from "@/lib/cloudbase";

type CurrentUser = Awaited<
  ReturnType<CloudbaseClient["auth"]["getCurrentUser"]>
>;

type BillingCycle = "month" | "year";

type PlanCard = {
  name: string;
  price: string;
  highlight?: string;
  features: string[];
  limits: string[];
  badge?: "free" | "pro";
};

const plans: PlanCard[] = [
  {
    name: "免费版",
    price: "¥0/月",
    highlight: "基础功能试用",
    features: ["标准模型", "基础模板", "社区支持"],
    limits: ["对话 100 次/月", "点数 2,000", "高级模型不可用"],
    badge: "free",
  },
  {
    name: "Pro",
    price: "¥49/月",
    highlight: "效率与高级模型",
    features: ["高级模型", "多端同步", "优先客服"],
    limits: ["对话 500 次/月", "点数 10,000", "高级模型 60 次/月"],
    badge: "pro",
  },
];

const SubscriptionPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );
  const [autoRenew, setAutoRenew] = React.useState(true);
  const [cycle, setCycle] = React.useState<BillingCycle>("month");

  React.useEffect(() => {
    let isMounted = true;
    const client = getCloudbaseClient();
    if (!client) return;

    const loadUser = async () => {
      try {
        const user = await client.auth.getCurrentUser();
        if (isMounted) {
          setCurrentUser(user || null);
        }
      } catch (error) {
        console.error("Failed to load CloudBase user", error);
      }
    };

    loadUser();

    client.auth.onLoginStateChanged(async (params) => {
      const eventType = params?.data?.eventType;
      if (eventType === "sign_in") {
        const user = await client.auth.getCurrentUser();
        if (isMounted) {
          setCurrentUser(user || null);
        }
      }

      if (eventType === "sign_out" || eventType === "refresh_token_failed") {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async () => {
    try {
      router.push("/login?redirect=%2Faccount%2Fsubscription");
    } catch (error) {
      console.error("Login redirect failed", error);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="w-[95%] md:w-[85%] lg:w-[85%] lg:max-w-screen-xl mx-auto pt-16 pb-20">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-secondary/60 bg-card/70 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                <User className="size-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">账号设置</p>
                <p className="text-base font-semibold">账户中心</p>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <Link className="block" href="/account">
                账号信息
              </Link>
              <Link className="block text-foreground" href="/account/subscription">
                订阅管理
              </Link>
              <Link className="block" href="/account/wallet">
                钱包管理
              </Link>
            </div>
            <Button asChild className="mt-6 w-full" variant="secondary">
              <Link href="/">返回首页</Link>
            </Button>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">订阅管理</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    订阅全生命周期管理（开通/升级/降级/暂停/续费/取消）。
                  </p>
                </div>
                {!currentUser && (
                  <Button onClick={handleLogin} variant="secondary">
                    <LogIn className="mr-2 size-4" />
                    去登录
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                    <Crown className="size-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">当前计划</h2>
                    <p className="text-sm text-muted-foreground">
                      Pro · 月付 · 自动续费开启
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className="rounded-xl border border-secondary/40 bg-muted/10 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold">{plan.name}</p>
                        {plan.badge === "pro" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            <Gem className="size-3" /> 推荐
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                            <BadgeCheck className="size-3" /> 默认
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.price}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {plan.highlight}
                      </p>
                      <div className="mt-3 text-xs text-muted-foreground space-y-1">
                        {plan.features.map((feature) => (
                          <p key={feature}>· {feature}</p>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground space-y-1">
                        {plan.limits.map((limit) => (
                          <p key={limit}>· {limit}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                    <CalendarClock className="size-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">计划操作</h2>
                    <p className="text-sm text-muted-foreground">
                      到期日：2025-06-30
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div className="rounded-xl border border-secondary/40 bg-muted/10 p-4">
                    <p className="text-sm font-medium">自动续费</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      当前状态：{autoRenew ? "已开启" : "已关闭"}
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-3"
                      onClick={() => setAutoRenew((prev) => !prev)}
                    >
                      {autoRenew ? "关闭自动续费" : "开启自动续费"}
                    </Button>
                  </div>

                  <div className="rounded-xl border border-secondary/40 bg-muted/10 p-4">
                    <p className="text-sm font-medium">付费周期</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      当前选择：{cycle === "month" ? "月付" : "年付"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant={cycle === "month" ? "secondary" : "ghost"}
                        onClick={() => setCycle("month")}
                      >
                        月付
                      </Button>
                      <Button
                        variant={cycle === "year" ? "secondary" : "ghost"}
                        onClick={() => setCycle("year")}
                      >
                        年付
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-secondary/40 bg-muted/10 p-4">
                    <p className="text-sm font-medium">订阅动作</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Button variant="secondary">升级套餐</Button>
                      <Button variant="secondary">降级套餐</Button>
                      <Button variant="secondary">暂停订阅</Button>
                      <Button variant="secondary">续费</Button>
                      <Button variant="ghost">取消订阅</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="contract"
              className="rounded-2xl border border-secondary/60 bg-card/80 p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                  <ShieldCheck className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">服务说明</h2>
                  <p className="text-sm text-muted-foreground">
                    订阅合同与服务条款入口（示例）。
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="secondary">
                  <Link href="#contract">
                    查看订阅合同
                    <ArrowUpRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="#contract">
                    服务说明
                    <ArrowUpRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                示例页面未接入真实合同，可在后端接入后替换链接。
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SubscriptionPage;
