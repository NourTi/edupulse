import { useState } from "react";
import { Loader2, PackageOpen, Plus, ServerCog, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Props = { isArabic: boolean };

export default function MedusaCommercePanel({ isArabic }: Props) {
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [amount, setAmount] = useState("");
  const status = trpc.commerce.status.useQuery(undefined, { retry: false });
  const catalog = trpc.commerce.catalog.useQuery(undefined, { retry: false });
  const localProducts = trpc.commerce.products.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const createProduct = trpc.commerce.createProduct.useMutation({ onSuccess: () => { setTitle(""); setTitleAr(""); setAmount(""); toast.success(isArabic ? "تم حفظ الخدمة." : "Service saved."); void utils.commerce.products.invalidate(); }, onError: (error) => toast.error(error.message) });

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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><p className="text-display text-3xl">{isArabic ? "خدمات ورسوم المؤسسة" : "Institution services and fees"}</p><p className="mt-2 max-w-2xl text-sm leading-7 text-white/55">{isArabic ? "اعرض باقات التسجيل، الدروس، والخدمات المدفوعة من Medusa. تبقى أهلية الطالب وسياق المؤسسة داخل EduPulse." : "View registration packages, lessons, and paid services from Medusa. Learner eligibility and institution context remain inside EduPulse."}</p></div>
        {status.isLoading && <Loader2 className="h-5 w-5 animate-spin text-white/50" />}
      </div>
      {!status.data?.configured ?       <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-sm leading-7 text-white/60">{isArabic ? "لم يتم إعداد Medusa بعد. أضف عنوان خدمة Medusa ومفتاحها العام في إعدادات الخادم لعرض الكتالوج. لا تتأثر المدفوعات المحلية الحالية." : "Medusa is not configured yet. Add the Medusa service URL and publishable key to the server settings to display the catalog. Existing local payments remain available."}</div> : catalog.isError ? <div className="mt-6 rounded-xl border border-rose-300/20 bg-rose-300/10 p-5 text-sm text-rose-100">{isArabic ? "تعذر تحميل الكتالوج مؤقتاً." : "The catalog is temporarily unavailable."}</div> : <div className="mt-6 grid gap-3 md:grid-cols-2">{catalog.data?.products.map((product) => <article key={product.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="font-medium">{product.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-white/50">{product.description || (isArabic ? "خدمة تعليمية قابلة للشراء." : "Purchasable education service.")}</p><div className="mt-4 flex items-center justify-between text-xs text-white/45"><span>{product.variants.length} {isArabic ? "خيارات" : "variants"}</span><span className="rounded-full border border-white/10 px-2 py-1">{isArabic ? "من Medusa" : "From Medusa"}</span></div></article>)}</div>}
    </section>
    <section className="surface-panel rounded-2xl p-6">
      <div className="flex items-center justify-between"><div><p className="text-display text-3xl">{isArabic ? "كتالوج EduPulse المحلي" : "EduPulse local catalog"}</p><p className="mt-2 text-sm text-white/55">{isArabic ? "أنشئ رسوم التسجيل أو باقات الدروس داخل قاعدة المؤسسة، حتى دون Medusa خارجي." : "Create registration fees or lesson packages inside the institution database, even without external Medusa."}</p></div><Plus className="h-5 w-5 text-white/45" /></div>
      <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_0.6fr_auto]" onSubmit={(event) => { event.preventDefault(); createProduct.mutate({ title, titleAr, amountMinor: Math.round(Number(amount) * 100), kind: "fee" }); }}>
        <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder={isArabic ? "اسم الخدمة بالإنجليزية" : "Service name"} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none focus:border-white/35" />
        <input required value={titleAr} onChange={(event) => setTitleAr(event.target.value)} placeholder={isArabic ? "اسم الخدمة بالعربية" : "Arabic service name"} dir="rtl" className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none focus:border-white/35" />
        <input required min="0" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={isArabic ? "دج" : "DZD"} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none focus:border-white/35" />
        <button disabled={createProduct.isPending} className="rounded-xl bg-white px-4 py-3 text-sm text-[#00364A] disabled:opacity-50">{createProduct.isPending ? "…" : (isArabic ? "إضافة" : "Add")}</button>
      </form>
      <div className="mt-6 grid gap-3 md:grid-cols-2">{localProducts.data?.map((product) => <article key={product.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{isArabic ? product.titleAr : product.title}</p><p className="mt-1 text-xs text-white/50">{product.kind} · {product.status}</p></div><strong>{(product.amountMinor / 100).toFixed(2)} {product.currency}</strong></div></article>)}</div>
    </section>
  </div>;
}
