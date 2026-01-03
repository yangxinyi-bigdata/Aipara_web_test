"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarClock,
  Gauge,
  LogIn,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCloudbaseClient, type CloudbaseClient } from "@/lib/cloudbase";
import { getUserPhone } from "@/lib/phone";

type CurrentUser = Awaited<
  ReturnType<CloudbaseClient["auth"]["getCurrentUser"]>
>;

const getDisplayName = (user: CurrentUser) => {
  if (!user) return "";
  const username = (user as { username?: string }).username || "";
  const phone = getUserPhone(user);
  return (
    username ||
    phone ||
    user.name ||
    user.email ||
    `用户${user.uid.slice(0, 6)}`
  );
};

const parseMeta = (meta: unknown) => {
  if (!meta) return {};
  if (typeof meta === "string") {
    try {
      return JSON.parse(meta) as Record<string, unknown>;
    } catch (error) {
      console.warn("Failed to parse user_profile.meta", error);
      return {};
    }
  }
  if (typeof meta === "object") {
    return meta as Record<string, unknown>;
  }
  return {};
};

const AccountPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [profileMeta, setProfileMeta] = React.useState<Record<string, unknown>>(
    {}
  );

  React.useEffect(() => {
    let isMounted = true;
    const client = getCloudbaseClient();
    if (!client) return;

    const loadProfile = async (
      db: CloudbaseClient["db"],
      user: CurrentUser | null
    ) => {
      if (!user) return;
      const { data, error } = await db
        .from("user_profile")
        .select("meta")
        .eq("uid", user.uid)
        .eq("owner", user.uid)
        .limit(1);

      if (error) {
        console.warn("Failed to load user_profile meta", error);
        return;
      }

      if (isMounted) {
        setProfileMeta(parseMeta(data?.[0]?.meta));
      }
    };

    const loadUser = async () => {
      try {
        const user = await client.auth.getCurrentUser();
        if (isMounted) {
          setCurrentUser(user || null);
          setIsLoading(false);
        }
        await loadProfile(client.db, user || null);
      } catch (error) {
        console.error("Failed to load CloudBase user", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    client.auth.onLoginStateChanged(async (params) => {
      const eventType = params?.data?.eventType;
      if (eventType === "sign_in") {
        try {
          const user = await client.auth.getCurrentUser();
          if (isMounted) {
            setCurrentUser(user || null);
          }
          await loadProfile(client.db, user || null);
        } catch (error) {
          console.error("Failed to refresh user after sign in", error);
        }
      }

      if (eventType === "sign_out" || eventType === "refresh_token_failed") {
        if (isMounted) {
          setCurrentUser(null);
          setProfileMeta({});
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async () => {
    try {
      router.push("/login?redirect=%2Faccount");
    } catch (error) {
      console.error("Login redirect failed", error);
    }
  };

  const displayName = getDisplayName(currentUser);
  const avatarUrl = currentUser?.picture || "";
  const phoneNumber = getUserPhone(currentUser);
  const passwordSet = profileMeta["password_set"] === true;
  const passwordSkipped = profileMeta["password_skipped"] === true;
  const passwordStatus = passwordSet
    ? "已设置"
    : passwordSkipped
      ? "已跳过"
      : "未设置";
  const metaEmail =
    typeof profileMeta.email === "string" ? profileMeta.email : "";
  const metaPhone =
    typeof profileMeta.phone === "string" ? profileMeta.phone : "";
  const resolvedEmail = currentUser?.email || metaEmail;
  const resolvedPhone = phoneNumber || metaPhone;
  const entitlementPlan = {
    tier: "Pro",
    status: "试用中",
    expiresAt: "2025-06-30",
    cycle: "月付",
    autoRenew: true,
  };
  const usageItems = [
    { label: "对话次数", used: 128, limit: 500, unit: "次" },
    { label: "点数", used: 3600, limit: 10000, unit: "点" },
    { label: "高级模型调用", used: 18, limit: 60, unit: "次" },
  ];

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
              <Link className="block text-foreground" href="/account">
                账号信息
              </Link>
              <Link className="block" href="/account/subscription">
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
                  <h1 className="text-2xl font-semibold">账户中心</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    管理你的账号信息与安全设置。
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

            <div
              id="account"
              className="rounded-2xl border border-secondary/60 bg-card/80 p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                  <User className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">账号信息</h2>
                  <p className="text-sm text-muted-foreground">
                    基础资料与登录标识。
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-secondary/40 bg-muted/30 p-5">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">加载中...</p>
                ) : currentUser ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage
                          src={avatarUrl}
                          alt={displayName || "用户"}
                        />
                        <AvatarFallback>
                          {(displayName || "U").slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-semibold">{displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          UID: {currentUser.uid}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 rounded-lg border border-secondary/40 bg-background/60 px-3 py-2 text-sm">
                        <Mail className="size-4 text-muted-foreground" />
                        <span>{resolvedEmail || "未绑定邮箱"}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-secondary/40 bg-background/60 px-3 py-2 text-sm">
                        <Phone className="size-4 text-muted-foreground" />
                        <span>{resolvedPhone || "未绑定手机号"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    当前未登录，请先完成登录后再进入账号设置。
                  </p>
                )}
              </div>
            </div>

            <div
              id="security"
              className="rounded-2xl border border-secondary/60 bg-card/80 p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                  <ShieldCheck className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">安全设置</h2>
                  <p className="text-sm text-muted-foreground">
                    管理登录密码与账号安全。
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/40 bg-muted/10 p-5">
                <div>
                  <p className="text-base font-semibold">设置登录密码</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    支持邮箱或手机验证码设置密码。
                  </p>
                  {currentUser && (
                    <p className="text-xs text-muted-foreground mt-1">
                      当前状态：{passwordStatus}
                    </p>
                  )}
                </div>
                <Button asChild variant="secondary">
                  <Link href="/account/password">前往设置</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                  <Mail className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">绑定信息</h2>
                  <p className="text-sm text-muted-foreground">
                    在单独页面管理邮箱与手机号。
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/40 bg-muted/10 p-5">
                <div className="text-sm text-muted-foreground">
                  <p>邮箱：{resolvedEmail || "未绑定"}</p>
                  <p>手机号：{resolvedPhone || "未绑定"}</p>
                </div>
                <Button asChild variant="secondary">
                  <Link href="/account/bindings">前往设置</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                  <Sparkles className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">权益管理</h2>
                  <p className="text-sm text-muted-foreground">
                    查看订阅与用量，并快速进入管理页。
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                <div className="grid gap-4">
                  <div className="rounded-xl border border-secondary/40 bg-muted/20 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          AI 权益卡
                        </p>
                        <p className="text-lg font-semibold mt-2">
                          {entitlementPlan.tier} · {entitlementPlan.status}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entitlementPlan.cycle} ·{" "}
                          {entitlementPlan.autoRenew ? "自动续费开启" : "自动续费关闭"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarClock className="size-4" />
                        到期 {entitlementPlan.expiresAt}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-secondary/40 bg-muted/10 p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Gauge className="size-4" />
                      本月用量摘要
                    </div>
                    <div className="mt-4 space-y-4">
                      {usageItems.map((item) => {
                        const percent = Math.min(
                          100,
                          Math.round((item.used / item.limit) * 100)
                        );
                        return (
                          <div key={item.label}>
                            <div className="flex items-center justify-between text-sm">
                              <span>{item.label}</span>
                              <span className="text-muted-foreground">
                                {item.used}/{item.limit}
                                {item.unit}
                              </span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-xl border border-secondary/40 bg-muted/20 p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wallet className="size-4" />
                      快捷入口
                    </div>
                    <div className="mt-4 grid gap-3">
                      <Button asChild>
                        <Link href="/account/subscription">
                          管理订阅
                          <ArrowUpRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="secondary">
                        <Link href="/account/wallet">
                          钱包管理
                          <ArrowUpRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        展示示例数据，后续可对接真实订阅与用量服务。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AccountPage;
