import type { Receipt } from "@/types/receipt";
import { formatCurrency } from "@/lib/utils";

type ReceiptListProps = {
  receipts: Receipt[];
};

export function ReceiptList({ receipts }: ReceiptListProps): JSX.Element {
  if (receipts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-6 text-center text-sm text-muted-foreground">
        領収書はまだ登録されていません。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {receipts.map((receipt) => (
        <div key={receipt.id} className="grid grid-cols-[64px_1fr] gap-3 rounded-lg border bg-white p-3">
          <img src={receipt.imageDataUrl} alt="" className="h-16 w-16 rounded-md object-cover" />
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-semibold">{receipt.storeName || "店舗名未取得"}</p>
              <p className="shrink-0 font-bold text-teal-700">{formatCurrency(receipt.amount)}</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{receipt.date || "日付未取得"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
