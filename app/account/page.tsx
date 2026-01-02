"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Phone, User } from "lucide-react";
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

const AccountPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const client = getCloudbaseClient();
    if (!client) return;

    const loadUser = async () => {
      try {
        const user = await client.auth.getCurrentUser();
        if (isMounted) {
          setCurrentUser(user || null);
          setIsLoading(false);
        }
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
        } catch (error) {
          console.error("Failed to refresh user after sign in", error);
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
      router.push("/login?redirect=%2Faccount");
    } catch (error) {
      console.error("Login redirect failed", error);
    }
  };

  const displayName = getDisplayName(currentUser);
  const avatarUrl = currentUser?.picture || "";
  const phoneNumber = getUserPhone(currentUser);

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
              <Link className="block" href="/account/password">
                设置密码
              </Link>
            </div>
            <Button asChild className="mt-6 w-full" variant="secondary">
              <Link href="/">返回首页</Link>
            </Button>
          </aside>

          <section className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">账号信息</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  维护你的基础资料与登录方式。
                </p>
              </div>
              {!currentUser && (
                <Button onClick={handleLogin} variant="secondary">
                  <LogIn className="mr-2 size-4" />
                  去登录
                </Button>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-secondary/40 bg-muted/30 p-5">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">加载中...</p>
              ) : currentUser ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={avatarUrl} alt={displayName || "用户"} />
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
                      <span>{currentUser.email || "未绑定邮箱"}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-secondary/40 bg-background/60 px-3 py-2 text-sm">
                      <Phone className="size-4 text-muted-foreground" />
                      <span>{phoneNumber || "未绑定手机号"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  当前未登录，请先完成登录后再进入账号设置。
                </p>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-secondary/40 bg-muted/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">设置登录密码</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    支持邮箱或手机验证码设置密码。
                  </p>
                </div>
                <Button asChild variant="secondary">
                  <Link href="/account/password">前往设置</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AccountPage;
