import { Loader2, PackageOpen, ServerCog, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Props = { isArabic: boolean };

export default function MedusaCommercePanel({ isArabic }: Props) {
  const status = trpc.commerce.status.useQuery(undefined, { retry: false });
  const catalog = trpc.commerce.catalog.useQuery(undefined, { retry: false });

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
      {!status.data?.configured ? <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-sm leading-7 text-white/60">{isArabic ? "لم يتم إعداد Medusa بعد. أضف عنوان خدمة Medusa ومفتاحها العام في إعدادات الخادم لعرض الكتالوج. لا تتأثر المدفوعات المحلية الحالية." : "Medusa is not configured yet. Add the Medusa service URL and publishable key to the server settings to display the catalog. Existing local payments remain available."}</div> : catalog.isError ? <div className="mt-6 rounded-xl border border-rose-300/20 bg-rose-300/10 p-5 text-sm text-rose-100">{isArabic ? "تعذر تحميل الكتالوج مؤقتاً." : "The catalog is temporarily unavailable."}</div> : <div className="mt-6 grid gap-3 md:grid-cols-2">{catalog.data?.products.map((product) => <article key={product.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="font-medium">{product.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-white/50">{product.description || (isArabic ? "خدمة تعليمية قابلة للشراء." : "Purchasable education service.")}</p><div className="mt-4 flex items-center justify-between text-xs text-white/45"><span>{product.variants.length} {isArabic ? "خيارات" : "variants"}</span><span className="rounded-full border border-white/10 px-2 py-1">{isArabic ? "من Medusa" : "From Medusa"}</span></div></article>)}</div>}
    </section>
  </div>;
}
