"use client";
import { ChevronsDown, Download, LogIn, Menu, Settings } from "lucide-react";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Separator } from "../ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { ToggleTheme } from "./toogle-theme";
import { cn } from "@/lib/utils";
import { getCloudbaseClient, type CloudbaseClient } from "@/lib/cloudbase";
import { getUserPhone, normalizePhoneForApi } from "@/lib/phone";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";

interface RouteProps {
  href: string;
  label: string;
}

interface FeatureProps {
  title: string;
  description: string;
}

type CurrentUser = Awaited<
  ReturnType<CloudbaseClient["auth"]["getCurrentUser"]>
>;

const routeList: RouteProps[] = [
  {
    href: "#benefits",
    label: "AI深度集成",
  },
  {
    href: "#features",
    label: "功能介绍",
  },
  {
    href: "#download",
    label: "立即下载",
  },
  {
    href: "#faq",
    label: "常见问题",
  },
  {
    href: "#contact",
    label: "联系我们",
  },
];

const featureList: FeatureProps[] = [
  {
    title: "段落输入 · 一次输入一段",
    description: "无论中文，英文，标点符号，一刻不停一次输入完成。",
  },
  {
    title: "AI识别拼音 · 省心输入效率超高",
    description: "AI拼音转换，将一整个段落的拼音一次性转换成中文，准确率高，告别选词。",
  },
  {
    title: "AI对话 · 自定义AI助手候选",
    description: "AI猫娘，AI女友，AI秘书，AI翻译极速对话。",
  },
];

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

const toMysqlDateTime = (date: Date) =>
  date.toISOString().slice(0, 19).replace("T", " ");

const buildBaseMeta = (user: CurrentUser) => {
  const phone = getUserPhone(user);
  const phoneE164 = phone ? normalizePhoneForApi(phone) : "";
  return {
    name: user?.name || null,
    email: user?.email || null,
    phone: phone || null,
    phone_e164: phoneE164 || null,
    picture: user?.picture || null,
  };
};

const buildProfilePayload = (
  user: CurrentUser,
  existingMeta: Record<string, unknown>
) => {
  if (!user) return null;
  const baseMeta = buildBaseMeta(user);
  const mergedMeta = {
    ...existingMeta,
    ...baseMeta,
  };

  const phone = getUserPhone(user);

  return {
    payload: {
      display_name: getDisplayName(user),
      avatar_url: user.picture || "",
      email: user.email || null,
      phone: phone || null,
      last_login_at: toMysqlDateTime(new Date()),
      meta: JSON.stringify(mergedMeta),
    },
    meta: mergedMeta,
  };
};

const syncUserProfile = async (
  db: CloudbaseClient["db"],
  user: CurrentUser
) => {
  if (!user) return;
  const { data, error: queryError } = await db
    .from("user_profile")
    .select("meta")
    .eq("uid", user.uid)
    .eq("owner", user.uid)
    .limit(1);

  if (queryError) {
    console.error("Failed to query user_profile", queryError);
  }

  const existingMeta = parseMeta(data?.[0]?.meta);
  const profilePayload = buildProfilePayload(user, existingMeta);

  if (!profilePayload) return;

  const { error } = await db.from("user_profile").upsert(
    {
      owner: user.uid,
      uid: user.uid,
      role: "user",
      status: 1,
      ...profilePayload.payload,
    },
    {
      onConflict: "uid",
    }
  );

  if (error) {
    console.error("Failed to upsert user_profile", error);
  }

  return profilePayload.meta;
};


export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuDesktopRef = React.useRef<HTMLDivElement>(null);
  const userMenuMobileRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const displayName = React.useMemo(
    () => getDisplayName(currentUser),
    [currentUser]
  );

  const avatarUrl = currentUser?.picture || "";

  React.useEffect(() => {
    let isMounted = true;
    const client = getCloudbaseClient();
    if (!client) return;

    const loadUser = async () => {
      try {
        const user = await client.auth.getCurrentUser();
        if (!user) {
          if (isMounted) {
            setCurrentUser(null);
          }
          return;
        }

        if (typeof user.refresh === "function") {
          await user.refresh();
        }

        if (isMounted) {
          setCurrentUser(user);
        }

        const meta = await syncUserProfile(client.db, user);
        if (
          meta &&
          meta["password_set"] !== true &&
          meta["password_skipped"] !== true &&
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/account/password")
        ) {
          router.push("/account/password");
        }
      } catch (error) {
        console.error("Failed to load CloudBase user", error);
      }
    };

    loadUser();
    client.auth.onLoginStateChanged(async (params) => {
      const eventType = params?.data?.eventType;

      if (eventType === "sign_in") {
        try {
          const user = await client.auth.getCurrentUser();
          if (!user) return;
          if (typeof user.refresh === "function") {
            await user.refresh();
          }
          if (isMounted) {
            setCurrentUser(user);
          }
          const meta = await syncUserProfile(client.db, user);
          if (
            meta &&
            meta["password_set"] !== true &&
            meta["password_skipped"] !== true &&
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/account/password")
          ) {
            router.push("/account/password");
          }
        } catch (error) {
          console.error("Failed to sync user after sign in", error);
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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        userMenuDesktopRef.current?.contains(target) ||
        userMenuMobileRef.current?.contains(target)
      ) {
        return;
      }
      setIsUserMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogin = async () => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
    try {
      router.push("/login?redirect=%2Faccount");
    } catch (error) {
      console.error("Login redirect failed", error);
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
    const client = getCloudbaseClient();
    if (!client) return;
    try {
      await client.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("CloudBase sign out failed", error);
    }
  };

  return (
    <header className="shadow-inner bg-opacity-15 w-[95%] md:w-[85%] lg:w-[85%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center gap-4 p-2 bg-card">
      <Link
        href="/"
        className="font-bold text-lg flex items-center gap-2 whitespace-nowrap flex-shrink-0"
      >
        <ChevronsDown className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white shrink-0 aspect-square" />
        AI段落输入法
      </Link>
      {/* <!-- Mobile --> */}
      <div className="flex items-center lg:hidden">
        <Sheet
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setIsUserMenuOpen(false);
            }
          }}
        >
          <SheetTrigger asChild>
            <Menu
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer lg:hidden"
            />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <ChevronsDown className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white" />
                    Aipara 输入法
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {routeList.map(({ href, label }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}
              </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-2" />

              <ToggleTheme />
              {currentUser ? (
                <div className="mt-3 flex w-full items-center gap-3 rounded-lg border border-secondary bg-card/40 px-3 py-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl} alt={displayName || "用户"} />
                    <AvatarFallback>
                      {(displayName || "U").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      已登录
                    </p>
                  </div>
                  <div ref={userMenuMobileRef} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2"
                      aria-haspopup="menu"
                      aria-expanded={isUserMenuOpen}
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    >
                      <Settings className="size-4" />
                    </Button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full z-50 w-40">
                        <div className="h-2" />
                        <div
                          role="menu"
                          className="rounded-lg border border-secondary/70 bg-card shadow-lg"
                        >
                          <Button
                            asChild
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setIsOpen(false);
                              setIsUserMenuOpen(false);
                            }}
                          >
                            <Link href="/account">账号设置</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={handleLogout}
                          >
                            退出
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={handleLogin}
                  aria-label="登录/注册"
                >
                  <LogIn className="mr-2 size-4" />
                  登录/注册
                </Button>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* <!-- Desktop --> */}
      <NavigationMenu className="hidden lg:flex flex-1 min-w-0 justify-center ml-0">
        <NavigationMenuList className="justify-center gap-0 whitespace-nowrap">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-base px-2">
              功能亮点
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[600px] grid-cols-2 gap-5 p-4">
                <Image
                  src="https://avatars.githubusercontent.com/u/75042455?v=4"
                  alt="RadixLogo"
                  className="h-full w-full rounded-md object-cover"
                  width={600}
                  height={600}
                />
                <ul className="flex flex-col gap-2">
                  {featureList.map(({ title, description }) => (
                    <li
                      key={title}
                      className="rounded-md p-3 text-sm hover:bg-muted"
                    >
                      <p className="mb-1 font-semibold leading-none text-foreground">
                        {title}
                      </p>
                      <p className="line-clamp-2 text-muted-foreground">
                        {description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {routeList.map(({ href, label }) => (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink
                asChild
                className={cn(navigationMenuTriggerStyle(), "text-base px-2")}
              >
                <Link href={href}>{label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="hidden lg:flex flex-shrink-0 items-center gap-6 ml-0">
        <div className="flex items-center gap-1">
          <ToggleTheme />
          <Button asChild size="sm" variant="ghost" aria-label="立即下载">
            <Link aria-label="立即下载" href="#download" target="_self">
              <Download className="size-5" />
            </Link>
          </Button>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-1 rounded-full border border-secondary/70 bg-card/60 px-1 py-1 w-[180px] flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={displayName || "用户"} />
              <AvatarFallback>
                {(displayName || "U").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-none max-w-[120px] truncate text-sm font-medium">
              {displayName}
            </span>
            <div
              ref={userMenuDesktopRef}
              className="relative"
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
              >
                <Settings className="size-4" />
              </Button>
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full z-50 w-44">
                  <div className="h-2" />
                  <div
                    role="menu"
                    className="rounded-lg border border-secondary/70 bg-card shadow-lg"
                  >
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Link href="/account">账号设置</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      退出
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={handleLogin}>
            <LogIn className="mr-2 size-4" />
            登录/注册
          </Button>
        )}
      </div>
    </header>
  );
};
