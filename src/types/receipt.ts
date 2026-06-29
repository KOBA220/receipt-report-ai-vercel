export type ReceiptAnalysis = {
  storeName: string;
  amount: number;
  date: string;
};

export type Receipt = ReceiptAnalysis & {
  id: string;
  imageDataUrl: string;
  createdAt: string;
};

export type Report = {
  id: string;
  title: string;
  date: string;
  receipts: Receipt[];
  createdAt: string;
  updatedAt: string;
};

export type ReportInput = {
  title: string;
  date: string;
};
