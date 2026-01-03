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

type CurrentUser = Awaited<
  ReturnType<CloudbaseClient["auth"]["getCurrentUser"]>
>;

type WalletFlow = {
  id: string;
  type: "充值" | "消费" | "退款" | "返还" | "赠送";
  amount: number;
  balanceAfter: number;
  createdAt: string;
  note: string;
};

const flows: WalletFlow[] = [
  {
    id: "TX-202502-001",
    type: "充值",
    amount: 5000,
    balanceAfter: 12800,
    createdAt: "2025-02-18 10:22",
    note: "年付续费赠送",
  },
  {
    id: "TX-202502-002",
    type: "消费",
    amount: -380,
    balanceAfter: 12420,
    createdAt: "2025-02-20 19:14",
    note: "高级模型调用",
  },
  {
    id: "TX-202502-003",
    type: "赠送",
    amount: 1200,
    balanceAfter: 13620,
    createdAt: "2025-02-24 09:10",
    note: "运营活动赠送",
  },
  {
    id: "TX-202502-004",
    type: "退款",
    amount: 680,
    balanceAfter: 14300,
    createdAt: "2025-02-27 16:40",
    note: "异常扣费返还",
  },
];

const WalletPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );

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
      router.push("/login?redirect=%2Faccount%2Fwallet");
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
                    余额 14,300 点 · 有效期至 2026-01-01
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
                <div className="rounded-xl border border-secondary/40 bg-muted/10 p-5">
                  <p className="text-sm text-muted-foreground">可用点数</p>
                  <p className="text-2xl font-semibold mt-2">14,300</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    其中 3,000 点将于 2025-08-01 过期
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
                <Button>立即充值</Button>
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
                  <h2 className="text-xl font-semibold">点数流水</h2>
                  <p className="text-sm text-muted-foreground">
                    充值、消费、退款/返还与赠送记录。
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {flows.map((flow) => (
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
                          {flow.amount > 0 ? "+" : ""}
                          {flow.amount}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          余额 {flow.balanceAfter}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default WalletPage;
