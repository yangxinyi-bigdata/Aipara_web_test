"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCloudbaseClient, type CloudbaseClient } from "@/lib/cloudbase";
import { callProfileService } from "@/lib/profile-service";
import {
  formatPhoneForDisplay,
  getUserPhone,
  normalizePhoneForApi,
} from "@/lib/phone";

type CurrentUser = Awaited<
  ReturnType<CloudbaseClient["auth"]["getCurrentUser"]>
>;

type StatusMessage = {
  type: "success" | "error";
  message: string;
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

const getMetaString = (meta: Record<string, unknown>, key: string) => {
  const value = meta[key];
  return typeof value === "string" ? value : "";
};

const buildBaseMeta = (user: CurrentUser | null) => {
  if (!user) return {};
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

const BindingsPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [profileMeta, setProfileMeta] = React.useState<Record<string, unknown>>(
    {}
  );
  const [password, setPassword] = React.useState("");

  const [email, setEmail] = React.useState("");
  const [emailVerificationId, setEmailVerificationId] = React.useState<
    string | null
  >(null);
  const [emailVerificationCode, setEmailVerificationCode] = React.useState("");
  const [emailStatusMessage, setEmailStatusMessage] = React.useState<
    StatusMessage | null
  >(null);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [isBindingEmail, setIsBindingEmail] = React.useState(false);

  const [phone, setPhone] = React.useState("");
  const [phoneVerificationId, setPhoneVerificationId] = React.useState<
    string | null
  >(null);
  const [phoneVerificationCode, setPhoneVerificationCode] = React.useState("");
  const [phoneStatusMessage, setPhoneStatusMessage] = React.useState<
    StatusMessage | null
  >(null);
  const [isSendingPhone, setIsSendingPhone] = React.useState(false);
  const [isBindingPhone, setIsBindingPhone] = React.useState(false);

  const loadProfile = async (
    client: CloudbaseClient,
    user: CurrentUser | null
  ) => {
    if (!user) {
      setProfileMeta({});
      return;
    }

    const { data, error } = await client.db
      .from("user_profile")
      .select("meta")
      .eq("uid", user.uid)
      .eq("owner", user.uid)
      .limit(1);

    if (error) {
      console.error("Failed to load user_profile meta", error);
      return;
    }

    setProfileMeta(parseMeta(data?.[0]?.meta));
  };

  const updateProfileMeta = async (extraMeta: Record<string, unknown>) => {
    const client = getCloudbaseClient();
    if (!client || !currentUser) return;

    const mergedMeta = {
      ...profileMeta,
      ...buildBaseMeta(currentUser),
      ...extraMeta,
    };

    try {
      const result = await callProfileService(
        "profile.updateMeta",
        { meta: mergedMeta },
        client
      );
      const nextMeta =
        (result as { meta?: Record<string, unknown> } | null)?.meta ??
        mergedMeta;
      setProfileMeta(nextMeta);
    } catch (error) {
      console.error("Failed to update user_profile meta", error);
    }
  };

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
        await loadProfile(client, user || null);

        const userPhone = getUserPhone(user);
        if (user?.email) {
          setEmail(user.email);
        }
        if (userPhone) {
          setPhone(formatPhoneForDisplay(userPhone));
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
          await loadProfile(client, user || null);
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

  React.useEffect(() => {
    if (!currentUser) return;
    const metaEmail = getMetaString(profileMeta, "email");
    const metaPhone = getMetaString(profileMeta, "phone");

    if (!email && metaEmail) {
      setEmail(metaEmail);
    }

    if (!phone && metaPhone) {
      setPhone(formatPhoneForDisplay(metaPhone));
    }
  }, [currentUser, profileMeta, email, phone]);

  React.useEffect(() => {
    setEmailVerificationId(null);
    setEmailVerificationCode("");
    setEmailStatusMessage(null);
  }, [email]);

  React.useEffect(() => {
    setPhoneVerificationId(null);
    setPhoneVerificationCode("");
    setPhoneStatusMessage(null);
  }, [phone]);

  const handleLogin = async () => {
    try {
      router.push("/login?redirect=%2Faccount%2Fbindings");
    } catch (error) {
      console.error("Login redirect failed", error);
    }
  };

  const resolvedEmail = currentUser?.email || getMetaString(profileMeta, "email");
  const metaPhone = getMetaString(profileMeta, "phone");
  const resolvedPhone = getUserPhone(currentUser) || formatPhoneForDisplay(metaPhone);
  const passwordReady = profileMeta["password_set"] === true;
  const emailActionLabel = resolvedEmail ? "更换邮箱" : "绑定邮箱";
  const phoneActionLabel = resolvedPhone ? "更换手机号" : "绑定手机号";

  const handleSendEmailCode = async () => {
    const client = getCloudbaseClient();
    if (!client) return;

    const nextEmail = email.trim();
    if (!nextEmail) {
      setEmailStatusMessage({
        type: "error",
        message: "请输入邮箱地址。",
      });
      return;
    }

    if (resolvedEmail && nextEmail === resolvedEmail) {
      setEmailStatusMessage({
        type: "error",
        message: "请输入新的邮箱地址。",
      });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatusMessage(null);
    try {
      const verification = await client.auth.getVerification({ email: nextEmail });
      if (!verification.verification_id) {
        throw new Error("Missing verification_id");
      }
      setEmailVerificationId(verification.verification_id);
      setEmailStatusMessage({
        type: "success",
        message: "验证码已发送，请查收邮箱。",
      });
    } catch (error) {
      console.error("Failed to send email verification", error);
      setEmailStatusMessage({
        type: "error",
        message: "验证码发送失败，请检查邮箱后重试。",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleBindEmail = async () => {
    const client = getCloudbaseClient();
    if (!client) return;

    const nextEmail = email.trim();
    if (!nextEmail) {
      setEmailStatusMessage({
        type: "error",
        message: "请输入邮箱地址。",
      });
      return;
    }

    if (!passwordReady) {
      setEmailStatusMessage({
        type: "error",
        message: "请先设置登录密码后再绑定邮箱。",
      });
      return;
    }

    if (!password) {
      setEmailStatusMessage({
        type: "error",
        message: "请输入登录密码用于安全校验。",
      });
      return;
    }

    if (!emailVerificationId) {
      setEmailStatusMessage({
        type: "error",
        message: "请先获取邮箱验证码。",
      });
      return;
    }

    if (!emailVerificationCode.trim()) {
      setEmailStatusMessage({
        type: "error",
        message: "请输入邮箱验证码。",
      });
      return;
    }

    setIsBindingEmail(true);
    setEmailStatusMessage(null);
    try {
      const sudoRes = await client.auth.sudo({ password });
      if (!sudoRes.sudo_token) {
        throw new Error("Missing sudo_token");
      }

      const verificationTokenRes = await client.auth.verify({
        verification_id: emailVerificationId,
        verification_code: emailVerificationCode.trim(),
      });

      if (!verificationTokenRes.verification_token) {
        throw new Error("Missing verification_token");
      }

      await client.auth.bindEmail({
        email: nextEmail,
        sudo_token: sudoRes.sudo_token,
        verification_token: verificationTokenRes.verification_token,
      });

      await updateProfileMeta({
        email: nextEmail,
        email_bound_at: new Date().toISOString(),
      });

      const refreshedUser = await client.auth.getCurrentUser();
      setCurrentUser(refreshedUser || null);

      setEmailStatusMessage({
        type: "success",
        message: "邮箱绑定成功。",
      });
      setEmailVerificationCode("");
    } catch (error) {
      console.error("Failed to bind email", error);
      setEmailStatusMessage({
        type: "error",
        message: "邮箱绑定失败，请检查验证码后重试。",
      });
    } finally {
      setIsBindingEmail(false);
    }
  };

  const handleSendPhoneCode = async () => {
    const client = getCloudbaseClient();
    if (!client) return;

    const normalizedPhone = normalizePhoneForApi(phone);
    if (!normalizedPhone) {
      setPhoneStatusMessage({
        type: "error",
        message: "请输入手机号。",
      });
      return;
    }

    const currentNormalized = resolvedPhone
      ? normalizePhoneForApi(resolvedPhone)
      : "";
    if (currentNormalized && normalizedPhone === currentNormalized) {
      setPhoneStatusMessage({
        type: "error",
        message: "请输入新的手机号。",
      });
      return;
    }

    setIsSendingPhone(true);
    setPhoneStatusMessage(null);
    try {
      const verification = await client.auth.getVerification({
        phone_number: normalizedPhone,
      });
      if (!verification.verification_id) {
        throw new Error("Missing verification_id");
      }
      setPhoneVerificationId(verification.verification_id);
      setPhoneStatusMessage({
        type: "success",
        message: "验证码已发送，请注意查收短信。",
      });
    } catch (error) {
      console.error("Failed to send phone verification", error);
      setPhoneStatusMessage({
        type: "error",
        message: "验证码发送失败，请检查手机号后重试。",
      });
    } finally {
      setIsSendingPhone(false);
    }
  };

  const handleBindPhone = async () => {
    const client = getCloudbaseClient();
    if (!client) return;

    const normalizedPhone = normalizePhoneForApi(phone);
    if (!normalizedPhone) {
      setPhoneStatusMessage({
        type: "error",
        message: "请输入手机号。",
      });
      return;
    }

    if (!passwordReady) {
      setPhoneStatusMessage({
        type: "error",
        message: "请先设置登录密码后再绑定手机号。",
      });
      return;
    }

    if (!password) {
      setPhoneStatusMessage({
        type: "error",
        message: "请输入登录密码用于安全校验。",
      });
      return;
    }

    if (!phoneVerificationId) {
      setPhoneStatusMessage({
        type: "error",
        message: "请先获取短信验证码。",
      });
      return;
    }

    if (!phoneVerificationCode.trim()) {
      setPhoneStatusMessage({
        type: "error",
        message: "请输入短信验证码。",
      });
      return;
    }

    setIsBindingPhone(true);
    setPhoneStatusMessage(null);
    try {
      const sudoRes = await client.auth.sudo({ password });
      if (!sudoRes.sudo_token) {
        throw new Error("Missing sudo_token");
      }

      const verificationTokenRes = await client.auth.verify({
        verification_id: phoneVerificationId,
        verification_code: phoneVerificationCode.trim(),
      });

      if (!verificationTokenRes.verification_token) {
        throw new Error("Missing verification_token");
      }

      await client.auth.bindPhoneNumber({
        phone_number: normalizedPhone,
        sudo_token: sudoRes.sudo_token,
        verification_token: verificationTokenRes.verification_token,
        conflict_resolution: "DEFAULT",
      });

      await updateProfileMeta({
        phone: formatPhoneForDisplay(normalizedPhone),
        phone_e164: normalizedPhone,
        phone_bound_at: new Date().toISOString(),
      });

      const refreshedUser = await client.auth.getCurrentUser();
      setCurrentUser(refreshedUser || null);

      setPhoneStatusMessage({
        type: "success",
        message: "手机号绑定成功。",
      });
      setPhoneVerificationCode("");
    } catch (error) {
      console.error("Failed to bind phone", error);
      setPhoneStatusMessage({
        type: "error",
        message: "手机号绑定失败，请检查验证码后重试。",
      });
    } finally {
      setIsBindingPhone(false);
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
                  <h1 className="text-2xl font-semibold">绑定信息</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    绑定邮箱与手机号，用于登录与找回密码。
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
                  <ShieldCheck className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">当前绑定状态</h2>
                  <p className="text-sm text-muted-foreground">
                    已绑定的信息会用于登录与安全验证。
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

            <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                  <ShieldCheck className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">安全校验</h2>
                  <p className="text-sm text-muted-foreground">
                    绑定或更换需要当前登录密码确认身份。
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <Label htmlFor="password">登录密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入当前登录密码"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {!passwordReady && (
                  <p className="text-xs text-muted-foreground">
                    当前账号未设置密码，请先前往
                    <Link
                      className="text-primary underline underline-offset-4 mx-1"
                      href="/account/password"
                    >
                      设置密码
                    </Link>
                    。
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                    <Mail className="size-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{emailActionLabel}</h2>
                    <p className="text-sm text-muted-foreground">
                      用于邮箱验证码登录与找回密码。
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      placeholder="请输入邮箱"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="grid gap-2">
                      <Label htmlFor="emailCode">验证码</Label>
                      <Input
                        id="emailCode"
                        placeholder="请输入验证码"
                        value={emailVerificationCode}
                        onChange={(event) =>
                          setEmailVerificationCode(event.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleSendEmailCode}
                      disabled={isSendingEmail}
                      className="sm:mb-1"
                    >
                      {isSendingEmail ? "发送中..." : "发送验证码"}
                    </Button>
                  </div>

                  {emailStatusMessage && (
                    <p
                      className={`text-sm ${
                        emailStatusMessage.type === "success"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {emailStatusMessage.message}
                    </p>
                  )}

                  <Button
                    onClick={handleBindEmail}
                    disabled={!currentUser || isBindingEmail || !passwordReady}
                  >
                    {isBindingEmail ? "提交中..." : emailActionLabel}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary bg-muted/40">
                    <Phone className="size-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{phoneActionLabel}</h2>
                    <p className="text-sm text-muted-foreground">
                      用于短信验证码登录与安全验证。
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">手机号</Label>
                    <Input
                      id="phone"
                      placeholder="请输入手机号"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="grid gap-2">
                      <Label htmlFor="phoneCode">验证码</Label>
                      <Input
                        id="phoneCode"
                        placeholder="请输入验证码"
                        value={phoneVerificationCode}
                        onChange={(event) =>
                          setPhoneVerificationCode(event.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleSendPhoneCode}
                      disabled={isSendingPhone}
                      className="sm:mb-1"
                    >
                      {isSendingPhone ? "发送中..." : "发送验证码"}
                    </Button>
                  </div>

                  {phoneStatusMessage && (
                    <p
                      className={`text-sm ${
                        phoneStatusMessage.type === "success"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {phoneStatusMessage.message}
                    </p>
                  )}

                  <Button
                    onClick={handleBindPhone}
                    disabled={!currentUser || isBindingPhone || !passwordReady}
                  >
                    {isBindingPhone ? "提交中..." : phoneActionLabel}
                  </Button>
                </div>
              </div>
            </div>

            {isLoading && (
              <p className="text-sm text-muted-foreground">加载中...</p>
            )}
            {!isLoading && !currentUser && (
              <p className="text-sm text-muted-foreground">
                当前未登录，请先完成登录后再管理绑定信息。
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default BindingsPage;
