import type { ReactNode } from "react";
import { ReceiptText } from "lucide-react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps): JSX.Element {
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ReceiptText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700">Receipt AI</p>
            <h1 className="text-lg font-bold leading-none">領収書レポート</h1>
          </div>
        </div>
      </header>
      <main className="mx-auto min-h-[calc(100dvh-65px)] max-w-3xl px-4 py-5 safe-bottom">{children}</main>
    </div>
  );
}
