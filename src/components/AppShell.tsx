import type { ReactNode } from "react";
import { CalendarDays, Files, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppView = "reports" | "calendar";

type AppShellProps = {
  children: ReactNode;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
};

export function AppShell({ children, activeView, onViewChange }: AppShellProps): JSX.Element {
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ReceiptText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-teal-700">Receipt AI</p>
              <h1 className="text-lg font-bold leading-none">領収書レポート</h1>
            </div>
          </div>
          <div className="grid grid-cols-2" role="tablist" aria-label="メイン画面">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "reports"}
              onClick={() => onViewChange("reports")}
              className={cn(
                "flex h-11 items-center justify-center gap-2 border-b-2 text-sm font-semibold transition",
                activeView === "reports" ? "border-primary text-teal-800" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Files className="h-4 w-4" aria-hidden="true" />
              レポート
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "calendar"}
              onClick={() => onViewChange("calendar")}
              className={cn(
                "flex h-11 items-center justify-center gap-2 border-b-2 text-sm font-semibold transition",
                activeView === "calendar" ? "border-primary text-teal-800" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              カレンダー
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5 safe-bottom">{children}</main>
    </div>
  );
}
