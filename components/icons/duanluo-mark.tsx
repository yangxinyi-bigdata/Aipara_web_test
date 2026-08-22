interface DuanluoMarkProps {
  className?: string;
}

/**
 * Duanluo 品牌标：段落符 ¶ × 输入光标。
 *
 * 弓与主杆构成段落符（"段落"），脱开一个杆宽的圆头竖杆是输入光标（"输入法"）。
 * 用 currentColor 填充，配色交给外层容器（导航栏用渐变底 + text-white）。
 * 矢量源文件与使用规范见管理端仓库 docs/design/logo/。
 */
export const DuanluoMark = ({ className }: DuanluoMarkProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="段落输入法"
    className={className}
  >
    {/* 100×100 的标准版几何等比缩放到 24×24 画布，标记高度占 58%。 */}
    <g transform="translate(3.714 3.714) scale(0.1657)">
      <circle cx="40" cy="33" r="25" />
      <rect x="40" y="8" width="25" height="50" />
      <rect x="55" y="8" width="10" height="84" />
      <rect x="75" y="8" width="10" height="84" rx="5" />
    </g>
  </svg>
);
