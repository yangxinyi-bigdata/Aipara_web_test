import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type ToggleThemeProps = {
  compact?: boolean;
};

export const ToggleTheme = ({ compact = false }: ToggleThemeProps) => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size="sm"
      variant="ghost"
      className={cn(compact ? "h-9 w-9 p-0" : "w-full justify-start")}
    >
      <div className="flex gap-2 dark:hidden">
        <Moon className="size-5" />
        <span className={compact ? "sr-only" : "block lg:hidden"}>
          Escuro
        </span>
      </div>

      <div className="dark:flex gap-2 hidden">
        <Sun className="size-5" />
        <span className={compact ? "sr-only" : "block lg:hidden"}>Claro</span>
      </div>

      <span className="sr-only">Trocar de tema</span>
    </Button>
  );
};
