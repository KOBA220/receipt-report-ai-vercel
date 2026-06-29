import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import {
  analyzeReceiptWithOpenAI,
  getImageDataUrl,
  ReceiptAnalysisError,
} from "./server/receiptAnalysis";

const MAX_REQUEST_BYTES = 3_600_000;

function localReceiptApi(): Plugin {
  return {
    name: "local-receipt-api",
    configureServer(server) {
      server.middlewares.use("/api/analyze-receipt", (request, response) => {
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: "POSTメソッドのみ利用できます。" }));
          return;
        }

        let body = "";
        let isTooLarge = false;
        request.setEncoding("utf8");
        request.on("data", (chunk: string) => {
          if (isTooLarge) return;
          body += chunk;
          if (body.length > MAX_REQUEST_BYTES) {
            isTooLarge = true;
            body = "";
          }
        });
        request.on("end", () => {
          void (async () => {
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.setHeader("Cache-Control", "no-store");
            try {
              if (isTooLarge) {
                throw new ReceiptAnalysisError("画像サイズが大きすぎます。撮影し直してください。", 413);
              }
              const parsed: unknown = JSON.parse(body);
              const imageDataUrl = getImageDataUrl(parsed);
              const env = loadEnv(server.config.mode, process.cwd(), "");
              const result = await analyzeReceiptWithOpenAI({
                imageDataUrl,
                apiKey: env.OPENAI_API_KEY,
                model: env.OPENAI_MODEL,
              });
              response.statusCode = 200;
              response.end(JSON.stringify(result));
            } catch (error) {
              if (error instanceof ReceiptAnalysisError) {
                response.statusCode = error.status;
                response.end(JSON.stringify({ error: error.message }));
                return;
              }
              console.error("Local receipt analysis failed", error);
              response.statusCode = 500;
              response.end(JSON.stringify({ error: "領収書の解析中にエラーが発生しました。" }));
            }
          })();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localReceiptApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
