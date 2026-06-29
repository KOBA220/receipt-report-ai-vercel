import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertProps = {
  message: string;
  className?: string;
};

export function Alert({ message, className }: AlertProps): JSX.Element | null {
  if (!message) return null;
  return (
    <div className={cn("flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700", className)}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
