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

type AnthropicResponse = {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
  stop_reason?: string | null;
  error?: {
    type?: string;
    message?: string;
  };
};

type ImageSource = {
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  data: string;
};

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-4-6";
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

function parseImageDataUrl(imageDataUrl: string): ImageSource {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/.exec(imageDataUrl);
  if (!match?.[1] || !match[2]) {
    throw new ReceiptAnalysisError("画像データの形式が不正です。", 400);
  }

  const mediaType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  return { mediaType: mediaType as ImageSource["mediaType"], data: match[2] };
}

function getOutputText(response: AnthropicResponse): string | undefined {
  return response.content?.find((content) => content.type === "text" && content.text)?.text;
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

function anthropicError(status: number): ReceiptAnalysisError {
  if (status === 401) return new ReceiptAnalysisError("Anthropic APIキーが無効です。Vercelの設定を確認してください。", 502);
  if (status === 403) return new ReceiptAnalysisError("Anthropic APIを利用する権限がありません。", 502);
  if (status === 429) return new ReceiptAnalysisError("AI解析が混み合っています。少し待ってから再試行してください。", 429);
  return new ReceiptAnalysisError("Anthropic APIによる解析に失敗しました。", 502);
}

export async function analyzeReceiptWithAnthropic({
  imageDataUrl,
  apiKey,
  model = DEFAULT_MODEL,
}: AnalyzeReceiptOptions): Promise<ReceiptAnalysis> {
  if (!apiKey) {
    throw new ReceiptAnalysisError("サーバーにAnthropic APIキーが設定されていません。", 503);
  }

  const image = parseImageDataUrl(imageDataUrl);
  const response = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: image.mediaType,
                data: image.data,
              },
            },
            {
              type: "text",
              text: "この領収書から店舗名、支払合計金額、発行日を抽出してください。不明な文字列は空文字、金額不明は0、日付は判明する場合のみYYYY-MM-DD形式にしてください。",
            },
          ],
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              storeName: { type: "string", description: "領収書を発行した店舗名" },
              amount: { type: "number", description: "0以上で、通貨記号を除いた支払合計金額" },
              date: { type: "string", description: "YYYY-MM-DD形式の発行日。不明なら空文字" },
            },
            required: ["storeName", "amount", "date"],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as AnthropicResponse;
  if (!response.ok) {
    console.error("Anthropic API error", response.status, data.error?.type ?? "unknown", data.error?.message ?? "Unknown error");
    throw anthropicError(response.status);
  }

  if (data.stop_reason === "refusal") {
    throw new ReceiptAnalysisError("この画像はAIで解析できませんでした。", 422);
  }
  if (data.stop_reason === "max_tokens") {
    throw new ReceiptAnalysisError("AI解析結果が途中で終了しました。もう一度お試しください。", 502);
  }

  const outputText = getOutputText(data);
  if (!outputText) {
    throw new ReceiptAnalysisError("AI解析結果が空でした。", 502);
  }

  try {
    return parseAnalysis(outputText);
  } catch (error) {
    console.error("Invalid Anthropic structured output", error);
    throw new ReceiptAnalysisError("AI解析結果の形式が不正です。", 502);
  }
}
