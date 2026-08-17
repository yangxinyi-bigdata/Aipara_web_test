"use client";
import { ChevronsDown, Download, LogIn, Menu, Settings } from "lucide-react";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
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
import {
  getCloudbaseClient,
  type AuthStateChangeEvent,
  type CloudbaseClient,
} from "@/lib/cloudbase";
import { callProfileService } from "@/lib/profile-service";
import { getUserPhone, normalizePhoneForApi } from "@/lib/phone";
import { getUserPicture, getUserUid } from "@/lib/user";
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
    title: "独创段落输入 · 一次输入一段",
    description: "无论中文，英文，标点符号，一刻不停一次输入完成。",
  },
  {
    title: "AI拼音助手 · 省心输入效率超高",
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
    `用户${getUserUid(user).slice(0, 6) || "未命名"}`
  );
};

const buildBaseMeta = (user: CurrentUser) => {
  const phone = getUserPhone(user);
  const phoneE164 = phone ? normalizePhoneForApi(phone) : "";
  return {
    name: user?.name || null,
    email: user?.email || null,
    phone: phone || null,
    phone_e164: phoneE164 || null,
    picture: getUserPicture(user) || null,
  };
};

const buildProfilePayload = (user: CurrentUser) => {
  if (!user) return null;
  const baseMeta = buildBaseMeta(user);
  const phone = getUserPhone(user);

  return {
    display_name: getDisplayName(user),
    avatar_url: getUserPicture(user),
    email: user.email || null,
    phone: phone || null,
    meta: baseMeta,
  };
};

const syncUserProfile = async (client: CloudbaseClient, user: CurrentUser) => {
  if (!user) return;
  const profilePayload = buildProfilePayload(user);
  if (!profilePayload) return;
  const result = await callProfileService(
    "profile.sync",
    profilePayload,
    client
  );
  return (result as { meta?: Record<string, unknown> } | null)?.meta ?? null;
};


export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuDesktopRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const displayName = React.useMemo(
    () => getDisplayName(currentUser),
    [currentUser]
  );

  const avatarUrl = getUserPicture(currentUser);

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

        const meta = await syncUserProfile(client, user);
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
    client.auth.onLoginStateChanged(async (params: AuthStateChangeEvent) => {
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
          const meta = await syncUserProfile(client, user);
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
      if (userMenuDesktopRef.current?.contains(target)) {
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
    <header className="shadow-inner bg-opacity-15 w-[95%] min-[1280px]:w-[85%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl grid grid-cols-[auto_minmax(0,1fr)_auto] min-[1050px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 p-2 bg-card">
      <Link
        href="/"
        className="font-bold text-base sm:text-lg flex items-center gap-2 whitespace-nowrap flex-shrink-0"
      >
        <ChevronsDown className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-1 sm:mr-2 border text-white shrink-0 aspect-square" />
        AI段落输入法
      </Link>

      {/* <!-- Desktop --> */}
      <NavigationMenu className="hidden min-[1050px]:flex min-w-0 justify-self-center justify-center ml-0">
        <NavigationMenuList className="justify-center gap-0 whitespace-nowrap">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-base px-1.5">
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
                className={cn(navigationMenuTriggerStyle(), "text-base px-1.5")}
              >
                <Link href={href}>{label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex flex-shrink-0 items-center justify-self-end gap-1 sm:gap-2">
        <div className="flex items-center gap-1">
          <ToggleTheme compact />
          <Button
            asChild
            size="sm"
            variant="ghost"
            aria-label="立即下载"
            className="h-9 w-9 p-0"
          >
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
            <LogIn className="sm:mr-2 size-4" />
            <span className="hidden sm:inline">登录/注册</span>
          </Button>
        )}
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
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 min-[1050px]:hidden"
              aria-label="打开导航菜单"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
          >
            <SheetHeader className="mb-4 ml-4">
              <SheetTitle className="flex items-center">
                <Link href="/" className="flex items-center">
                  <ChevronsDown className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white" />
                  段落输入法
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
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
