export type ReceiptInput = {
  schoolName: string;
  receiptId: string;
  studentName: string;
  guardianName: string;
  amount: number;
  method: string;
  paidAt: string;
  logoDataUrl?: string;
};

export type ReceiptContent = ReceiptInput & {
  receiptNumber: string;
  amountLabel: string;
  rows: Array<[string, string]>;
};

const methodLabels: Record<string, string> = {
  Cash: "نقداً",
  "Bank transfer": "تحويل بنكي",
  Cheque: "شيك",
};

export function formatReceiptContent(input: ReceiptInput): ReceiptContent {
  return {
    ...input,
    schoolName: input.schoolName.trim() || "EduPulse",
    receiptNumber: input.receiptId.slice(-6).toUpperCase(),
    amountLabel: `${input.amount.toLocaleString("ar-DZ")} د.ج`,
    rows: [
      ["اسم الطالب", input.studentName || "—"],
      ["ولي الأمر", input.guardianName || "—"],
      ["طريقة الدفع", methodLabels[input.method] ?? input.method],
      ["الحالة", "مدفوع"],
    ],
  };
}

export function escapeReceiptHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}
