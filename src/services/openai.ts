import type { ReceiptAnalysis } from "@/types/receipt";

type AnalyzeReceiptResponse = ReceiptAnalysis | { error: string };

function isReceiptAnalysis(value: unknown): value is ReceiptAnalysis {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ReceiptAnalysis>;
  return (
    typeof candidate.storeName === "string" &&
    typeof candidate.amount === "number" &&
    Number.isFinite(candidate.amount) &&
    typeof candidate.date === "string"
  );
}

export async function analyzeReceiptImage(imageDataUrl: string): Promise<ReceiptAnalysis> {
  const response = await fetch("/api/analyze-receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl }),
  });

  const data = (await response.json().catch(() => ({
    error: "サーバーから不正な応答が返されました。",
  }))) as AnalyzeReceiptResponse;

  if (!response.ok) {
    throw new Error("error" in data ? data.error : "領収書の解析に失敗しました。");
  }

  if (!isReceiptAnalysis(data)) {
    throw new Error("AI解析結果の形式が不正です。");
  }

  return data;
}
