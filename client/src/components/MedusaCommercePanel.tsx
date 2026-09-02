import { useState } from "react";
import jsPDF from "jspdf";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileText, Loader2, PackageOpen, Play, Plus, ServerCog, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ReportData = { invoices: Array<{ id: string; learnerId: string; invoiceNumber: string; amountMinor: number; discountMinor: number; currency: string; status: string; createdAt: Date | string | null }>; payments: Array<{ id: string; learnerId: string; amountMinor: number; currency: string; method: string; status: string; paidAt: Date | string }>; metrics: { revenueMinor: number; discountsMinor: number; refundedMinor: number; refundRate: number; invoiceCount: number; paidInvoiceCount: number } };

function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") { const blob = new Blob([content], { type: mime }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function exportCommerceCsv(report: ReportData) { const rows = [["type", "id", "learner_id", "invoice_number", "amount_minor", "discount_minor", "currency", "status", "method", "date"], ...report.invoices.map(item => ["invoice", item.id, item.learnerId, item.invoiceNumber, item.amountMinor, item.discountMinor, item.currency, item.status, "", new Date(item.createdAt ?? Date.now()).toISOString()]), ...report.payments.map(item => ["payment", item.id, item.learnerId, "", item.amountMinor, "", item.currency, item.status, item.method, new Date(item.paidAt).toISOString()])]; downloadText(`edupulse-commerce-${new Date().toISOString().slice(0, 10)}.csv`, rows.map(row => row.map(csvCell).join(",")).join("\n"), "text/csv;charset=utf-8"); }
function exportCommercePdf(report: ReportData, isArabic: boolean) { const pdf = new jsPDF(); pdf.setFontSize(16); pdf.text("EduPulse Commerce Report", 14, 18); pdf.setFontSize(10); pdf.text(`Generated: ${new Date().toLocaleString("en-GB")}`, 14, 26); pdf.text(`Revenue: ${(report.metrics.revenueMinor / 100).toFixed(2)} DZD`, 14, 36); pdf.text(`Discounts: ${(report.metrics.discountsMinor / 100).toFixed(2)} DZD`, 14, 44); pdf.text(`Refund rate: ${report.metrics.refundRate}%`, 14, 52); pdf.text(isArabic ? "تقرير إداري لسجلات المؤسسة" : "Institution-scoped administrative report", 14, 60); let y = 72; pdf.setFontSize(9); report.invoices.slice(0, 20).forEach((invoice) => { if (y > 280) { pdf.addPage(); y = 18; } pdf.text(`INVOICE ${invoice.invoiceNumber} | ${invoice.learnerId} | ${(Math.max(0, invoice.amountMinor - invoice.discountMinor) / 100).toFixed(2)} ${invoice.currency} | ${invoice.status}`, 14, y); y += 7; }); report.payments.slice(0, 20).forEach((payment) => { if (y > 280) { pdf.addPage(); y = 18; } pdf.text(`PAYMENT ${payment.id} | ${payment.learnerId} | ${(payment.amountMinor / 100).toFixed(2)} ${payment.currency} | ${payment.method} | ${payment.status}`, 14, y); y += 7; }); pdf.save(`edupulse-commerce-${new Date().toISOString().slice(0, 10)}.pdf`); }

type Props = { isArabic: boolean };

export default function MedusaCommercePanel({ isArabic }: Props) {
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [amount, setAmount] = useState("");
  const [learnerId, setLearnerId] = useState("");
  const [productId, setProductId] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [kind, setKind] = useState<"fee" | "course" | "service" | "subscription">("fee");
  const [cycle, setCycle] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [simulation, setSimulation] = useState<{ simulationId: string; amountMinor: number; currency: string; nextAttemptAt: Date | string; charged: boolean } | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [productKind, setProductKind] = useState<"" | "fee" | "course" | "service" | "subscription">("");
  const [reportRecipient, setReportRecipient] = useState("");
  const status = trpc.commerce.status.useQuery(undefined, { retry: false });
  const catalog = trpc.commerce.catalog.useQuery(undefined, { retry: false });
  const localProducts = trpc.commerce.products.useQuery(undefined, { retry: false });
  const learners = trpc.records.learners.useQuery(undefined, { retry: false });
  const invoices = trpc.commerce.invoices.useQuery(undefined, { retry: false });
  const report = trpc.commerce.report.useQuery({ from: fromDate ? new Date(`${fromDate}T00:00:00`) : undefined, to: toDate ? new Date(`${toDate}T23:59:59`) : undefined, productKind: productKind || undefined }, { retry: false });
  const utils = trpc.useUtils();
  const createProduct = trpc.commerce.createProduct.useMutation({ onSuccess: () => { setTitle(""); setTitleAr(""); setAmount(""); setKind("fee"); toast.success(isArabic ? "تم حفظ الخدمة." : "Service saved."); void utils.commerce.products.invalidate(); }, onError: (error) => toast.error(error.message) });
  const createInvoice = trpc.commerce.createInvoice.useMutation({ onSuccess: () => { setLearnerId(""); setProductId(""); setInvoiceAmount(""); setDiscount(""); toast.success(isArabic ? "تم إصدار الفاتورة." : "Invoice issued."); void utils.commerce.invoices.invalidate(); void utils.commerce.report.invalidate(); }, onError: (error) => toast.error(error.message) });
  const recordPayment = trpc.commerce.recordInvoicePayment.useMutation({ onSuccess: () => { toast.success(isArabic ? "تم تسجيل الدفعة." : "Payment recorded."); void utils.commerce.invoices.invalidate(); void utils.commerce.report.invalidate(); }, onError: (error) => toast.error(error.message) });
  const changeInvoiceStatus = trpc.commerce.updateInvoiceStatus.useMutation({ onSuccess: () => { toast.success(isArabic ? "تم تحديث حالة الفاتورة." : "Invoice status updated."); void utils.commerce.invoices.invalidate(); void utils.commerce.report.invalidate(); }, onError: (error) => toast.error(error.message) });
  const emailReport = trpc.commerce.emailReport.useMutation({ onSuccess: (result) => toast.success(isArabic ? `تم إرسال التقرير إلى ${result.recipient}` : `Report sent to ${result.recipient}`), onError: (error) => toast.error(error.message) });
  const simulateBilling = trpc.commerce.simulateSubscriptionBilling.useMutation({ onSuccess: (result) => { setSimulation(result); toast.success(isArabic ? "تمت المحاكاة دون تحصيل أموال." : "Simulation complete; no money was charged."); }, onError: (error) => toast.error(error.message) });

  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      <article className="surface-panel rounded-2xl p-5">
        <ServerCog className="h-5 w-5 text-cyan-200" />
        <p className="text-display mt-6 text-2xl">{isArabic ? "طبقة التجارة" : "Commerce layer"}</p>
        <p className="mt-2 text-sm leading-6 text-white/55">{status.data?.configured ? (isArabic ? "Medusa متصل" : "Medusa connected") : (isArabic ? "جاهز للربط" : "Ready to connect")}</p>
      </article>
      <article className="surface-panel rounded-2xl p-5">
        <ShieldCheck className="h-5 w-5 text-emerald-200" />
        <p className="text-display mt-6 text-2xl">{isArabic ? "حدود آمنة" : "Safe boundary"}</p>
        <p className="mt-2 text-sm leading-6 text-white/55">{isArabic ? "EduPulse يحتفظ بسجلات الطالب والصلاحيات." : "EduPulse keeps learner records and permissions."}</p>
      </article>
      <article className="surface-panel rounded-2xl p-5">
        <PackageOpen className="h-5 w-5 text-amber-200" />
        <p className="text-display mt-6 text-2xl">{isArabic ? "الكتالوج" : "Catalog"}</p>
        <p className="mt-2 text-sm leading-6 text-white/55">{catalog.isLoading ? "…" : `${catalog.data?.products.length ?? 0} ${isArabic ? "خدمة" : "services"}`}</p>
      </article>
    </div>
    <section className="surface-panel rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-display text-3xl">{isArabic ? "تقارير التجارة" : "Commerce reporting"}</p><p className="mt-2 text-sm text-white/55">{isArabic ? "بيانات المؤسسة الحالية فقط، قابلة للتنزيل بصيغة CSV أو PDF." : "Current institution data only, downloadable as CSV or PDF."}</p></div><div className="flex flex-wrap items-center gap-2"><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="control-light min-h-10 rounded-full px-3 py-2 text-xs" aria-label={isArabic ? "من تاريخ" : "From date"} /><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="control-light min-h-10 rounded-full px-3 py-2 text-xs" aria-label={isArabic ? "إلى تاريخ" : "To date"} /><select value={productKind} onChange={(event) => setProductKind(event.target.value as typeof productKind)} className="control-light min-h-10 rounded-full px-3 py-2 text-xs" aria-label={isArabic ? "نوع المنتج" : "Product type"}><option value="">{isArabic ? "كل الأنواع" : "All types"}</option><option value="fee">{isArabic ? "رسوم" : "Fees"}</option><option value="course">{isArabic ? "دورات" : "Courses"}</option><option value="service">{isArabic ? "خدمات" : "Services"}</option><option value="subscription">{isArabic ? "اشتراكات" : "Subscriptions"}</option></select><button type="button" onClick={() => report.data && exportCommerceCsv(report.data as ReportData)} disabled={!report.data} className="toggle-light inline-flex items-center gap-2 px-4 py-2 text-xs disabled:opacity-40"><Download className="h-3.5 w-3.5" />CSV</button><input type="email" value={reportRecipient} onChange={(event) => setReportRecipient(event.target.value)} placeholder={isArabic ? "البريد الإلكتروني" : "Email address"} className="w-44 control-light min-h-10 rounded-full px-3 py-2 text-xs" aria-label={isArabic ? "البريد الإلكتروني لإرسال التقرير" : "Report recipient email"} /><button type="button" onClick={() => report.data && exportCommercePdf(report.data as ReportData, isArabic)} disabled={!report.data} className="toggle-light inline-flex items-center gap-2 px-4 py-2 text-xs disabled:opacity-40"><FileText className="h-3.5 w-3.5" />PDF</button><button type="button" onClick={() => reportRecipient && emailReport.mutate({ recipient: reportRecipient, from: fromDate ? new Date(`${fromDate}T00:00:00`) : undefined, to: toDate ? new Date(`${toDate}T23:59:59`) : undefined, productKind: productKind || undefined })} disabled={!report.data || !reportRecipient || emailReport.isPending} className="toggle-light inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold disabled:opacity-40">{emailReport.isPending ? "…" : (isArabic ? "إرسال" : "Email report")}</button></div></div>
      {report.data && <><div className="mt-5 grid gap-3 md:grid-cols-4"><article className="rounded-xl bg-cyan-300/10 p-4"><p className="text-xs text-white/50">{isArabic ? "الإيراد" : "Revenue"}</p><strong className="mt-2 block text-xl">{(report.data.metrics.revenueMinor / 100).toLocaleString("ar-DZ")} دج</strong></article><article className="rounded-xl bg-amber-300/10 p-4"><p className="text-xs text-white/50">{isArabic ? "الخصومات" : "Discounts"}</p><strong className="mt-2 block text-xl">{(report.data.metrics.discountsMinor / 100).toLocaleString("ar-DZ")} دج</strong></article><article className="rounded-xl bg-rose-300/10 p-4"><p className="text-xs text-white/50">{isArabic ? "المبالغ المستردة" : "Refunded"}</p><strong className="mt-2 block text-xl">{(report.data.metrics.refundedMinor / 100).toLocaleString("ar-DZ")} دج</strong></article><article className="rounded-xl bg-violet-300/10 p-4"><p className="text-xs text-white/50">{isArabic ? "معدل الاسترداد" : "Refund rate"}</p><strong className="mt-2 block text-xl">{report.data.metrics.refundRate}%</strong></article></div><div className="mt-6 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: isArabic ? "الإيراد" : "Revenue", value: report.data.metrics.revenueMinor / 100 }, { name: isArabic ? "الخصومات" : "Discounts", value: report.data.metrics.discountsMinor / 100 }, { name: isArabic ? "المسترد" : "Refunded", value: report.data.metrics.refundedMinor / 100 }]}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" /><XAxis dataKey="name" stroke="rgba(255,255,255,.55)" /><YAxis stroke="rgba(255,255,255,.55)" /><Tooltip contentStyle={{ background: "#07394a", border: "1px solid rgba(255,255,255,.15)", borderRadius: 12 }} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{["#67e8f9", "#fcd34d", "#fda4af"].map(color => <Cell key={color} fill={color} />)}</Bar></BarChart></ResponsiveContainer></div></>}
      {!report.data && <p className="mt-6 text-sm text-white/50">{isArabic ? "لا توجد بيانات تقرير متاحة بعد." : "No report data is available yet."}</p>}
    </section>
    <section className="surface-panel rounded-2xl p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><p className="text-display text-3xl">{isArabic ? "خدمات ورسوم المؤسسة" : "Institution services and fees"}</p><p className="mt-2 max-w-2xl text-sm leading-7 text-white/55">{isArabic ? "اعرض باقات التسجيل، الدروس، والخدمات المدفوعة من Medusa. تبقى أهلية الطالب وسياق المؤسسة داخل EduPulse." : "View registration packages, lessons, and paid services from Medusa. Learner eligibility and institution context remain inside EduPulse."}</p></div>
        {status.isLoading && <Loader2 className="h-5 w-5 animate-spin text-white/50" />}
      </div>
      {!status.data?.configured ?       <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-sm leading-7 text-white/60">{isArabic ? "لم يتم إعداد Medusa بعد. أضف عنوان خدمة Medusa ومفتاحها العامة في إعدادات الخادم لعرض الكتالوج. لا تتأثر المدفوعات المحلية الحالية." : "Medusa is not configured yet. Add the Medusa service URL and publishable key to the server settings to display the catalog. Existing local payments remain available."}</div> : catalog.isError ? <div className="mt-6 rounded-xl border border-rose-300/20 bg-rose-300/10 p-5 text-sm text-rose-100">{isArabic ? "تعذر تحميل الكتالوج مؤقتاً." : "The catalog is temporarily unavailable."}</div> : <div className="mt-6 grid gap-3 md:grid-cols-2">{catalog.data?.products.map((product) => <article key={product.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="font-medium">{product.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-white/50">{product.description || (isArabic ? "خدمة تعليمية قابلة للشراء." : "Purchasable education service.")}</p><div className="mt-4 flex items-center justify-between text-xs text-white/45"><span>{product.variants.length} {isArabic ? "خيارات" : "variants"}</span><span className="rounded-full border border-white/10 px-2 py-1">{isArabic ? "من Medusa" : "From Medusa"}</span></div></article>)}</div>}
    </section>
    <section className="surface-panel rounded-2xl p-6">
      <div className="flex items-center justify-between"><div><p className="text-display text-3xl">{isArabic ? "كتالوج EduPulse المحلي" : "EduPulse local catalog"}</p><p className="mt-2 text-sm text-white/55">{isArabic ? "أنشئ رسوم التسجيل أو باقات الدروس داخل قاعدة المؤسسة، حتى دون Medusa خارجي." : "Create registration fees or lesson packages inside the institution database, even without external Medusa."}</p></div><Plus className="h-5 w-5 text-white/45" /></div>
      <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_0.6fr_auto]" onSubmit={(event) => { event.preventDefault(); createProduct.mutate({ title, titleAr, amountMinor: Math.round(Number(amount) * 100), kind }); }}>
        <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder={isArabic ? "اسم الخدمة بالإنجليزية" : "Service name"} className="control-light px-4 py-3 text-sm focus:border-white/35" />
        <input required value={titleAr} onChange={(event) => setTitleAr(event.target.value)} placeholder={isArabic ? "اسم الخدمة بالعربية" : "Arabic service name"} dir="rtl" className="control-light px-4 py-3 text-sm focus:border-white/35" />
        <input required min="0" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={isArabic ? "دج" : "DZD"} className="control-light px-4 py-3 text-sm focus:border-white/35" />
        <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="control-light px-4 py-3 text-sm"><option value="fee">{isArabic ? "رسوم" : "Fee"}</option><option value="course">{isArabic ? "دورة" : "Course"}</option><option value="service">{isArabic ? "خدمة" : "Service"}</option><option value="subscription">{isArabic ? "اشتراك" : "Subscription"}</option></select>
        <button disabled={createProduct.isPending} className="rounded-xl bg-white px-4 py-3 text-sm text-[#00364A] disabled:opacity-50">{createProduct.isPending ? "…" : (isArabic ? "إضافة" : "Add")}</button>
      </form>
      <div className="mt-6 grid gap-3 md:grid-cols-2">{localProducts.data?.map((product) => <article key={product.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{isArabic ? product.titleAr : product.title}</p><p className="mt-1 text-xs text-white/50">{product.kind} · {product.status}</p></div><strong>{(product.amountMinor / 100).toFixed(2)} {product.currency}</strong></div></article>)}</div>
    </section>
    <section className="surface-panel rounded-2xl p-6">
      <p className="text-display text-3xl">{isArabic ? "إصدار فاتورة" : "Issue an invoice"}</p>
      <p className="mt-2 text-sm leading-7 text-white/55">{isArabic ? "اربط الخدمة بطالب محدد، ثم سجّل الدفعة من سجل المدفوعات المحلي." : "Attach a service to a specific learner, then record payment through the local payment ledger."}</p>
      <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_0.7fr_auto]" onSubmit={(event) => { event.preventDefault(); if (!learnerId || !productId) return toast.error(isArabic ? "اختر الطالب والخدمة." : "Choose a learner and service."); const product = localProducts.data?.find(item => item.id === productId); const discountMinor = Math.round(Number(discount || 0) * 100); if (product && discountMinor > product.amountMinor) return toast.error(isArabic ? "الخصم أكبر من قيمة الخدمة." : "Discount exceeds service amount."); createInvoice.mutate({ learnerId, productId, discountMinor }); setInvoiceAmount(product ? String(product.amountMinor / 100) : invoiceAmount); }}>
        
        {/* FIX: Changed from select to input with datalist to allow free typing */}
        <input 
          list="learners-list" 
          required 
          value={learnerId} 
          onChange={(event) => setLearnerId(event.target.value)} 
          placeholder={isArabic ? "اسم أو رقم الطالب" : "Learner name/ID"} 
          className="control-light px-4 py-3 text-sm" 
        />
        <datalist id="learners-list">
          {learners.data?.map((item) => <option key={item.id} value={item.id}>{item.nameAr} · {item.grade}</option>)}
        </datalist>

        <select required value={productId} onChange={(event) => setProductId(event.target.value)} className="control-light px-4 py-3 text-sm"><option value="">{isArabic ? "اختر الخدمة" : "Choose service"}</option>{localProducts.data?.map((item) => <option key={item.id} value={item.id}>{isArabic ? item.titleAr : item.title} · {(item.amountMinor / 100).toFixed(2)} {item.currency}</option>)}</select>
        <input min="0" step="0.01" type="number" value={discount} onChange={(event) => setDiscount(event.target.value)} placeholder={isArabic ? "خصم دج" : "Discount DZD"} className="control-light px-4 py-3 text-sm" />
        <button disabled={createInvoice.isPending} className="rounded-xl bg-white px-4 py-3 text-sm text-[#00364A] disabled:opacity-50">{createInvoice.isPending ? "…" : (isArabic ? "إصدار" : "Issue")}</button>
      </form>
      <div className="mt-6 space-y-3">{invoices.data?.map((invoice) => { const outstanding = Math.max(0, invoice.amountMinor - invoice.discountMinor); const canPay = ["issued", "partially_paid"].includes(invoice.status) && outstanding > 0; return <article key={invoice.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{invoice.invoiceNumber}</p><p className="mt-1 text-xs text-white/50">{invoice.learnerId} · {(outstanding / 100).toFixed(2)} {invoice.currency}</p></div><div className="flex items-center gap-2"><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{invoice.status}</span>{invoice.status === "paid" && <button disabled={changeInvoiceStatus.isPending} onClick={() => changeInvoiceStatus.mutate({ invoiceId: invoice.id, status: "refunded" })} className="rounded-full border border-rose-200/20 px-3 py-1.5 text-xs text-rose-100 disabled:opacity-50">{isArabic ? "استرداد" : "Refund"}</button>}{canPay && <button disabled={recordPayment.isPending} onClick={() => recordPayment.mutate({ invoiceId: invoice.id, learnerId: invoice.learnerId, amountMinor: outstanding, method: "Cash" })} className="rounded-full bg-emerald-300 px-3 py-1.5 text-xs text-[#00364A] disabled:opacity-50">{isArabic ? "تسجيل الدفع" : "Record payment"}</button>}</div></div></article>; })}</div>
    </section>
    <section className="surface-panel rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-display text-3xl">{isArabic ? "محاكاة الفوترة المتكررة" : "Recurring billing simulator"}</p><p className="mt-2 max-w-2xl text-sm leading-7 text-white/55">{isArabic ? "اختبر دورة الاشتراك يدوياً. هذه العملية تجريبية فقط ولا تنشئ دفعة أو تحصيلًا حقيقياً." : "Manually test a subscription cycle. This is test-only and never creates a payment or real charge."}</p></div><Play className="h-5 w-5 text-amber-200" /></div>
      <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_0.7fr_auto]" onSubmit={(event) => { event.preventDefault(); if (!learnerId || !productId) return toast.error(isArabic ? "اختر الطالب والاشتراك." : "Choose a learner and subscription."); simulateBilling.mutate({ learnerId, productId, cycle }); }}>
        
        {/* FIX: Changed from select to input with datalist to allow free typing */}
        <input 
          list="learners-list" 
          required 
          value={learnerId} 
          onChange={(event) => setLearnerId(event.target.value)} 
          placeholder={isArabic ? "اسم أو رقم الطالب" : "Learner name/ID"} 
          className="control-light px-4 py-3 text-sm" 
        />
        <datalist id="learners-list">
          {learners.data?.map((item) => <option key={item.id} value={item.id}>{item.nameAr} · {item.grade}</option>)}
        </datalist>

        <select required value={productId} onChange={(event) => setProductId(event.target.value)} className="control-light px-4 py-3 text-sm"><option value="">{isArabic ? "اختر الاشتراك" : "Choose subscription"}</option>{localProducts.data?.filter(item => item.kind === "subscription").map((item) => <option key={item.id} value={item.id}>{isArabic ? item.titleAr : item.title} · {(item.amountMinor / 100).toFixed(2)} {item.currency}</option>)}</select>
        <select value={cycle} onChange={(event) => setCycle(event.target.value as typeof cycle)} className="control-light px-4 py-3 text-sm"><option value="monthly">{isArabic ? "شهري" : "Monthly"}</option><option value="quarterly">{isArabic ? "ربع سنوي" : "Quarterly"}</option><option value="annual">{isArabic ? "سنوي" : "Annual"}</option></select>
        <button disabled={simulateBilling.isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 py-3 text-sm text-[#00364A] disabled:opacity-50">{simulateBilling.isPending ? "…" : <><Play className="h-3.5 w-3.5" />{isArabic ? "تشغيل" : "Simulate"}</>}</button>
      </form>
      {simulation && <div className="mt-5 rounded-xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm leading-7 text-amber-50">{isArabic ? "نجحت المحاكاة دون تحصيل أموال." : "Simulation completed with no charge."} <span className="text-white/60">{simulation.simulationId} · {(simulation.amountMinor / 100).toFixed(2)} {simulation.currency} · {new Date(simulation.nextAttemptAt).toLocaleDateString()}</span></div>}
    </section>
  </div>;
}
