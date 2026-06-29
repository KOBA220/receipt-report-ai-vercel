import { useState } from "react";
import { AppShell, type AppView } from "@/components/AppShell";
import { CalendarPage } from "@/pages/CalendarPage";
import { ReportCreatePage } from "@/pages/ReportCreatePage";
import { ReportDetailPage } from "@/pages/ReportDetailPage";
import { ReportListPage } from "@/pages/ReportListPage";

type Route =
  | { name: "list" }
  | { name: "create" }
  | { name: "calendar" }
  | {
      name: "detail";
      reportId: string;
    };

export default function App(): JSX.Element {
  const [route, setRoute] = useState<Route>({ name: "list" });
  const activeView: AppView = route.name === "calendar" ? "calendar" : "reports";

  const handleViewChange = (view: AppView): void => {
    setRoute(view === "calendar" ? { name: "calendar" } : { name: "list" });
  };

  return (
    <AppShell activeView={activeView} onViewChange={handleViewChange}>
      {route.name === "list" ? (
        <ReportListPage onCreate={() => setRoute({ name: "create" })} onOpen={(reportId) => setRoute({ name: "detail", reportId })} />
      ) : null}
      {route.name === "create" ? (
        <ReportCreatePage onBack={() => setRoute({ name: "list" })} onCreated={(reportId) => setRoute({ name: "detail", reportId })} />
      ) : null}
      {route.name === "detail" ? <ReportDetailPage reportId={route.reportId} onBack={() => setRoute({ name: "list" })} /> : null}
      {route.name === "calendar" ? <CalendarPage onOpenReport={(reportId) => setRoute({ name: "detail", reportId })} /> : null}
    </AppShell>
  );
}
