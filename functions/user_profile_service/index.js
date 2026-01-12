const cloudbase = require("@cloudbase/node-sdk");

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });

const PRICE_AMOUNT = 10;
const DEFAULT_CURRENCY = "CNY";

const META_STRING_LIMITS = {
  name: 120,
  email: 320,
  phone: 32,
  phone_e164: 32,
  picture: 2048,
  password_method: 16,
  email_bound_at: 64,
  phone_bound_at: 64,
  password_set_at: 64,
  password_skipped_at: 64,
};

const META_BOOLEAN_KEYS = new Set(["password_set", "password_skipped"]);
const META_ALLOWED_KEYS = new Set([
  "name",
  "email",
  "phone",
  "phone_e164",
  "picture",
  "password_set",
  "password_skipped",
  "password_set_at",
  "password_skipped_at",
  "password_method",
  "email_bound_at",
  "phone_bound_at",
]);

class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const normalizeEvent = (event) => {
  if (!event) return {};
  if (event.data && !event.action) return event.data;
  return event;
};

const ensureObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const toBoolean = (value) =>
  value === true || value === 1 || value === "1" || value === "true";

const parseNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatMysqlDateTime = (date) =>
  date.toISOString().slice(0, 19).replace("T", " ");

const addMonths = (value, months) => {
  const next = new Date(value);
  next.setMonth(next.getMonth() + months);
  return next;
};

const sanitizeString = (value, maxLen) => {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (typeof maxLen === "number") {
    return trimmed.slice(0, maxLen);
  }
  return trimmed;
};

const sanitizeMeta = (meta) => {
  const input = ensureObject(meta);
  const output = {};

  for (const key of Object.keys(input)) {
    if (!META_ALLOWED_KEYS.has(key)) continue;
    const value = input[key];

    if (META_BOOLEAN_KEYS.has(key)) {
      output[key] = toBoolean(value);
      continue;
    }

    if (key === "password_method") {
      const method = sanitizeString(value, META_STRING_LIMITS.password_method);
      if (method === "email" || method === "phone") {
        output[key] = method;
      }
      continue;
    }

    if (
      key === "password_set_at" ||
      key === "password_skipped_at" ||
      key === "email_bound_at" ||
      key === "phone_bound_at"
    ) {
      const dateValue = sanitizeString(value, META_STRING_LIMITS[key]);
      if (!dateValue) {
        output[key] = null;
        continue;
      }
      const parsed = new Date(dateValue);
      if (!Number.isNaN(parsed.getTime())) {
        output[key] = parsed.toISOString();
      }
      continue;
    }

    const limit = META_STRING_LIMITS[key];
    const nextValue = sanitizeString(value, limit);
    if (nextValue !== undefined) {
      output[key] = nextValue;
    }
  }

  return output;
};

const parseMeta = (meta) => {
  if (!meta) return {};
  if (typeof meta === "string") {
    try {
      return JSON.parse(meta);
    } catch (error) {
      return {};
    }
  }
  if (typeof meta === "object") return meta;
  return {};
};

const normalizeDateTime = (value) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return formatMysqlDateTime(value);
  if (typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return formatMysqlDateTime(date);
    }
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.includes("T")) {
      const date = new Date(trimmed);
      if (!Number.isNaN(date.getTime())) {
        return formatMysqlDateTime(date);
      }
    }
    return trimmed;
  }
  return null;
};

const sanitizeProfileUpdate = (payload) => {
  const input = ensureObject(payload);
  const output = {};

  if (typeof input.plan_tier === "string" && input.plan_tier.trim()) {
    output.plan_tier = input.plan_tier.trim();
  }
  if (typeof input.subscription_status === "string" && input.subscription_status.trim()) {
    output.subscription_status = input.subscription_status.trim();
  }

  const dateFields = [
    "subscription_start_at",
    "subscription_end_at",
    "points_reset_at",
    "updated_at",
    "last_login_at",
  ];
  for (const key of dateFields) {
    if (key in input) {
      const normalized = normalizeDateTime(input[key]);
      if (normalized !== null) {
        output[key] = normalized;
      }
    }
  }

  if (input.points_balance !== undefined) {
    const balance = parseNumber(input.points_balance);
    output.points_balance = Math.max(0, Math.floor(balance));
  }

  return output;
};

const getUid = () => {
  const info = app.auth().getUserInfo();
  if (!info?.uid) {
    throw new AppError(401, "未登录或登录态失效");
  }
  return info.uid;
};

const getProfile = async (db, uid) => {
  const { data, error } = await db
    .from("user_profile")
    .select(
      "meta,plan_tier,subscription_status,subscription_start_at,subscription_end_at,auto_renew,points_balance,balance_amount,points_reset_at,chat_count_total,pro_model_calls_total"
    )
    .eq("uid", uid)
    .eq("owner", uid)
    .limit(1);

  if (error) {
    throw new AppError(500, "读取用户信息失败");
  }

  return data?.[0] || null;
};

const getLatestSubscription = async (db, uid) => {
  const { data, error } = await db
    .from("user_subscription")
    .select("id,plan_tier,status,start_at,end_at")
    .eq("uid", uid)
    .order("start_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new AppError(500, "读取订阅记录失败");
  }

  return data?.[0] || null;
};

const getCatalog = async (db, tier) => {
  const { data, error } = await db
    .from("plan_catalog")
    .select("plan_tier,chat_limit,points_limit,pro_limit")
    .eq("plan_tier", tier)
    .eq("is_active", 1)
    .limit(1);

  if (error) {
    throw new AppError(500, "读取套餐配置失败");
  }

  return data?.[0] || null;
};

const handleProfileSync = async (db, uid, payload) => {
  const input = ensureObject(payload);
  const incomingMeta = sanitizeMeta(input.meta);

  const existingProfile = await getProfile(db, uid);
  const existingMeta = parseMeta(existingProfile?.meta);
  const mergedMeta = { ...existingMeta, ...incomingMeta };

  const displayName =
    sanitizeString(input.display_name, 120) ||
    sanitizeString(mergedMeta.name, 120) ||
    sanitizeString(mergedMeta.phone, 32) ||
    sanitizeString(mergedMeta.email, 320) ||
    `用户${uid.slice(0, 6)}`;

  const avatarUrl =
    sanitizeString(input.avatar_url, 2048) ||
    sanitizeString(mergedMeta.picture, 2048) ||
    "";
  const email = sanitizeString(input.email, 320) || mergedMeta.email || null;
  const phone = sanitizeString(input.phone, 32) || mergedMeta.phone || null;

  const payloadRow = {
    owner: uid,
    uid,
    role: "user",
    status: 1,
    display_name: displayName,
    avatar_url: avatarUrl,
    email,
    phone,
    last_login_at: formatMysqlDateTime(new Date()),
    meta: JSON.stringify(mergedMeta),
  };

  const { error } = await db.from("user_profile").upsert(payloadRow, {
    onConflict: "uid",
  });

  if (error) {
    throw new AppError(500, "同步用户资料失败");
  }

  return { meta: mergedMeta };
};

const handleProfileUpdateMeta = async (db, uid, payload) => {
  const input = ensureObject(payload);
  const incomingMeta = sanitizeMeta(input.meta);
  if (!Object.keys(incomingMeta).length) {
    throw new AppError(400, "没有可更新的字段");
  }

  const existingProfile = await getProfile(db, uid);
  const existingMeta = parseMeta(existingProfile?.meta);
  const mergedMeta = { ...existingMeta, ...incomingMeta };

  const { error } = await db.from("user_profile").upsert(
    {
      owner: uid,
      uid,
      meta: JSON.stringify(mergedMeta),
    },
    {
      onConflict: "uid",
    }
  );

  if (error) {
    throw new AppError(500, "更新用户信息失败");
  }

  return { meta: mergedMeta };
};

const handleProfileUpdate = async (db, uid, payload) => {
  const updates = sanitizeProfileUpdate(payload);
  if (!Object.keys(updates).length) {
    throw new AppError(400, "没有可更新的字段");
  }

  const { error } = await db
    .from("user_profile")
    .update(updates)
    .eq("uid", uid)
    .eq("owner", uid);

  if (error) {
    throw new AppError(500, "更新用户信息失败");
  }

  return {};
};

const handleSubscriptionUpgrade = async (db, uid, payload) => {
  const profile = await getProfile(db, uid);
  if (!profile) {
    throw new AppError(400, "用户信息不存在");
  }

  const planTier = String(profile.plan_tier || "").toLowerCase();
  if (planTier === "pro" && profile.subscription_status === "active") {
    throw new AppError(400, "当前已是 Pro 套餐");
  }

  const balanceAmount = parseNumber(profile.balance_amount);
  if (balanceAmount < PRICE_AMOUNT) {
    throw new AppError(400, "余额不足，无法升级");
  }

  const autoRenew = toBoolean(payload?.auto_renew);
  const now = new Date();
  const startAt = formatMysqlDateTime(now);
  const endAt = formatMysqlDateTime(addMonths(now, 1));
  const orderId = `UPG-${now.getTime()}`;

  const catalog = (await getCatalog(db, "pro")) || {};
  const pointsQuota = parseNumber(catalog.points_limit);
  const chatQuota = parseNumber(catalog.chat_limit);
  const proQuota = parseNumber(catalog.pro_limit);

  const { error: profileError } = await db
    .from("user_profile")
    .update({
      plan_tier: "pro",
      subscription_status: "active",
      subscription_start_at: startAt,
      subscription_end_at: endAt,
      auto_renew: autoRenew ? 1 : 0,
      points_balance: pointsQuota,
      balance_amount: Number((balanceAmount - PRICE_AMOUNT).toFixed(2)),
    })
    .eq("uid", uid)
    .eq("owner", uid);

  if (profileError) {
    throw new AppError(500, "更新订阅信息失败");
  }

  const { data: subscriptionData, error: subscriptionError } = await db
    .from("user_subscription")
    .insert({
      uid,
      plan_tier: "pro",
      status: "active",
      start_at: startAt,
      end_at: endAt,
      auto_renew: autoRenew ? 1 : 0,
      points_quota: pointsQuota,
      chat_quota: chatQuota,
      pro_quota: proQuota,
      price_amount: PRICE_AMOUNT,
      currency: DEFAULT_CURRENCY,
      order_id: orderId,
      _openid: uid,
    })
    .select("id");

  if (subscriptionError) {
    throw new AppError(500, "写入订阅记录失败");
  }

  const subscriptionId = subscriptionData?.[0]?.id ?? null;

  const { error: ledgerError } = await db.from("user_billing_ledger").insert({
    uid,
    txn_type: "subscription",
    amount: -PRICE_AMOUNT,
    currency: DEFAULT_CURRENCY,
    status: "success",
    order_id: orderId,
    provider: "manual",
    subscription_id: subscriptionId,
    remark: "升级 Pro 套餐",
    _openid: uid,
  });

  if (ledgerError) {
    throw new AppError(500, "写入账单记录失败");
  }

  return { order_id: orderId };
};

const handleSubscriptionCancel = async (db, uid) => {
  const profile = await getProfile(db, uid);
  if (!profile) {
    throw new AppError(400, "用户信息不存在");
  }

  const planTier = String(profile.plan_tier || "").toLowerCase();
  if (planTier !== "pro") {
    throw new AppError(400, "当前不是 Pro 套餐");
  }

  const now = new Date();
  const endAt = formatMysqlDateTime(now);
  const orderId = `CAN-${now.getTime()}`;
  const freeCatalog = await getCatalog(db, "free");
  const freePoints = parseNumber(freeCatalog?.points_limit);
  const nextPointsBalance = freePoints > 0 ? freePoints : 0;

  const { error: profileError } = await db
    .from("user_profile")
    .update({
      plan_tier: "free",
      subscription_status: "canceled",
      subscription_end_at: endAt,
      auto_renew: 0,
      points_balance: nextPointsBalance,
    })
    .eq("uid", uid)
    .eq("owner", uid);

  if (profileError) {
    throw new AppError(500, "更新订阅状态失败");
  }

  const { error: subscriptionError } = await db
    .from("user_subscription")
    .insert({
      uid,
      plan_tier: "free",
      status: "canceled",
      start_at: endAt,
      end_at: endAt,
      auto_renew: 0,
      points_quota: 0,
      chat_quota: 0,
      pro_quota: 0,
      price_amount: 0,
      currency: DEFAULT_CURRENCY,
      order_id: orderId,
      _openid: uid,
    });

  if (subscriptionError) {
    throw new AppError(500, "写入订阅记录失败");
  }

  return { order_id: orderId };
};

const handleSubscriptionRenew = async (db, uid) => {
  const profile = await getProfile(db, uid);
  if (!profile) {
    throw new AppError(400, "用户信息不存在");
  }

  const planTier = String(profile.plan_tier || "").toLowerCase();
  if (planTier !== "pro") {
    throw new AppError(400, "当前不是 Pro 套餐");
  }

  const balanceAmount = parseNumber(profile.balance_amount);
  if (balanceAmount < PRICE_AMOUNT) {
    throw new AppError(400, "余额不足，无法续费");
  }

  const latestSubscription = await getLatestSubscription(db, uid);
  const currentEnd =
    latestSubscription?.end_at || profile.subscription_end_at || null;
  const baseDate = currentEnd ? new Date(currentEnd) : new Date();
  const now = new Date();
  const startPoint =
    Number.isNaN(baseDate.getTime()) || baseDate < now ? now : baseDate;
  const nextEnd = addMonths(startPoint, 1);
  const endAt = formatMysqlDateTime(nextEnd);
  const orderId = `REN-${now.getTime()}`;

  const { error: profileError } = await db
    .from("user_profile")
    .update({
      subscription_end_at: endAt,
      balance_amount: Number((balanceAmount - PRICE_AMOUNT).toFixed(2)),
    })
    .eq("uid", uid)
    .eq("owner", uid);

  if (profileError) {
    throw new AppError(500, "更新订阅信息失败");
  }

  let subscriptionUpdate = db.from("user_subscription").update({ end_at: endAt });
  if (latestSubscription?.id) {
    subscriptionUpdate = subscriptionUpdate.eq("id", latestSubscription.id);
  } else {
    subscriptionUpdate = subscriptionUpdate
      .eq("uid", uid)
      .eq("plan_tier", "pro")
      .eq("status", "active");
  }

  const { error: subscriptionError } = await subscriptionUpdate;
  if (subscriptionError) {
    throw new AppError(500, "更新订阅记录失败");
  }

  const { error: ledgerError } = await db.from("user_billing_ledger").insert({
    uid,
    txn_type: "subscription",
    amount: -PRICE_AMOUNT,
    currency: DEFAULT_CURRENCY,
    status: "success",
    order_id: orderId,
    provider: "manual",
    subscription_id: latestSubscription?.id ?? null,
    remark: "续费 Pro 套餐",
    _openid: uid,
  });

  if (ledgerError) {
    throw new AppError(500, "写入账单记录失败");
  }

  return { order_id: orderId };
};

const handleWalletRecharge = async (db, uid) => {
  const profile = await getProfile(db, uid);
  if (!profile) {
    throw new AppError(400, "用户信息不存在");
  }

  const balanceAmount = parseNumber(profile.balance_amount);
  const nextBalance = Number((balanceAmount + PRICE_AMOUNT).toFixed(2));
  const orderId = `RC-${Date.now()}`;

  const { error: profileError } = await db
    .from("user_profile")
    .update({ balance_amount: nextBalance })
    .eq("uid", uid)
    .eq("owner", uid);

  if (profileError) {
    throw new AppError(500, "更新余额失败");
  }

  const { error: ledgerError } = await db.from("user_billing_ledger").insert({
    uid,
    txn_type: "recharge",
    amount: PRICE_AMOUNT,
    currency: DEFAULT_CURRENCY,
    status: "success",
    order_id: orderId,
    provider: "manual",
    remark: "开发阶段充值",
    _openid: uid,
  });

  if (ledgerError) {
    throw new AppError(500, "写入账单记录失败");
  }

  return { order_id: orderId, balance_amount: nextBalance };
};

exports.main = async (event) => {
  try {
    const input = normalizeEvent(event);
    const action = input?.action;
    const payload = input?.payload || {};
    if (!action) {
      throw new AppError(400, "缺少 action 参数");
    }

    const uid = getUid();
    const db = app.rdb();

    switch (action) {
      case "profile.sync":
        return { code: 0, data: await handleProfileSync(db, uid, payload) };
      case "profile.update":
        return { code: 0, data: await handleProfileUpdate(db, uid, payload) };
      case "profile.updateMeta":
        return { code: 0, data: await handleProfileUpdateMeta(db, uid, payload) };
      case "subscription.upgrade":
        return { code: 0, data: await handleSubscriptionUpgrade(db, uid, payload) };
      case "subscription.cancel":
        return { code: 0, data: await handleSubscriptionCancel(db, uid) };
      case "subscription.renew":
        return { code: 0, data: await handleSubscriptionRenew(db, uid) };
      case "wallet.recharge":
        return { code: 0, data: await handleWalletRecharge(db, uid) };
      default:
        throw new AppError(400, "未知的 action");
    }
  } catch (error) {
    const code = error?.code || 500;
    return {
      code,
      message: error?.message || "云函数执行失败",
    };
  }
};
