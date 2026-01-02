type UserPhoneLike = {
  phone_number?: string;
  phone?: string;
  phoneNumber?: string;
  username?: string;
};

const compactNumber = (value: string) => value.replace(/\s+/g, "");

const formatE164WithSpace = (value: string) => {
  const cleaned = compactNumber(value);
  if (!cleaned.startsWith("+")) {
    return cleaned;
  }
  const digits = cleaned.slice(1);
  for (let ccLen = 1; ccLen <= 3; ccLen += 1) {
    const cc = digits.slice(0, ccLen);
    const rest = digits.slice(ccLen);
    if (rest.length >= 4 && rest.length <= 20) {
      return `+${cc} ${rest}`;
    }
  }
  return cleaned;
};

export const normalizePhoneForApi = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const cleaned = compactNumber(trimmed);

  if (cleaned.startsWith("+86")) {
    const rest = cleaned.slice(3);
    return rest ? `+86 ${rest}` : "+86";
  }

  if (/^86\d{11}$/.test(cleaned)) {
    return `+86 ${cleaned.slice(2)}`;
  }

  if (/^\d{11}$/.test(cleaned)) {
    return `+86 ${cleaned}`;
  }

  if (cleaned.startsWith("+")) {
    return formatE164WithSpace(cleaned);
  }

  if (trimmed.includes(" ")) {
    return trimmed.replace(/\s+/g, " ").trim();
  }

  return cleaned;
};

export const formatPhoneForDisplay = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const cleaned = compactNumber(trimmed);

  if (cleaned.startsWith("+86")) {
    const rest = cleaned.slice(3);
    return rest || "";
  }

  if (/^86\d{11}$/.test(cleaned)) {
    return cleaned.slice(2);
  }

  if (/^\d{6,20}$/.test(cleaned)) {
    return cleaned;
  }

  if (cleaned.startsWith("+")) {
    return formatE164WithSpace(cleaned);
  }

  return trimmed.replace(/\s+/g, " ").trim();
};

export const getUserPhone = (user: UserPhoneLike | null | undefined) => {
  if (!user) return "";
  const candidate = user.phone_number || user.phone || user.phoneNumber || "";
  if (candidate) {
    return formatPhoneForDisplay(candidate);
  }

  const username = user.username || "";
  const normalized = compactNumber(username);
  if (/^\+?\d{6,20}$/.test(normalized)) {
    return formatPhoneForDisplay(username);
  }
  return "";
};
