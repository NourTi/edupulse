import { describe, expect, it } from "vitest";
import { formatReceiptContent } from "./receiptFormatting";

describe("receiptFormatting", () => {
  it("formats branded Arabic receipt content without reversing RTL labels", () => {
    const receipt = formatReceiptContent({
      schoolName: "أكاديمية النور",
      receiptId: "p-123456",
      studentName: "أمل بن يحيى",
      guardianName: "نادية بن يحيى",
      amount: 18000,
      method: "Cash",
      paidAt: "2026-08-25",
      logoDataUrl: "data:image/png;base64,logo",
    });

    expect(receipt.schoolName).toBe("أكاديمية النور");
    expect(receipt.receiptNumber).toBe("123456");
    expect(receipt.rows).toEqual([
      ["اسم الطالب", "أمل بن يحيى"],
      ["ولي الأمر", "نادية بن يحيى"],
      ["طريقة الدفع", "نقداً"],
      ["الحالة", "مدفوع"],
    ]);
    expect(receipt.logoDataUrl).toContain("data:image/png");
  });
});
