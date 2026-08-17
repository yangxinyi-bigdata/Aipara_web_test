type UserWithPicture = {
  picture?: unknown;
};

type UserWithUid = {
  uid?: unknown;
};

const hasPicture = (user: unknown): user is UserWithPicture => {
  return typeof user === "object" && user !== null && "picture" in user;
};

const hasUid = (user: unknown): user is UserWithUid => {
  return typeof user === "object" && user !== null && "uid" in user;
};

export const getUserPicture = (user: unknown) => {
  if (!hasPicture(user)) return "";
  return typeof user.picture === "string" ? user.picture : "";
};

export const getUserUid = (user: unknown) => {
  if (!hasUid(user)) return "";
  return typeof user.uid === "string" ? user.uid : "";
};
