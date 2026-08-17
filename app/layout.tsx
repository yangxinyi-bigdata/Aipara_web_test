import type { Metadata } from "next";
import "./globals.css";
import { NavbarShell } from "@/components/layout/navbar-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";

export const metadata: Metadata = {
  title: "段落输入法 · Duanluo AI输入法",
  description:
    "段落输入法是基于AI时代的新需求构建的中文输入法，段落输入法的目标是消灭选词,一次性完成整段数输入。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavbarShell />

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
