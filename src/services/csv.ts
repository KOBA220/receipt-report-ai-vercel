import type { Report } from "@/types/receipt";

function escapeCsv(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadReportCsv(report: Report): void {
  const rows = [
    ["レポートタイトル", "レポート日付", "店舗名", "金額", "領収書日付"],
    ...report.receipts.map((receipt) => [
      report.title,
      report.date,
      receipt.storeName,
      receipt.amount,
      receipt.date,
    ]),
  ];

  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.title || "report"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
