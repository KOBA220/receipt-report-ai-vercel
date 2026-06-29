import type { ReceiptBoundingBox } from "@/types/receipt";

const BOX_SCALE = 1000;
const PADDING_RATIO = 0.02;

function loadDataUrlImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("領収書画像の切り出しに失敗しました。"));
    image.src = dataUrl;
  });
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export async function cropReceiptImage(imageDataUrl: string, box: ReceiptBoundingBox): Promise<string> {
  const image = await loadDataUrlImage(imageDataUrl);
  const xMin = clamp(box.xMin / BOX_SCALE, 0, 1);
  const yMin = clamp(box.yMin / BOX_SCALE, 0, 1);
  const xMax = clamp(box.xMax / BOX_SCALE, 0, 1);
  const yMax = clamp(box.yMax / BOX_SCALE, 0, 1);

  if (xMax - xMin < 0.05 || yMax - yMin < 0.05) return imageDataUrl;

  const paddingX = image.naturalWidth * PADDING_RATIO;
  const paddingY = image.naturalHeight * PADDING_RATIO;
  const sourceX = clamp(image.naturalWidth * xMin - paddingX, 0, image.naturalWidth);
  const sourceY = clamp(image.naturalHeight * yMin - paddingY, 0, image.naturalHeight);
  const sourceRight = clamp(image.naturalWidth * xMax + paddingX, 0, image.naturalWidth);
  const sourceBottom = clamp(image.naturalHeight * yMax + paddingY, 0, image.naturalHeight);
  const sourceWidth = Math.max(1, sourceRight - sourceX);
  const sourceHeight = Math.max(1, sourceBottom - sourceY);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sourceWidth);
  canvas.height = Math.round(sourceHeight);
  const context = canvas.getContext("2d");
  if (!context) return imageDataUrl;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}
