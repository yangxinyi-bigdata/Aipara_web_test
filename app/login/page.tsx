"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getCloudbaseClient } from "@/lib/cloudbase";
import { formatPhoneForDisplay, normalizePhoneForApi } from "@/lib/phone";

type LoginMode = "password" | "code";
type IdentifierType = "phone" | "email" | "invalid";

type IdentifierInfo = {
  type: IdentifierType;
  raw: string;
  normalized: string;
  display: string;
};

type VerificationContext = {
  type: "phone" | "email";
  normalized: string;
  raw: string;
  isUser: boolean;
  verificationInfo: {
    verification_id: string;
    is_user: boolean;
  };
};

const parseIsUser = (value: unknown) =>
  value === true || value === 1 || value === "1";

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

const parseIdentifier = (value: string): IdentifierInfo => {
  const raw = value.trim();
  if (!raw) {
    return { type: "invalid", raw: "", normalized: "", display: "" };
  }
  if (raw.includes("@")) {
    const email = raw.toLowerCase();
    return { type: "email", raw, normalized: email, display: email };
  }
  const cleaned = raw.replace(/\s+/g, "");
  if (/^\+?\d{6,20}$/.test(cleaned)) {
    const normalized = normalizePhoneForApi(raw);
    return {
      type: "phone",
      raw,
      normalized,
      display: formatPhoneForDisplay(normalized),
    };
  }
  return { type: "invalid", raw, normalized: "", display: raw };
};

const sanitizeRedirect = (target: string | null) => {
  if (!target) return "/account";
  const decoded = decodeURIComponent(target);
  if (!decoded.startsWith("/") || decoded.startsWith("/login")) {
    return "/account";
  }
  return decoded;
};

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = sanitizeRedirect(searchParams.get("redirect"));

  const [mode, setMode] = React.useState<LoginMode>("password");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verificationCode, setVerificationCode] = React.useState("");
  const [verificationContext, setVerificationContext] =
    React.useState<VerificationContext | null>(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSendingCode, setIsSendingCode] = React.useState(false);

  const identifierInfo = React.useMemo(
    () => parseIdentifier(identifier),
    [identifier]
  );

  React.useEffect(() => {
    const client = getCloudbaseClient();
    if (!client) return;
    client.auth.getCurrentUser().then((user) => {
      if (user) {
        router.replace(redirectTarget);
      }
    });
  }, [redirectTarget, router]);

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const ensureSignedIn = async (
    client: ReturnType<typeof getCloudbaseClient>
  ) => {
    if (!client) return null;
    const user = await client.auth.getCurrentUser();
    if (!user) {
      throw new Error("登录失败，请重试。");
    }
    return user;
  };

  const resolvePostLoginRedirect = async (
    client: ReturnType<typeof getCloudbaseClient>,
    user: Awaited<ReturnType<typeof ensureSignedIn>>,
    isNewUser: boolean
  ) => {
    if (!client || !user) return redirectTarget;
    if (isNewUser) return "/account/password";
    try {
      const { data } = await client.db
        .from("user_profile")
        .select("meta")
        .eq("uid", user.uid)
        .eq("owner", user.uid)
        .limit(1);
      const meta = parseMeta(data?.[0]?.meta);
      const passwordSet = meta["password_set"] === true;
      const passwordSkipped = meta["password_skipped"] === true;
      if (!passwordSet && !passwordSkipped) {
        return "/account/password";
      }
    } catch (error) {
      console.warn("Failed to resolve post-login redirect", error);
    }
    return redirectTarget;
  };

  const handleModeChange = (nextMode: LoginMode) => {
    setMode(nextMode);
    setVerificationContext(null);
    setVerificationCode("");
    resetMessages();
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    setVerificationContext(null);
    setVerificationCode("");
    resetMessages();
  };

  const handlePasswordLogin = async () => {
    resetMessages();
    if (identifierInfo.type === "invalid") {
      setErrorMessage("请输入手机号或邮箱。");
      return;
    }
    if (!password) {
      setErrorMessage("请输入账号与密码。");
      return;
    }
    const client = getCloudbaseClient();
    if (!client) return;
    setIsSubmitting(true);
    try {
      const result = await client.auth.signIn({
        username: identifierInfo.normalized,
        password,
      });
      if (result?.error) {
        throw result.error;
      }
      const user = await ensureSignedIn(client);
      const nextPath = await resolvePostLoginRedirect(client, user, false);
      router.push(nextPath);
    } catch (error) {
      console.error("Password login failed", error);
      setErrorMessage("账号或密码错误，请重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendVerification = async () => {
    resetMessages();
    if (!identifierInfo.raw) {
      setErrorMessage("请输入手机号或邮箱。");
      return;
    }
    if (identifierInfo.type === "invalid") {
      setErrorMessage("请输入有效手机号或邮箱。");
      return;
    }
    const client = getCloudbaseClient();
    if (!client) return;
    setIsSendingCode(true);
    try {
      const verification =
        identifierInfo.type === "email"
          ? await client.auth.getVerification({ email: identifierInfo.normalized })
          : await client.auth.getVerification({
              phone_number: identifierInfo.normalized,
            });

      setVerificationContext({
        type: identifierInfo.type,
        normalized: identifierInfo.normalized,
        raw: identifierInfo.raw,
        isUser: parseIsUser(verification.is_user),
        verificationInfo: {
          verification_id: verification.verification_id,
          is_user: Boolean(verification.is_user),
        },
      });
      setSuccessMessage("验证码已发送，请查收。");
    } catch (error) {
      console.error("Failed to send verification", error);
      setErrorMessage("验证码发送失败，请稍后重试。");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleCodeLogin = async () => {
    resetMessages();
    if (!verificationContext) {
      setErrorMessage("请先发送验证码。");
      return;
    }
    if (!verificationCode) {
      setErrorMessage("请输入验证码。");
      return;
    }
    const client = getCloudbaseClient();
    if (!client) return;
    setIsSubmitting(true);
    try {
      let isNewUser = !verificationContext.isUser;
      const signUpWithVerification = async () => {
        const verificationTokenRes = await client.auth.verify({
          verification_id: verificationContext.verificationInfo.verification_id,
          verification_code: verificationCode,
        });
        const signUpPayload: Record<string, string> = {
          verification_code: verificationCode,
          verification_token: verificationTokenRes.verification_token,
        };
        if (verificationContext.type === "email") {
          signUpPayload.email = verificationContext.normalized;
        } else {
          signUpPayload.phone_number = verificationContext.normalized;
        }
        const result = await client.auth.signUp(signUpPayload);
        if (result?.error) {
          throw result.error;
        }
        isNewUser = true;
      };

      if (verificationContext.type === "email") {
        const result = await client.auth.signInWithEmail({
          verificationInfo: verificationContext.verificationInfo,
          verificationCode,
          email: verificationContext.normalized,
        });
        if (result?.error) {
          const description = result.error?.error_description || "";
          if (description.includes("User not exist")) {
            await signUpWithVerification();
          } else {
            throw result.error;
          }
        }
      } else {
        const phoneNum = formatPhoneForDisplay(verificationContext.normalized);
        const result = await client.auth.signInWithSms({
          verificationInfo: verificationContext.verificationInfo,
          verificationCode,
          phoneNum,
        });
        if (result?.error) {
          const description = result.error?.error_description || "";
          if (description.includes("User not exist")) {
            await signUpWithVerification();
          } else {
            throw result.error;
          }
        }
      }

      const user = await ensureSignedIn(client);

      const nextPath = await resolvePostLoginRedirect(client, user, isNewUser);
      router.push(nextPath);
    } catch (error) {
      console.error("Verification login failed", error);
      const description =
        (error as { error_description?: string })?.error_description || "";
      if (description.includes("User not exist")) {
        setErrorMessage("账号未注册，请重新获取验证码注册。");
      } else {
        setErrorMessage("验证码错误或已过期，请重新获取。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="pointer-events-none absolute left-[-120px] top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-160px] top-48 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(148,184,255,0.2),transparent_68%)] blur-2xl" />

      <div className="relative w-[95%] md:w-[85%] lg:w-[85%] lg:max-w-screen-xl mx-auto pt-24 pb-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="relative overflow-hidden rounded-3xl border border-secondary/70 bg-card/80 p-8 shadow-sm">
            <div className="absolute right-6 top-6 h-20 w-20 rounded-full border border-primary/20 bg-primary/10" />
            <div className="absolute right-16 top-24 h-10 w-10 rounded-full border border-primary/20 bg-primary/20" />

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-secondary bg-primary text-primary-foreground">
                <ChevronsDown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aipara 登录中心</p>
                <h1 className="text-2xl font-semibold text-foreground">
                  登录 / 注册
                </h1>
              </div>
            </div>

            <p className="mt-6 text-base text-muted-foreground">
              请输入账号完成登录或注册。
            </p>
          </section>

          <section className="rounded-3xl border border-secondary/70 bg-card/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">账号登录</h2>
              <Link className="text-sm text-primary" href="/">
                返回首页
              </Link>
            </div>

            <div className="mt-5 flex rounded-full border border-secondary bg-secondary/40 p-1">
              <button
                type="button"
                onClick={() => handleModeChange("password")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
                  mode === "password"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                密码登录
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("code")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
                  mode === "code"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                验证码登录 / 注册
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="identifier">手机号 / 邮箱</Label>
                <Input
                  id="identifier"
                  value={identifier}
                  placeholder="请输入手机号或邮箱"
                  onChange={(event) => handleIdentifierChange(event.target.value)}
                />
              </div>

              {mode === "password" ? (
                <div className="grid gap-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="请输入密码"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="grid gap-2">
                    <Label htmlFor="verificationCode">验证码</Label>
                    <Input
                      id="verificationCode"
                      value={verificationCode}
                      placeholder="请输入验证码"
                      onChange={(event) =>
                        setVerificationCode(event.target.value)
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSendVerification}
                    disabled={isSendingCode}
                    className="sm:mb-1"
                  >
                    {isSendingCode ? "发送中..." : "发送验证码"}
                  </Button>
                </div>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
                  {successMessage}
                </div>
              )}

              <Button
                className="h-11 w-full text-base"
                onClick={mode === "password" ? handlePasswordLogin : handleCodeLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? "处理中..." : "立即登录"}
              </Button>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
