import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Receipt, Report, ReportInput } from "@/types/receipt";
import { createId } from "@/lib/utils";

type ReportStore = {
  reports: Report[];
  createReport: (input: ReportInput) => string;
  addReceipt: (reportId: string, receipt: Omit<Receipt, "id" | "createdAt">) => void;
  deleteReport: (reportId: string) => void;
  getReport: (reportId: string) => Report | undefined;
};

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [],
      createReport: (input) => {
        const now = new Date().toISOString();
        const id = createId("report");
        const report: Report = {
          id,
          title: input.title,
          date: input.date,
          receipts: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ reports: [report, ...state.reports] }));
        return id;
      },
      addReceipt: (reportId, receiptInput) => {
        const receipt: Receipt = {
          ...receiptInput,
          id: createId("receipt"),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  receipts: [receipt, ...report.receipts],
                  updatedAt: new Date().toISOString(),
                }
              : report,
          ),
        }));
      },
      deleteReport: (reportId) => {
        set((state) => ({ reports: state.reports.filter((report) => report.id !== reportId) }));
      },
      getReport: (reportId) => get().reports.find((report) => report.id === reportId),
    }),
    {
      name: "receipt-ai-reports",
      version: 1,
    },
  ),
);
