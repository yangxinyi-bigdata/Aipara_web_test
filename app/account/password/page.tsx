"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogIn, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCloudbaseClient, type CloudbaseClient } from "@/lib/cloudbase";
import {
  formatPhoneForDisplay,
  getUserPhone,
  normalizePhoneForApi,
} from "@/lib/phone";

type CurrentUser = Awaited<
  ReturnType<CloudbaseClient["auth"]["getCurrentUser"]>
>;

type VerifyMethod = "email" | "phone";

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

const PasswordPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [profileMeta, setProfileMeta] = React.useState<Record<string, unknown>>(
    {}
  );
  const [verifyMethod, setVerifyMethod] = React.useState<VerifyMethod>("email");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [verificationId, setVerificationId] = React.useState<string | null>(
    null
  );
  const [verificationCode, setVerificationCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSendingCode, setIsSendingCode] = React.useState(false);
  const [isSettingPassword, setIsSettingPassword] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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

    const metaPayload = JSON.stringify(mergedMeta);

    const { error } = await client.db
      .from("user_profile")
      .update({ meta: metaPayload })
      .eq("uid", currentUser.uid)
      .eq("owner", currentUser.uid);

    if (error) {
      const { error: upsertError } = await client.db
        .from("user_profile")
        .upsert(
          {
            owner: currentUser.uid,
            uid: currentUser.uid,
            meta: metaPayload,
          },
          { onConflict: "uid" }
        );

      if (upsertError) {
        console.error("Failed to update user_profile meta", upsertError);
        return;
      }
    }

    setProfileMeta(mergedMeta);
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
          setVerifyMethod("email");
        } else if (userPhone) {
          setPhone(formatPhoneForDisplay(userPhone));
          setVerifyMethod("phone");
        } else {
          setVerifyMethod("phone");
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
    setVerificationId(null);
    setVerificationCode("");
    setStatusMessage(null);
  }, [verifyMethod]);

  const handleLogin = async () => {
    try {
      router.push("/login?redirect=%2Faccount");
    } catch (error) {
      console.error("Login redirect failed", error);
    }
  };

  const handleSendVerification = async () => {
    const client = getCloudbaseClient();
    if (!client) return;

    setIsSendingCode(true);
    setStatusMessage(null);
    try {
      if (verifyMethod === "email") {
        if (!email) {
          throw new Error("Missing email");
        }
        const verification = await client.auth.getVerification({ email });
        setVerificationId(verification.verification_id);
      } else {
        const normalizedPhone = normalizePhoneForApi(phone);
        if (!normalizedPhone) {
          throw new Error("Missing phone");
        }
        const verification = await client.auth.getVerification({
          phone_number: normalizedPhone,
        });
        setVerificationId(verification.verification_id);
      }

      setStatusMessage({
        type: "success",
        message: "验证码已发送，请查收。",
      });
    } catch (error) {
      console.error("Failed to send verification code", error);
      setStatusMessage({
        type: "error",
        message: "验证码发送失败，请检查信息后重试。",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSetPassword = async () => {
    const client = getCloudbaseClient();
    if (!client) return;

    if (!verificationId) {
      setStatusMessage({
        type: "error",
        message: "请先获取验证码。",
      });
      return;
    }

    if (!verificationCode.trim()) {
      setStatusMessage({
        type: "error",
        message: "请输入验证码。",
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({
        type: "error",
        message: "密码长度至少 6 位。",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: "error",
        message: "两次输入的密码不一致。",
      });
      return;
    }

    setIsSettingPassword(true);
    setStatusMessage(null);
    try {
      const verificationTokenRes = await client.auth.verify({
        verification_id: verificationId,
        verification_code: verificationCode,
      });
      const sudoRes = await client.auth.sudo({
        verification_token: verificationTokenRes.verification_token,
      });

      if (!sudoRes.sudo_token) {
        throw new Error("Missing sudo_token");
      }

      await client.auth.setPassword({
        new_password: newPassword,
        sudo_token: sudoRes.sudo_token,
      });

      await updateProfileMeta({
        password_set: true,
        password_skipped: false,
        password_set_at: new Date().toISOString(),
        password_method: verifyMethod,
        email: email || currentUser?.email || null,
        phone: phone || getUserPhone(currentUser) || null,
      });

      setStatusMessage({
        type: "success",
        message: "密码设置成功，可使用账号密码登录。",
      });
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Failed to set password", error);
      setStatusMessage({
        type: "error",
        message: "密码设置失败，请检查验证码后重试。",
      });
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleSkipPassword = async () => {
    await updateProfileMeta({
      password_skipped: true,
      password_skipped_at: new Date().toISOString(),
    });
    setStatusMessage({
      type: "success",
      message: "已跳过设置密码，可稍后再设置。",
    });
    router.push("/account");
  };

  const passwordSet = profileMeta["password_set"] === true;
  const hasEmail = Boolean(email);
  const hasPhone = Boolean(phone);
  const isPhoneLocked = Boolean(currentUser?.phone || getUserPhone(currentUser));

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

          <section className="rounded-2xl border border-secondary/60 bg-card/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">设置登录密码</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  首次登录建议设置密码，方便后续使用账号密码登录。
                </p>
              </div>
              {!currentUser && (
                <Button onClick={handleLogin} variant="secondary">
                  <LogIn className="mr-2 size-4" />
                  去登录
                </Button>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-secondary/40 bg-muted/20 p-5">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">加载中...</p>
              ) : currentUser ? (
                <div className="grid gap-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-secondary/60 bg-background/60">
                      <ShieldCheck className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        请选择验证码方式，并设置新的登录密码。
                      </p>
                      {passwordSet && (
                        <p className="text-sm text-emerald-600 mt-2">
                          当前账号已设置密码，如需重置可继续操作。
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={verifyMethod === "email" ? "secondary" : "ghost"}
                      onClick={() => setVerifyMethod("email")}
                      disabled={!hasEmail}
                    >
                      <Mail className="mr-2 size-4" />
                      邮箱验证码
                    </Button>
                    <Button
                      variant={verifyMethod === "phone" ? "secondary" : "ghost"}
                      onClick={() => setVerifyMethod("phone")}
                    >
                      <Phone className="mr-2 size-4" />
                      手机验证码
                    </Button>
                  </div>

                  {verifyMethod === "email" ? (
                    <div className="grid gap-2">
                      <Label htmlFor="email">邮箱地址</Label>
                      <Input
                        id="email"
                        value={email}
                        placeholder="请输入邮箱"
                        disabled={Boolean(currentUser?.email)}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                      {!hasEmail && (
                        <p className="text-xs text-muted-foreground">
                          当前账号未绑定邮箱，请先填写可用邮箱。
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label htmlFor="phone">手机号</Label>
                      <Input
                        id="phone"
                        value={phone}
                        placeholder="请输入手机号"
                        disabled={isPhoneLocked}
                        onChange={(event) => setPhone(event.target.value)}
                      />
                      {!hasPhone && (
                        <p className="text-xs text-muted-foreground">
                          请输入可接收短信的手机号，例如 13800000000。
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="grid gap-2">
                      <Label htmlFor="verificationCode">验证码</Label>
                      <Input
                        id="verificationCode"
                        placeholder="请输入验证码"
                        value={verificationCode}
                        onChange={(event) =>
                          setVerificationCode(event.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleSendVerification}
                      disabled={isSendingCode}
                      className="sm:mb-1"
                    >
                      {isSendingCode ? "发送中..." : "发送验证码"}
                    </Button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="newPassword">新密码</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="至少 6 位"
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">确认密码</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="再次输入新密码"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                      />
                    </div>
                  </div>

                  {statusMessage && (
                    <p
                      className={`text-sm ${
                        statusMessage.type === "success"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {statusMessage.message}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={handleSetPassword}
                      disabled={isSettingPassword}
                    >
                      <KeyRound className="mr-2 size-4" />
                      {isSettingPassword ? "提交中..." : "确认设置密码"}
                    </Button>
                    {!passwordSet && (
                      <Button
                        variant="ghost"
                        onClick={handleSkipPassword}
                        disabled={isSettingPassword}
                      >
                        暂不设置
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      验证码有效期较短，请尽快完成设置。
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  当前未登录，请先完成登录后再设置密码。
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PasswordPage;
