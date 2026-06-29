import {
  analyzeReceiptWithAnthropic,
  getImageDataUrl,
  ReceiptAnalysisError,
} from "../server/receiptAnalysis.js";

function errorResponse(error: unknown): Response {
  if (error instanceof ReceiptAnalysisError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Receipt analysis failed", error);
  return Response.json({ error: "領収書の解析中にエラーが発生しました。" }, { status: 500 });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json(
        { error: "POSTメソッドのみ利用できます。" },
        { status: 405, headers: { Allow: "POST" } },
      );
    }

    try {
      const body: unknown = await request.json();
      const imageDataUrl = getImageDataUrl(body);
      const analysis = await analyzeReceiptWithAnthropic({
        imageDataUrl,
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL,
      });
      return Response.json(analysis, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
