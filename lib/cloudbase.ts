import cloudbase from "@cloudbase/js-sdk";

type CloudbaseApp = ReturnType<typeof cloudbase.init>;
type CloudbaseAuth = ReturnType<CloudbaseApp["auth"]>;

type VerificationInfo = {
  verification_id: string;
  is_user: boolean;
};

type VerificationLoginResult = {
  error?: {
    error_description?: string;
  };
};

type CloudbaseAuthWithVerificationLogin = CloudbaseAuth & {
  signInWithEmail(params: {
    verificationInfo: VerificationInfo;
    verificationCode: string;
    email: string;
  }): Promise<VerificationLoginResult>;
  signInWithSms(params: {
    verificationInfo: VerificationInfo;
    verificationCode: string;
    phoneNum: string;
  }): Promise<VerificationLoginResult>;
};

export type AuthStateChangeEvent = {
  data?: {
    eventType?: string;
  };
};

export type CloudbaseClient = {
  app: CloudbaseApp;
  auth: CloudbaseAuthWithVerificationLogin;
  db: ReturnType<CloudbaseApp["rdb"]>;
};

let client: CloudbaseClient | null = null;

export const getCloudbaseClient = () => {
  if (typeof window === "undefined") return null;
  if (!client) {
    const app = cloudbase.init({
      env: "aipara-2gj6wwwsabef0ce0",
    });

    client = {
      app,
      auth: app.auth() as unknown as CloudbaseAuthWithVerificationLogin,
      db: app.rdb(),
    };
  }

  return client;
};
