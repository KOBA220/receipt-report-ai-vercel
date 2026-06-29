import type { DetectedReceipt, ReceiptAnalysisResult } from "@/types/receipt";

type AnalyzeReceiptResponse = ReceiptAnalysisResult | { error: string };

function isDetectedReceipt(value: unknown): value is DetectedReceipt {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DetectedReceipt>;
  const box = candidate.boundingBox;
  return (
    typeof candidate.storeName === "string" &&
    typeof candidate.amount === "number" &&
    Number.isFinite(candidate.amount) &&
    typeof candidate.date === "string" &&
    Boolean(box) &&
    typeof box?.xMin === "number" &&
    typeof box.yMin === "number" &&
    typeof box.xMax === "number" &&
    typeof box.yMax === "number"
  );
}

function isAnalysisResult(value: unknown): value is ReceiptAnalysisResult {
  if (!value || typeof value !== "object") return false;
  const receipts = (value as Partial<ReceiptAnalysisResult>).receipts;
  return Array.isArray(receipts) && receipts.every(isDetectedReceipt);
}

export async function analyzeReceiptImage(imageDataUrl: string): Promise<ReceiptAnalysisResult> {
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

  if (!isAnalysisResult(data)) {
    throw new Error("AI解析結果の形式が不正です。");
  }

  return data;
}
