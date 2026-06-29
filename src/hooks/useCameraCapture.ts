import { useCallback, useState } from "react";

const MAX_SOURCE_SIZE = 12 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const MAX_DATA_URL_LENGTH = 3_500_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("画像の読み込みに失敗しました。"));
    };
    image.src = objectUrl;
  });
}

async function compressImage(file: File): Promise<string> {
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("画像を処理できませんでした。");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    dataUrl = canvas.toDataURL("image/jpeg", 0.62);
  }
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new Error("画像サイズが大きすぎます。解像度を下げて撮影してください。");
  }
  return dataUrl;
}

type CameraCaptureState = {
  imageDataUrl: string;
  error: string;
  isReading: boolean;
  clearImage: () => void;
  handleFileChange: (file: File | null) => Promise<void>;
};

export function useCameraCapture(): CameraCaptureState {
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [error, setError] = useState("");
  const [isReading, setIsReading] = useState(false);

  const handleFileChange = useCallback(async (file: File | null) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください。");
      return;
    }
    if (file.size > MAX_SOURCE_SIZE) {
      setError("12MB以下の画像を選択してください。");
      return;
    }

    setIsReading(true);
    try {
      const dataUrl = await compressImage(file);
      setImageDataUrl(dataUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "画像の読み込みに失敗しました。");
    } finally {
      setIsReading(false);
    }
  }, []);

  return {
    imageDataUrl,
    error,
    isReading,
    clearImage: () => setImageDataUrl(""),
    handleFileChange,
  };
}
