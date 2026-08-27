import { describe, expect, it } from "vitest";
import { calculateCommerceMetrics, subscriptionCycleDays } from "./reporting";

describe("commerce reporting", () => {
  it("calculates institution report metrics from paid allocations and invoice states", () => {
    expect(calculateCommerceMetrics([
      { amountMinor: 10000, discountMinor: 1000, status: "paid" },
      { amountMinor: 5000, discountMinor: 500, status: "refunded" },
    ], [
      { amountMinor: 9000, status: "paid" },
      { amountMinor: 4500, status: "paid" },
      { amountMinor: 100, status: "pending" },
    ])).toEqual({ revenueMinor: 13500, discountsMinor: 1500, refundedMinor: 4500, refundRate: 50, invoiceCount: 2, paidInvoiceCount: 1 });
  });

  it("keeps recurring billing simulation deterministic and bounded", () => {
    expect(subscriptionCycleDays("monthly")).toBe(30);
    expect(subscriptionCycleDays("quarterly")).toBe(90);
    expect(subscriptionCycleDays("annual")).toBe(365);
  });
});
