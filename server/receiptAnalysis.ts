export type ReceiptAnalysis = {
  storeName: string;
  amount: number;
  date: string;
};

type AnalyzeReceiptOptions = {
  imageDataUrl: string;
  apiKey: string | undefined;
  model?: string | undefined;
};

type OpenAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: { message?: string };
};

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";
const MAX_DATA_URL_LENGTH = 3_500_000;
const IMAGE_DATA_URL_PATTERN = /^data:image\/(?:jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/;

export class ReceiptAnalysisError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ReceiptAnalysisError";
    this.status = status;
  }
}

export function getImageDataUrl(body: unknown): string {
  if (!body || typeof body !== "object") {
    throw new ReceiptAnalysisError("画像データが必要です。", 400);
  }

  const imageDataUrl = (body as { imageDataUrl?: unknown }).imageDataUrl;
  if (typeof imageDataUrl !== "string" || !IMAGE_DATA_URL_PATTERN.test(imageDataUrl)) {
    throw new ReceiptAnalysisError("対応している領収書画像を選択してください。", 400);
  }
  if (imageDataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new ReceiptAnalysisError("画像サイズが大きすぎます。撮影し直してください。", 413);
  }

  return imageDataUrl;
}

function getOutputText(response: OpenAIResponse): string | undefined {
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return undefined;
}

function parseAnalysis(text: string): ReceiptAnalysis {
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid structured output");
  }

  const value = parsed as Partial<ReceiptAnalysis>;
  if (
    typeof value.storeName !== "string" ||
    typeof value.amount !== "number" ||
    !Number.isFinite(value.amount) ||
    value.amount < 0 ||
    typeof value.date !== "string"
  ) {
    throw new Error("Invalid receipt fields");
  }

  return value as ReceiptAnalysis;
}

export async function analyzeReceiptWithOpenAI({
  imageDataUrl,
  apiKey,
  model = DEFAULT_MODEL,
}: AnalyzeReceiptOptions): Promise<ReceiptAnalysis> {
  if (!apiKey) {
    throw new ReceiptAnalysisError("サーバーにOpenAI APIキーが設定されていません。", 503);
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "領収書から店舗名、支払合計金額、発行日を抽出してください。不明な文字列は空文字、金額不明は0、日付は判明する場合のみYYYY-MM-DD形式にしてください。",
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
              detail: "high",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "receipt_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              storeName: { type: "string", description: "領収書を発行した店舗名" },
              amount: { type: "number", minimum: 0, description: "通貨記号を除いた支払合計金額" },
              date: { type: "string", description: "YYYY-MM-DD形式の発行日。不明なら空文字" },
            },
            required: ["storeName", "amount", "date"],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as OpenAIResponse;
  if (!response.ok) {
    console.error("OpenAI API error", response.status, data.error?.message ?? "Unknown error");
    if (response.status === 429) {
      throw new ReceiptAnalysisError("AI解析が混み合っています。少し待ってから再試行してください。", 429);
    }
    throw new ReceiptAnalysisError("OpenAI APIによる解析に失敗しました。", 502);
  }

  const outputText = getOutputText(data);
  if (!outputText) {
    throw new ReceiptAnalysisError("AI解析結果が空でした。", 502);
  }

  try {
    return parseAnalysis(outputText);
  } catch (error) {
    console.error("Invalid OpenAI structured output", error);
    throw new ReceiptAnalysisError("AI解析結果の形式が不正です。", 502);
  }
}
