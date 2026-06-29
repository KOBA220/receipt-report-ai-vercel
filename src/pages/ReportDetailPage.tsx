import { useState } from "react";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptCamera } from "@/components/ReceiptCamera";
import { ReceiptList } from "@/components/ReceiptList";
import { formatCurrency } from "@/lib/utils";
import { analyzeReceiptImage } from "@/services/openai";
import { downloadReportCsv } from "@/services/csv";
import { useReportStore } from "@/store/reportStore";

type ReportDetailPageProps = {
  reportId: string;
  onBack: () => void;
};

export function ReportDetailPage({ reportId, onBack }: ReportDetailPageProps): JSX.Element {
  const report = useReportStore((state) => state.getReport(reportId));
  const addReceipt = useReportStore((state) => state.addReceipt);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!report) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="px-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          戻る
        </Button>
        <Alert message="レポートが見つかりません。" />
      </div>
    );
  }

  const total = report.receipts.reduce((sum, receipt) => sum + receipt.amount, 0);

  const handleAnalyze = async (imageDataUrl: string): Promise<void> => {
    setError("");
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeReceiptImage(imageDataUrl);
      addReceipt(report.id, {
        ...analysis,
        imageDataUrl,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "領収書の解析に失敗しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="px-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          戻る
        </Button>
        <Button variant="secondary" onClick={() => downloadReportCsv(report)} disabled={report.receipts.length === 0}>
          <Download className="h-4 w-4" aria-hidden="true" />
          CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold">{report.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{report.date}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">合計</p>
              <p className="text-2xl font-bold text-teal-700">{formatCurrency(total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>領収書登録</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert message={error} />
          {isAnalyzing ? (
            <div className="flex items-center rounded-md bg-teal-50 p-3 text-sm font-semibold text-teal-800">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              AIが領収書を解析しています
            </div>
          ) : null}
          <ReceiptCamera isAnalyzing={isAnalyzing} onAnalyze={(imageDataUrl) => void handleAnalyze(imageDataUrl)} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">登録済み領収書</h3>
          <span className="text-sm text-muted-foreground">{report.receipts.length}件</span>
        </div>
        <ReceiptList receipts={report.receipts} />
      </section>
    </div>
  );
}
