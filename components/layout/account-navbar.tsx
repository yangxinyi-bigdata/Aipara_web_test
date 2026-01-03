"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsDown, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCloudbaseClient, type CloudbaseClient } from "@/lib/cloudbase";
import { cn } from "@/lib/utils";
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

export const AccountNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleLogin = () => {
    router.push("/login?redirect=%2Faccount");
  };

  const handleLogout = async () => {
    const client = getCloudbaseClient();
    if (!client) return;
    try {
      await client.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("CloudBase sign out failed", error);
    }
  };

  const displayName = getDisplayName(currentUser);
  const avatarUrl = currentUser?.picture || "";

  return (
    <header className="shadow-inner bg-opacity-15 w-[95%] md:w-[85%] lg:w-[85%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex items-center gap-4 p-2 bg-card">
      <Link
        href="/"
        className="font-bold text-lg flex items-center gap-2 whitespace-nowrap flex-shrink-0"
      >
        <ChevronsDown className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white shrink-0 aspect-square" />
        AI段落输入法
      </Link>
      <nav className="hidden lg:flex flex-1 items-center justify-center gap-6 text-sm text-muted-foreground">
        <Link
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === "/account" && "text-foreground"
          )}
          href="/account"
        >
          账号信息
        </Link>
        <Link
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === "/account/password" && "text-foreground"
          )}
          href="/account/password"
        >
          安全设置
        </Link>
        <Link
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === "/account/bindings" && "text-foreground"
          )}
          href="/account/bindings"
        >
          绑定信息
        </Link>
        <Link
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === "/account/subscription" && "text-foreground"
          )}
          href="/account/subscription"
        >
          订阅管理
        </Link>
        <Link
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === "/account/wallet" && "text-foreground"
          )}
          href="/account/wallet"
        >
          钱包管理
        </Link>
        <Link className="transition-colors hover:text-foreground" href="/">
          返回首页
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        {!currentUser ? (
          <Button size="sm" variant="secondary" onClick={handleLogin}>
            <LogIn className="mr-2 size-4" />
            去登录
          </Button>
        ) : (
          <>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-secondary/60 bg-background/80 px-2 py-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={displayName || "用户"} />
                <AvatarFallback>
                  {(displayName || "U").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[140px] truncate text-sm font-medium text-foreground">
                {displayName}
              </span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              退出
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
