import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Receipt, Report, ReportInput } from "@/types/receipt";
import { createId } from "@/lib/utils";

type ReportStore = {
  reports: Report[];
  createReport: (input: ReportInput) => string;
  addReceipts: (reportId: string, receipts: Array<Omit<Receipt, "id" | "createdAt">>) => void;
  deleteReceipt: (reportId: string, receiptId: string) => void;
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
      addReceipts: (reportId, receiptInputs) => {
        const now = new Date().toISOString();
        const receipts: Receipt[] = receiptInputs.map((receiptInput) => ({
          ...receiptInput,
          id: createId("receipt"),
          createdAt: now,
        }));
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  receipts: [...receipts, ...report.receipts],
                  updatedAt: now,
                }
              : report,
          ),
        }));
      },
      deleteReceipt: (reportId, receiptId) => {
        const now = new Date().toISOString();
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  receipts: report.receipts.filter((receipt) => receipt.id !== receiptId),
                  updatedAt: now,
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
