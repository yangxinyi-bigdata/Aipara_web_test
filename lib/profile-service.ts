import type { CloudbaseClient } from "@/lib/cloudbase";
import { getCloudbaseClient } from "@/lib/cloudbase";

type ProfileServiceAction =
  | "profile.sync"
  | "profile.updateMeta"
  | "subscription.upgrade"
  | "subscription.cancel"
  | "subscription.renew"
  | "wallet.recharge";

type ProfileServiceResponse<T> = {
  code: number;
  message?: string;
  data?: T;
};

export const callProfileService = async <T = unknown>(
  action: ProfileServiceAction,
  payload: Record<string, unknown> = {},
  clientOverride?: CloudbaseClient | null
): Promise<T | null> => {
  const client = clientOverride || getCloudbaseClient();
  if (!client) {
    throw new Error("CloudBase client is not available");
  }

  const response = await client.app.callFunction({
    name: "user_profile_service",
    data: { action, payload },
  });
  const result = response?.result as ProfileServiceResponse<T> | undefined;

  if (!result) {
    throw new Error("Empty cloud function response");
  }
  if (result.code !== 0) {
    throw new Error(result.message || "云函数调用失败");
  }

  return result.data ?? null;
};
