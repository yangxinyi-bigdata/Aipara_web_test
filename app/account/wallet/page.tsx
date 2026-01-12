"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  FileText,
  LogIn,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCloudbaseClient, type CloudbaseClient } from "@/lib/cloudbase";
import { callProfileService } from "@/lib/profile-service";

type CurrentUser = Awaited<
  ReturnType<CloudbaseClient["auth"]["getCurrentUser"]>
>;

type WalletFlow = {
  id: string;
  type: "充值" | "消费" | "退款" | "返还" | "赠送" | "订阅" | "调整" | "其他";
  amount: number;
  balanceAfter: number;
  createdAt: string;
  note: string;
};

type WalletProfile = {
  balance_amount: number | string | null;
  balance_currency: string | null;
  subscription_end_at: string | null;
};

type BillingRecord = {
  id: number | string;
  txn_type: string | null;
  amount: number | string | null;
  currency: string | null;
  status: string | null;
  order_id: string | null;
  provider: string | null;
  remark: string | null;
  created_at: string | null;
};

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatDateTime = (value: unknown) => {
  if (!value) return "--";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
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

const mapTxnType = (type: string | null): WalletFlow["type"] => {
  const normalized = (type || "").toLowerCase();
  if (normalized === "recharge") return "充值";
  if (normalized === "subscription") return "订阅";
  if (normalized === "refund") return "退款";
  if (normalized === "adjust") return "调整";
  if (normalized === "gift") return "赠送";
  if (normalized === "consume" || normalized === "spend") return "消费";
  return "其他";
};

const WalletPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );
  const [profile, setProfile] = React.useState<WalletProfile | null>(null);
  const [flows, setFlows] = React.useState<WalletFlow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const isMountedRef = React.useRef(true);

  const loadWallet = React.useCallback(
    async (db: CloudbaseClient["db"], user: CurrentUser | null) => {
      setIsLoading(true);
      if (!user) {
        if (isMountedRef.current) {
          setProfile(null);
          setFlows([]);
          setIsLoading(false);
        }
        return;
      }

      const [profileResult, billingResult] = await Promise.all([
        db
          .from("user_profile")
          .select("balance_amount,balance_currency,subscription_end_at")
          .eq("uid", user.uid)
          .eq("owner", user.uid)
          .limit(1),
        db
          .from("user_billing_ledger")
          .select(
            "id,txn_type,amount,currency,status,order_id,provider,remark,created_at"
          )
          .eq("uid", user.uid)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      if (profileResult.error) {
        console.warn("Failed to load user_profile wallet", profileResult.error);
      }
      if (billingResult.error) {
        console.warn(
          "Failed to load user_billing_ledger records",
          billingResult.error
        );
      }

      const nextProfile =
        (profileResult.data?.[0] as WalletProfile | undefined) ?? null;
      const records = (billingResult.data as BillingRecord[] | undefined) ?? [];
      const latestBalance = parseNumber(nextProfile?.balance_amount);

      let runningBalance = latestBalance;
      const nextFlows = records.map((record) => {
        const amount = parseNumber(record.amount);
        const balanceAfter = runningBalance;
        runningBalance = runningBalance - amount;

        return {
          id: record.order_id || `TX-${record.id}`,
          type: mapTxnType(record.txn_type),
          amount,
          balanceAfter,
          createdAt: formatDateTime(record.created_at),
          note:
            record.remark ||
            record.provider ||
            record.status ||
            "账务变动",
        };
      });

      if (isMountedRef.current) {
        setProfile(nextProfile);
        setFlows(nextFlows);
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
        await loadWallet(client.db, user || null);
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
        await loadWallet(client.db, user || null);
      }

      if (eventType === "sign_out" || eventType === "refresh_token_failed") {
        if (isMountedRef.current) {
          setCurrentUser(null);
          setProfile(null);
          setFlows([]);
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [loadWallet]);

  const handleLogin = async () => {
    try {
      router.push("/login?redirect=%2Faccount%2Fwallet");
    } catch (error) {
      console.error("Login redirect failed", error);
    }
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
    }).format(value);

  const formatSignedMoney = (value: number) => {
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    return `${sign}${formatMoney(Math.abs(value))}`;
  };

  const handleRecharge = async () => {
    const client = getCloudbaseClient();
    if (!client) return;
    const user = currentUser || (await client.auth.getCurrentUser());
    if (!user) {
      await handleLogin();
      return;
    }

    setIsUpdating(true);
    try {
      await callProfileService("wallet.recharge", {}, client);
      await loadWallet(client.db, user);
    } catch (error) {
      console.error("Failed to recharge wallet", error);
      window.alert("充值失败，请稍后重试。");
    } finally {
      setIsUpdating(false);
    }
  };

  const balanceAmount = parseNumber(profile?.balance_amount);
  const balanceExpireAt = formatDate(profile?.subscription_end_at);

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
              <Link className="block" href="/account/subscription">
                订阅管理
              </Link>
              <Link className="block text-foreground" href="/account/wallet">
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
                  <h1 className="text-2xl font-semibold">钱包管理</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    充值、查余额、查流水、控风险。
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

            <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                  <Wallet className="size-5 text-foreground" />
                </div>
              <div>
                <h2 className="text-xl font-semibold">余额与有效期</h2>
                <p className="text-sm text-muted-foreground">
                  余额 {formatMoney(balanceAmount)} · 余额有效期至{" "}
                  {isLoading ? "加载中..." : balanceExpireAt}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
              <div className="rounded-xl border border-secondary/40 bg-muted/10 p-5">
                <p className="text-sm text-muted-foreground">账户余额</p>
                <p className="text-2xl font-semibold mt-2">
                  {formatMoney(balanceAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  暂无赠送余额信息
                </p>
              </div>
              <div className="rounded-xl border border-secondary/40 bg-muted/10 p-5">
                <p className="text-sm text-muted-foreground">风控状态</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <ShieldCheck className="size-4" />
                    账户正常
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    近期无异常扣费记录
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleRecharge} disabled={isUpdating}>
                  立即充值
                </Button>
                <Button variant="secondary">
                  <Download className="mr-2 size-4" />
                  导出 CSV
                </Button>
                <Button variant="secondary">
                  <FileText className="mr-2 size-4" />
                  发票关联
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                  <FileText className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">余额流水</h2>
                  <p className="text-sm text-muted-foreground">
                    充值、消费、退款/返还与赠送记录。
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {flows.length === 0 ? (
                  <div className="rounded-xl border border-secondary/40 bg-muted/10 p-4 text-sm text-muted-foreground">
                    {isLoading ? "加载中..." : "暂无流水记录"}
                  </div>
                ) : (
                  flows.map((flow) => (
                  <div
                    key={flow.id}
                    className="rounded-xl border border-secondary/40 bg-muted/10 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {flow.type} · {flow.note}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {flow.createdAt} · 单号 {flow.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            flow.amount > 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {formatSignedMoney(flow.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          余额 {formatMoney(flow.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default WalletPage;
