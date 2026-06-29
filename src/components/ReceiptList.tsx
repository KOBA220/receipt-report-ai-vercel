import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Receipt } from "@/types/receipt";

type ReceiptListProps = {
  receipts: Receipt[];
  onDelete?: (receiptId: string) => void;
};

export function ReceiptList({ receipts, onDelete }: ReceiptListProps): JSX.Element {
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
        <div key={receipt.id} className="grid grid-cols-[64px_minmax(0,1fr)_36px] gap-3 rounded-lg border bg-white p-3">
          <img src={receipt.imageDataUrl} alt="" className="h-16 w-16 rounded-md object-cover" />
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-semibold">{receipt.storeName || "店舗名未取得"}</p>
              <p className="shrink-0 font-bold text-teal-700">{formatCurrency(receipt.amount)}</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{receipt.date || "日付未取得"}</p>
          </div>
          {onDelete ? (
            <Button
              variant="ghost"
              className="h-9 w-9 self-center p-0 text-red-700"
              onClick={() => onDelete(receipt.id)}
              aria-label={`${receipt.storeName || "領収書"}を削除`}
              title="領収書を削除"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}
