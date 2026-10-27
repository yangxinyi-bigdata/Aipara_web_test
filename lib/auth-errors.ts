// CloudBase Auth 抛出的错误形如 { error, error_code, error_description }。
// 这里把服务端风控类错误翻译成明确的提示，其余错误交给调用方的兜底文案。

export const getAuthErrorCode = (error: unknown): string => {
  if (typeof error !== "object" || error === null) return "";
  const code = (error as { error?: unknown }).error;
  return typeof code === "string" ? code : "";
};

const RISK_CONTROL_MESSAGES: Record<string, string> = {
  resource_exhausted: "操作太频繁，请稍后再试。",
  aborted: "尝试次数过多，请稍后再试。",
  invalid_status: "密码错误次数过多，账号已暂时锁定，请稍后再试或改用验证码登录。",
  captcha_required: "需要完成图形验证后才能继续，请重试。",
  captcha_invalid: "图形验证未通过，请重试。",
  user_blocked: "该账号已被停用。",
  unreachable: "网络连接异常，请检查网络后重试。",
};

export const describeAuthError = (
  error: unknown,
  fallback: string,
  overrides: Record<string, string> = {}
) => {
  const code = getAuthErrorCode(error);
  return overrides[code] ?? RISK_CONTROL_MESSAGES[code] ?? fallback;
};
