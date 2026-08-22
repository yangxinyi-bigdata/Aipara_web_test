"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogIn, LogOut } from "lucide-react";
import { DuanluoMark } from "@/components/icons/duanluo-mark";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getCloudbaseClient,
  type AuthStateChangeEvent,
  type CloudbaseClient,
} from "@/lib/cloudbase";
import { getUserPhone } from "@/lib/phone";
import { getUserPicture, getUserUid } from "@/lib/user";

type CurrentUser = Awaited<
  ReturnType<CloudbaseClient["auth"]["getCurrentUser"]>
>;

type AccountNavbarProps = {
  variant?: "account" | "auth";
};

const getDisplayName = (user: CurrentUser) => {
  if (!user) return "";
  const username = (user as { username?: string }).username || "";
  const phone = getUserPhone(user);
  return (
    username ||
    phone ||
    user.name ||
    user.email ||
    `用户${getUserUid(user).slice(0, 6) || "未命名"}`
  );
};

export const AccountNavbar = ({ variant = "account" }: AccountNavbarProps) => {
  const router = useRouter();
  const isAuthNavbar = variant === "auth";
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );

  React.useEffect(() => {
    if (isAuthNavbar) return;

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

    client.auth.onLoginStateChanged(async (params: AuthStateChangeEvent) => {
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
  }, [isAuthNavbar]);

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
  const avatarUrl = getUserPicture(currentUser);

  return (
    <header className="shadow-inner bg-opacity-15 w-[95%] md:w-[85%] lg:w-[85%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex items-center gap-4 p-2 bg-card">
      <Link
        href="/"
        className="font-bold text-lg flex items-center gap-2 whitespace-nowrap flex-shrink-0"
      >
        <DuanluoMark className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white shrink-0 aspect-square" />
        AI段落输入法
      </Link>
      <div className="ml-auto flex items-center gap-2">
        {isAuthNavbar ? (
          <>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-secondary/60 bg-background/80 px-4 py-2 text-sm font-medium text-foreground">
              <LogIn className="size-4 text-primary" />
              账号登录
            </div>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 size-4" />
                返回首页
              </Link>
            </Button>
          </>
        ) : !currentUser ? (
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
