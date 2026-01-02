import cloudbase from "@cloudbase/js-sdk";

type CloudbaseApp = ReturnType<typeof cloudbase.init>;

export type CloudbaseClient = {
  app: CloudbaseApp;
  auth: ReturnType<CloudbaseApp["auth"]>;
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
      auth: app.auth(),
      db: app.rdb(),
    };
  }

  return client;
};
