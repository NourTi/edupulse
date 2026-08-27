export type ReportInvoice = { amountMinor: number; discountMinor: number; status: string };
export type ReportPayment = { amountMinor: number; status: string };

export function calculateCommerceMetrics(invoices: ReportInvoice[], payments: ReportPayment[]) {
  const discountsMinor = invoices.reduce((sum, invoice) => sum + invoice.discountMinor, 0);
  const refundedInvoices = invoices.filter(invoice => invoice.status === "refunded");
  const refundedMinor = refundedInvoices.reduce((sum, invoice) => sum + Math.max(0, invoice.amountMinor - invoice.discountMinor), 0);
  const revenueMinor = payments.reduce((sum, payment) => sum + (payment.status === "paid" ? payment.amountMinor : 0), 0);
  const paidInvoiceCount = invoices.filter(invoice => invoice.status === "paid").length;
  return {
    revenueMinor,
    discountsMinor,
    refundedMinor,
    refundRate: invoices.length ? Number(((refundedInvoices.length / invoices.length) * 100).toFixed(1)) : 0,
    invoiceCount: invoices.length,
    paidInvoiceCount,
  };
}

export function subscriptionCycleDays(cycle: "monthly" | "quarterly" | "annual") {
  return cycle === "annual" ? 365 : cycle === "quarterly" ? 90 : 30;
}
