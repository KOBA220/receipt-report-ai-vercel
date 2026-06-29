import { Camera, ImagePlus, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCameraCapture } from "@/hooks/useCameraCapture";

type ReceiptCameraProps = {
  isAnalyzing: boolean;
  onAnalyze: (imageDataUrl: string) => void;
};

export function ReceiptCamera({ isAnalyzing, onAnalyze }: ReceiptCameraProps): JSX.Element {
  const { imageDataUrl, error, isReading, clearImage, handleFileChange } = useCameraCapture();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-teal-800">
          <Camera className="h-4 w-4" aria-hidden="true" />
          カメラで撮影
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
          />
        </label>
        <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-muted px-4 text-foreground transition hover:bg-slate-200">
          <ImagePlus className="h-4 w-4" aria-label="画像を選択" />
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <Alert message={error} />

      {isReading ? (
        <div className="flex h-48 items-center justify-center rounded-lg border bg-white text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
          画像を読み込み中
        </div>
      ) : null}

      {imageDataUrl ? (
        <div className="space-y-3">
          <img
            src={imageDataUrl}
            alt="領収書プレビュー"
            className="max-h-[420px] w-full rounded-lg border bg-white object-contain"
          />
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={clearImage}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              撮り直す
            </Button>
            <Button onClick={() => onAnalyze(imageDataUrl)} disabled={isAnalyzing}>
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              AI解析
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
