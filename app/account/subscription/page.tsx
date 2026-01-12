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
import { callProfileService } from "@/lib/profile-service";

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

type PlanDefinition = {
  tier: "free" | "pro";
  name: string;
  price: string;
  highlight?: string;
  features: string[];
  badge?: "free" | "pro";
};

const planDefinitions: PlanDefinition[] = [
  {
    tier: "free",
    name: "免费版",
    price: "¥0/月",
    highlight: "基础功能试用",
    features: ["标准模型", "基础模板", "社区支持"],
    badge: "free",
  },
  {
    tier: "pro",
    name: "Pro",
    price: "¥49/月",
    highlight: "效率与高级模型",
    features: ["高级模型", "多端同步", "优先客服"],
    badge: "pro",
  },
];

const RENEW_FAIL_SUPPRESS_KEY = "aipara.renew.fail.suppress";

type ProfileSnapshot = {
  plan_tier: string | null;
  subscription_status: string | null;
  subscription_start_at: string | null;
  subscription_end_at: string | null;
  auto_renew: number | boolean | null;
  points_balance: number | string | null;
  balance_amount: number | string | null;
  points_reset_at: string | null;
  chat_count_total: number | string | null;
  pro_model_calls_total: number | string | null;
};

type SubscriptionRecord = {
  id?: number | string | null;
  plan_tier: string | null;
  status: string | null;
  start_at: string | null;
  end_at: string | null;
  auto_renew: number | boolean | null;
  points_quota: number | string | null;
  chat_quota: number | string | null;
  pro_quota: number | string | null;
  price_amount: number | string | null;
  currency: string | null;
  order_id: string | null;
};

type PlanCatalog = {
  plan_tier: string | null;
  chat_limit: number | string | null;
  points_limit: number | string | null;
  pro_limit: number | string | null;
};

const parseBoolean = (value: unknown) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  value === "true" ||
  value === "TRUE";

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatDate = (value: unknown) => {
  if (!value) return "--";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const resolveCycle = (
  startAt: string | null | undefined,
  endAt: string | null | undefined
): BillingCycle => {
  if (!startAt || !endAt) return "month";
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "month";
  }
  const diffDays = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays >= 300 ? "year" : "month";
};

const planLabelMap: Record<string, string> = {
  free: "免费版",
  trial: "试用",
  pro: "Pro",
};

const formatLimitText = (
  label: string,
  limit: number,
  unit: string,
  unlimitedLabel: string
) =>
  limit > 0
    ? `${label} ${limit.toLocaleString("zh-CN")}${unit}`
    : `${label}${unlimitedLabel}`;

const fallbackCatalog: Record<string, PlanCatalog> = {
  free: { plan_tier: "free", chat_limit: 100, points_limit: 1000, pro_limit: 0 },
  pro: { plan_tier: "pro", chat_limit: 0, points_limit: 50000, pro_limit: 0 },
};

const buildPlanCards = (catalogMap: Record<string, PlanCatalog>): PlanCard[] =>
  planDefinitions.map((definition) => {
    const catalog = catalogMap[definition.tier] || fallbackCatalog[definition.tier];
    const chatLimit = parseNumber(catalog?.chat_limit);
    const pointsLimit = parseNumber(catalog?.points_limit);
    const proLimit = parseNumber(catalog?.pro_limit);
    const proLimitLabel =
      proLimit > 0
        ? `高级模型 ${proLimit.toLocaleString("zh-CN")} 次/月`
        : definition.tier === "pro"
          ? "高级模型不限"
          : "高级模型不可用";
    const limits = [
      formatLimitText("对话", chatLimit, " 次/月", "次数不限"),
      formatLimitText("点数", pointsLimit, "", "不限"),
      proLimitLabel,
    ];

    return {
      name: definition.name,
      price: definition.price,
      highlight: definition.highlight,
      features: definition.features,
      limits,
      badge: definition.badge,
    };
  });

const SubscriptionPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );
  const [autoRenew, setAutoRenew] = React.useState(true);
  const [cycle, setCycle] = React.useState<BillingCycle>("month");
  const [profile, setProfile] = React.useState<ProfileSnapshot | null>(null);
  const [latestSubscription, setLatestSubscription] =
    React.useState<SubscriptionRecord | null>(null);
  const [planCatalogMap, setPlanCatalogMap] = React.useState<
    Record<string, PlanCatalog>
  >({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [renewFailOpen, setRenewFailOpen] = React.useState(false);
  const [renewFailMessage, setRenewFailMessage] = React.useState("");
  const [renewFailDontShow, setRenewFailDontShow] = React.useState(false);
  const [suppressRenewFailAlert, setSuppressRenewFailAlert] =
    React.useState(false);
  const [actionSuccessOpen, setActionSuccessOpen] = React.useState(false);
  const [actionSuccessTitle, setActionSuccessTitle] = React.useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = React.useState("");
  const isMountedRef = React.useRef(true);

  const loadSubscription = React.useCallback(
    async (db: CloudbaseClient["db"], user: CurrentUser | null) => {
      setIsLoading(true);
      const { data: catalogData, error: catalogError } = await db
        .from("plan_catalog")
        .select("plan_tier,chat_limit,points_limit,pro_limit")
        .in("plan_tier", ["free", "pro"])
        .eq("is_active", 1);

      if (catalogError) {
        console.warn("Failed to load plan_catalog", catalogError);
      }

      const catalogMap: Record<string, PlanCatalog> = {};
      (catalogData as PlanCatalog[] | undefined)?.forEach((item) => {
        if (item.plan_tier) {
          catalogMap[String(item.plan_tier).toLowerCase()] = item;
        }
      });

      if (!user) {
        if (isMountedRef.current) {
          setProfile(null);
          setLatestSubscription(null);
          setPlanCatalogMap(catalogMap);
          setIsLoading(false);
        }
        return;
      }

      const [profileResult, subscriptionResult] = await Promise.all([
        db
          .from("user_profile")
          .select(
            "plan_tier,subscription_status,subscription_start_at,subscription_end_at,auto_renew,points_balance,balance_amount,points_reset_at,chat_count_total,pro_model_calls_total"
          )
          .eq("uid", user.uid)
          .eq("owner", user.uid)
          .limit(1),
        db
          .from("user_subscription")
          .select(
            "id,plan_tier,status,start_at,end_at,auto_renew,points_quota,chat_quota,pro_quota,price_amount,currency,order_id"
          )
          .eq("uid", user.uid)
          .order("start_at", { ascending: false })
          .limit(1),
      ]);

      if (profileResult.error) {
        console.warn(
          "Failed to load user_profile subscription",
          profileResult.error
        );
      }
      if (subscriptionResult.error) {
        console.warn(
          "Failed to load user_subscription record",
          subscriptionResult.error
        );
      }

      const nextProfile =
        (profileResult.data?.[0] as ProfileSnapshot | undefined) ?? null;
      const nextSubscription =
        (subscriptionResult.data?.[0] as SubscriptionRecord | undefined) ??
        null;

      if (isMountedRef.current) {
        setProfile(nextProfile);
        setLatestSubscription(nextSubscription);
        setPlanCatalogMap(catalogMap);

        const resolvedAutoRenew = parseBoolean(
          nextProfile?.auto_renew ?? nextSubscription?.auto_renew
        );
        setAutoRenew(resolvedAutoRenew);

        const resolvedCycle = resolveCycle(
          nextSubscription?.start_at ?? nextProfile?.subscription_start_at,
          nextSubscription?.end_at ?? nextProfile?.subscription_end_at
        );
        setCycle(resolvedCycle);
        setIsLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    const client = getCloudbaseClient();
    if (!client) return;

    isMountedRef.current = true;

    const loadUser = async () => {
      try {
        const user = await client.auth.getCurrentUser();
        if (isMountedRef.current) {
          setCurrentUser(user || null);
        }
        await loadSubscription(client.db, user || null);
      } catch (error) {
        console.error("Failed to load CloudBase user", error);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    client.auth.onLoginStateChanged(async (params) => {
      const eventType = params?.data?.eventType;
      if (eventType === "sign_in") {
        const user = await client.auth.getCurrentUser();
        if (isMountedRef.current) {
          setCurrentUser(user || null);
        }
        await loadSubscription(client.db, user || null);
      }

      if (eventType === "sign_out" || eventType === "refresh_token_failed") {
        if (isMountedRef.current) {
          setCurrentUser(null);
          setProfile(null);
          setLatestSubscription(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [loadSubscription]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(RENEW_FAIL_SUPPRESS_KEY);
    if (stored === "1") {
      setSuppressRenewFailAlert(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      router.push("/login?redirect=%2Faccount%2Fsubscription");
    } catch (error) {
      console.error("Login redirect failed", error);
    }
  };

  const openRenewFailDialog = (message: string) => {
    if (suppressRenewFailAlert) return;
    setRenewFailMessage(message);
    setRenewFailDontShow(false);
    setRenewFailOpen(true);
  };

  const closeRenewFailDialog = () => {
    if (renewFailDontShow && !suppressRenewFailAlert) {
      setSuppressRenewFailAlert(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RENEW_FAIL_SUPPRESS_KEY, "1");
      }
    }
    setRenewFailOpen(false);
  };

  const openSuccessDialog = (title: string, message: string) => {
    setActionSuccessTitle(title);
    setActionSuccessMessage(message);
    setActionSuccessOpen(true);
  };

  const closeSuccessDialog = () => {
    setActionSuccessOpen(false);
  };

  const handleUpgrade = async () => {
    if (!currentUser) {
      await handleLogin();
      return;
    }
    if (planTier === "pro") return;
    const client = getCloudbaseClient();
    if (!client) return;

    const balanceAmount = parseNumber(profile?.balance_amount);
    if (balanceAmount < 10) {
      window.alert("余额不足，无法升级到 Pro。");
      return;
    }

    setIsUpdating(true);
    try {
      await callProfileService(
        "subscription.upgrade",
        { auto_renew: autoRenew },
        client
      );
      await loadSubscription(client.db, currentUser);
      openSuccessDialog("升级成功", "已切换为 Pro 套餐。");
    } catch (error) {
      console.error("Failed to upgrade subscription", error);
      window.alert("升级失败，请稍后重试。");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentUser) {
      await handleLogin();
      return;
    }
    if (planTier !== "pro") return;
    const client = getCloudbaseClient();
    if (!client) return;

    setIsUpdating(true);
    try {
      await callProfileService("subscription.cancel", {}, client);
      await loadSubscription(client.db, currentUser);
      openSuccessDialog("取消订阅成功", "已降级为免费版。");
    } catch (error) {
      console.error("Failed to cancel subscription", error);
      window.alert("取消订阅失败，请稍后重试。");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRenew = async () => {
    if (!currentUser) {
      await handleLogin();
      return;
    }
    if (planTier !== "pro") {
      window.alert("当前不是 Pro 套餐，无法续费。");
      return;
    }
    const client = getCloudbaseClient();
    if (!client) return;

    const balanceAmount = parseNumber(profile?.balance_amount);
    if (balanceAmount < 10) {
      openRenewFailDialog("余额不足，续费失败。");
      return;
    }

    setIsUpdating(true);
    try {
      await callProfileService("subscription.renew", {}, client);
      await loadSubscription(client.db, currentUser);
      openSuccessDialog("续费成功", "已延长一个月有效期。");
    } catch (error) {
      console.error("Failed to renew subscription", error);
      openRenewFailDialog("续费失败，请稍后重试。");
    } finally {
      setIsUpdating(false);
    }
  };

  const planTierRaw =
    latestSubscription?.plan_tier ?? profile?.plan_tier ?? "free";
  const planTier = String(planTierRaw || "free").toLowerCase();
  const catalogTier = planTier === "trial" ? "free" : planTier;
  const catalogForPlan = planCatalogMap[catalogTier];
  const planLabel = planLabelMap[planTier] ?? planTierRaw ?? "免费版";
  const cycleLabel = cycle === "month" ? "月付" : "年付";
  const subscriptionEndAt = formatDate(
    latestSubscription?.end_at ?? profile?.subscription_end_at
  );
  const statusLabelRaw =
    latestSubscription?.status ?? profile?.subscription_status ?? "";
  const statusText = statusLabelRaw ? String(statusLabelRaw) : "";
  const showBillingInfo = planTier === "pro";
  const planMetaParts = [planLabel];

  if (showBillingInfo) {
    planMetaParts.push(
      cycleLabel,
      autoRenew ? "自动续费开启" : "自动续费关闭"
    );
  }

  if (statusText) {
    planMetaParts.push(statusText);
  }

  const planMetaLine = planMetaParts.join(" · ");
  const pointsBalance = parseNumber(profile?.points_balance);
  const pointsQuotaFromSub = parseNumber(latestSubscription?.points_quota);
  const pointsQuotaFromCatalog = parseNumber(catalogForPlan?.points_limit);
  const pointsQuota =
    pointsQuotaFromSub > 0 ? pointsQuotaFromSub : pointsQuotaFromCatalog;
  const chatQuotaFromSub = parseNumber(latestSubscription?.chat_quota);
  const chatQuotaFromCatalog = parseNumber(catalogForPlan?.chat_limit);
  const chatQuota =
    chatQuotaFromSub > 0 ? chatQuotaFromSub : chatQuotaFromCatalog;
  const proQuotaFromSub = parseNumber(latestSubscription?.pro_quota);
  const proQuotaFromCatalog = parseNumber(catalogForPlan?.pro_limit);
  const proQuota =
    proQuotaFromSub > 0 ? proQuotaFromSub : proQuotaFromCatalog;
  const chatCountTotal = parseNumber(profile?.chat_count_total);
  const proModelCallsTotal = parseNumber(profile?.pro_model_calls_total);
  const plans = buildPlanCards(planCatalogMap);

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
                    订阅全生命周期管理（开通/升级/续费/取消）。
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
                      {planMetaLine}
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
                      到期日：{isLoading ? "加载中..." : subscriptionEndAt}
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
                    <p className="text-sm font-medium">订阅额度</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      当前点数：{pointsBalance} · 本期配额：{pointsQuota || "--"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      累计对话：{chatCountTotal} · 高级模型调用：
                      {proModelCallsTotal}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      对话上限：{chatQuota > 0 ? chatQuota : "不限"} ·
                      高级模型上限：{proQuota > 0 ? proQuota : "不限"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-secondary/40 bg-muted/10 p-4">
                    <p className="text-sm font-medium">订阅动作</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Button
                        variant="secondary"
                        onClick={handleUpgrade}
                        disabled={isUpdating || planTier === "pro"}
                      >
                        升级套餐
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleRenew}
                        disabled={isUpdating || planTier !== "pro"}
                      >
                        续费
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleCancelSubscription}
                        disabled={isUpdating || planTier !== "pro"}
                      >
                        取消订阅
                      </Button>
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
      {renewFailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-secondary/60 bg-card/95 p-5 shadow-lg">
            <p className="text-base font-semibold">续费失败</p>
            <p className="text-sm text-muted-foreground mt-2">
              {renewFailMessage}
            </p>
            <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-secondary bg-background"
                checked={renewFailDontShow}
                onChange={(event) => setRenewFailDontShow(event.target.checked)}
              />
              不再提示（Don't show this again）
            </label>
            <div className="mt-4 flex justify-end">
              <Button onClick={closeRenewFailDialog}>知道了</Button>
            </div>
          </div>
        </div>
      )}
      {actionSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-secondary/60 bg-card/95 p-5 shadow-lg">
            <p className="text-base font-semibold">{actionSuccessTitle}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {actionSuccessMessage}
            </p>
            <div className="mt-4 flex justify-end">
              <Button onClick={closeSuccessDialog}>知道了</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SubscriptionPage;
