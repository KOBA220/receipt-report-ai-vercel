import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReportStore } from "@/store/reportStore";
import { todayIsoDate } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "タイトルを入力してください。").max(80, "タイトルは80文字以内で入力してください。"),
  date: z.string().min(1, "日付を入力してください。"),
});

type FormValues = z.infer<typeof schema>;

type ReportCreatePageProps = {
  onBack: () => void;
  onCreated: (reportId: string) => void;
};

export function ReportCreatePage({ onBack, onCreated }: ReportCreatePageProps): JSX.Element {
  const createReport = useReportStore((state) => state.createReport);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      date: todayIsoDate(),
    },
  });

  const onSubmit = (values: FormValues): void => {
    const reportId = createReport(values);
    onCreated(reportId);
  };

  return (
    <div className="space-y-5">
      <Button variant="ghost" onClick={onBack} className="px-2">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        戻る
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>レポート作成</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input id="title" placeholder="例: 6月 出張精算" {...register("title")} />
              {errors.title ? <p className="text-sm text-red-700">{errors.title.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">日付</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date ? <p className="text-sm text-red-700">{errors.date.message}</p> : null}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Save className="h-4 w-4" aria-hidden="true" />
              保存して領収書登録へ
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
