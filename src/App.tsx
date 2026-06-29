import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ReportCreatePage } from "@/pages/ReportCreatePage";
import { ReportDetailPage } from "@/pages/ReportDetailPage";
import { ReportListPage } from "@/pages/ReportListPage";

type Route =
  | { name: "list" }
  | { name: "create" }
  | {
      name: "detail";
      reportId: string;
    };

export default function App(): JSX.Element {
  const [route, setRoute] = useState<Route>({ name: "list" });

  return (
    <AppShell>
      {route.name === "list" ? (
        <ReportListPage onCreate={() => setRoute({ name: "create" })} onOpen={(reportId) => setRoute({ name: "detail", reportId })} />
      ) : null}
      {route.name === "create" ? (
        <ReportCreatePage onBack={() => setRoute({ name: "list" })} onCreated={(reportId) => setRoute({ name: "detail", reportId })} />
      ) : null}
      {route.name === "detail" ? <ReportDetailPage reportId={route.reportId} onBack={() => setRoute({ name: "list" })} /> : null}
    </AppShell>
  );
}
