import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useReportStore } from "@/store/reportStore";
import { formatCurrency } from "@/lib/utils";

type ReportListPageProps = {
  onCreate: () => void;
  onOpen: (reportId: string) => void;
};

export function ReportListPage({ onCreate, onOpen }: ReportListPageProps): JSX.Element {
  const reports = useReportStore((state) => state.reports);
  const deleteReport = useReportStore((state) => state.deleteReport);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">レポート一覧</h2>
          <p className="mt-1 text-sm text-muted-foreground">領収書をまとめて管理します。</p>
        </div>
        <Button onClick={onCreate} className="shrink-0">
          <Plus className="h-4 w-4" aria-hidden="true" />
          作成
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <ReceiptText className="h-10 w-10 text-teal-700" aria-hidden="true" />
            <div>
              <p className="font-semibold">最初のレポートを作成</p>
              <p className="mt-1 text-sm text-muted-foreground">撮影した領収書から金額を自動集計できます。</p>
            </div>
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              レポート作成
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const total = report.receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
            return (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <button className="w-full text-left" type="button" onClick={() => onOpen(report.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold">{report.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{report.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-teal-700">{formatCurrency(total)}</p>
                        <p className="text-xs text-muted-foreground">{report.receipts.length}件</p>
                      </div>
                    </div>
                  </button>
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" className="h-9 px-3 text-red-700" onClick={() => deleteReport(report.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      削除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
