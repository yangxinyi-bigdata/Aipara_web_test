import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NavbarShell } from "@/components/layout/navbar-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  fallback: ["Noto Sans SC", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Shadcn - Landing template",
  description: "Landing template from Shadcn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background", sora.className)}>
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
