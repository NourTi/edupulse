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

export function commerceReportCsv(report: { invoices: Array<{ id: string; learnerId: string; invoiceNumber: string; amountMinor: number; discountMinor: number; currency: string; status: string; createdAt: Date | string | null }>; payments: Array<{ id: string; learnerId: string; amountMinor: number; currency: string; method: string; status: string; paidAt: Date | string }> }) {
  const cell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = [["type", "id", "learner_id", "invoice_number", "amount_minor", "discount_minor", "currency", "status", "method", "date"], ...report.invoices.map(item => ["invoice", item.id, item.learnerId, item.invoiceNumber, item.amountMinor, item.discountMinor, item.currency, item.status, "", new Date(item.createdAt ?? Date.now()).toISOString()]), ...report.payments.map(item => ["payment", item.id, item.learnerId, "", item.amountMinor, "", item.currency, item.status, item.method, new Date(item.paidAt).toISOString()])];
  return rows.map(row => row.map(cell).join(",")).join("\n");
}

export function subscriptionCycleDays(cycle: "monthly" | "quarterly" | "annual") {
  return cycle === "annual" ? 365 : cycle === "quarterly" ? 90 : 30;
}
