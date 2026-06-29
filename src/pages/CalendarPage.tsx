import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { useReportStore } from "@/store/reportStore";
import type { Receipt } from "@/types/receipt";

type CalendarPageProps = {
  onOpenReport: (reportId: string) => void;
};

type CalendarExpense = {
  receipt: Receipt;
  reportId: string;
  reportTitle: string;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function formatSelectedDate(value: string): string {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return value;
  return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`;
}

export function CalendarPage({ onOpenReport }: CalendarPageProps): JSX.Element {
  const reports = useReportStore((state) => state.reports);
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(today));

  const expensesByDate = useMemo(() => {
    const map = new Map<string, CalendarExpense[]>();
    for (const report of reports) {
      for (const receipt of report.receipts) {
        if (!isValidIsoDate(receipt.date)) continue;
        const expenses = map.get(receipt.date) ?? [];
        expenses.push({ receipt, reportId: report.id, reportTitle: report.title });
        map.set(receipt.date, expenses);
      }
    }
    return map;
  }, [reports]);

  const calendarDays = useMemo(() => {
    const gridStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1 - visibleMonth.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
      return {
        date,
        isoDate: toIsoDate(date),
        isCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
      };
    });
  }, [visibleMonth]);

  const monthPrefix = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthlyExpenses = [...expensesByDate.entries()]
    .filter(([date]) => date.startsWith(monthPrefix))
    .flatMap(([, expenses]) => expenses);
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.receipt.amount, 0);
  const selectedExpenses = expensesByDate.get(selectedDate) ?? [];
  const selectedTotal = selectedExpenses.reduce((sum, expense) => sum + expense.receipt.amount, 0);

  const moveMonth = (offset: number): void => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    setSelectedDate("");
  };

  const showToday = (): void => {
    const now = new Date();
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(toIsoDate(now));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">支出カレンダー</h2>
          <p className="mt-1 text-sm text-muted-foreground">領収書の日付ごとに支出を確認できます。</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-muted-foreground">月合計</p>
          <p className="text-xl font-bold text-teal-700">{formatCurrency(monthlyTotal)}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button variant="ghost" className="h-10 w-10 p-0" onClick={() => moveMonth(-1)} aria-label="前の月" title="前の月">
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <div className="text-center">
              <p className="text-lg font-bold">{visibleMonth.getFullYear()}年{visibleMonth.getMonth() + 1}月</p>
              <button type="button" onClick={showToday} className="text-xs font-semibold text-teal-700 hover:underline">
                今日に戻る
              </button>
            </div>
            <Button variant="ghost" className="h-10 w-10 p-0" onClick={() => moveMonth(1)} aria-label="次の月" title="次の月">
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
            {WEEKDAYS.map((weekday, index) => (
              <div key={weekday} className={cn("py-2", index === 0 && "text-red-600", index === 6 && "text-blue-600")}>
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isoDate, isCurrentMonth }) => {
              const expenses = expensesByDate.get(isoDate) ?? [];
              const hasExpenses = expenses.length > 0;
              const isSelected = isoDate === selectedDate;
              const isToday = isoDate === toIsoDate(today);
              return (
                <button
                  key={isoDate}
                  type="button"
                  disabled={!isCurrentMonth}
                  onClick={() => setSelectedDate(isoDate)}
                  className={cn(
                    "relative aspect-square min-w-0 rounded-md border text-sm font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    !isCurrentMonth && "border-transparent text-slate-300",
                    isCurrentMonth && "bg-white hover:bg-teal-50",
                    isToday && !isSelected && "border-teal-600 text-teal-800",
                    isSelected && "border-primary bg-primary text-primary-foreground hover:bg-teal-800",
                  )}
                  aria-label={`${isoDate}${hasExpenses ? `、支出${expenses.length}件` : ""}`}
                >
                  <span>{date.getDate()}</span>
                  {hasExpenses ? (
                    <span
                      className={cn(
                        "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-500",
                        isSelected && "bg-amber-200",
                      )}
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3" aria-live="polite">
        <div className="flex items-end justify-between gap-3 border-b pb-3">
          <div>
            <h3 className="text-lg font-bold">{selectedDate ? formatSelectedDate(selectedDate) : "日付を選択"}</h3>
            <p className="text-sm text-muted-foreground">{selectedExpenses.length}件の支出</p>
          </div>
          <p className="text-lg font-bold text-teal-700">{formatCurrency(selectedTotal)}</p>
        </div>

        {selectedExpenses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
            <CalendarDays className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">この日の支出はありません。</p>
          </div>
        ) : (
          <div className="divide-y rounded-lg border bg-white">
            {selectedExpenses.map(({ receipt, reportId, reportTitle }) => (
              <button
                key={receipt.id}
                type="button"
                onClick={() => onOpenReport(reportId)}
                className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 p-3 text-left transition hover:bg-slate-50"
              >
                <img src={receipt.imageDataUrl} alt="" className="h-11 w-11 rounded-md object-cover" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{receipt.storeName || "店舗名未取得"}</span>
                  <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <ReceiptText className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {reportTitle}
                  </span>
                </span>
                <span className="font-bold text-teal-700">{formatCurrency(receipt.amount)}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
