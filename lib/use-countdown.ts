import React from "react";

// 发送验证码后的冷却倒计时。仅用于防止误触重复发送，不能替代服务端限频。
export const SEND_CODE_COOLDOWN_SECONDS = 60;

export const useCountdown = () => {
  const [secondsLeft, setSecondsLeft] = React.useState(0);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const start = React.useCallback(
    (seconds: number = SEND_CODE_COOLDOWN_SECONDS) => setSecondsLeft(seconds),
    []
  );

  return { secondsLeft, isCoolingDown: secondsLeft > 0, start };
};
