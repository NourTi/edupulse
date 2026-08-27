import { trpc } from "@/lib/trpc";
import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export type SchoolBrand = { name: string; logoDataUrl?: string };

const BRAND_KEY = "edupulse-school-brand";
const defaultBrand: SchoolBrand = { name: "EduPulse" };

export function readSchoolBrand(): SchoolBrand {
  if (typeof window === "undefined") return defaultBrand;
  try {
    const saved = window.localStorage.getItem(BRAND_KEY);
    return saved ? { ...defaultBrand, ...(JSON.parse(saved) as Partial<SchoolBrand>) } : defaultBrand;
  } catch {
    return defaultBrand;
  }
}

function persistBrand(brand: SchoolBrand) {
  window.localStorage.setItem(BRAND_KEY, JSON.stringify(brand));
}

function compressLogo(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("logo-read-failed"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("logo-decode-failed"));
      image.onload = () => {
        const scale = Math.min(1, 480 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("logo-canvas-failed"));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png", 0.86));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function SchoolBrandPanel() {
  const { isAuthenticated } = useAuth();
  const serverBrand = trpc.school.brand.useQuery(undefined, { retry: false });
  const saveBrand = trpc.school.saveBrand.useMutation();
  const [brand, setBrand] = useState<SchoolBrand>(readSchoolBrand);

  useEffect(() => {
    if (!serverBrand.data) return;
    const next = { name: serverBrand.data.name, logoDataUrl: serverBrand.data.logoUrl ?? undefined };
    setBrand(next);
    persistBrand(next);
  }, [serverBrand.data]);

  const updateName = (name: string) => {
    const next = { ...brand, name };
    setBrand(next);
    persistBrand(next);
  };

  const updateLogo = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("اختر ملف صورة صالحاً للشعار.");
    try {
      const logoDataUrl = await compressLogo(file);
      const next = { ...brand, logoDataUrl };
      setBrand(next);
      persistBrand(next);
      if (isAuthenticated) {
        await saveBrand.mutateAsync({ name: next.name.trim() || "EduPulse", logoDataUrl });
        await serverBrand.refetch();
        toast.success("تم رفع الشعار وحفظه في مساحة المؤسسة.");
      } else {
        toast.success("تم حفظ شعار المؤسسة محلياً.");
      }
    } catch {
      toast.error("تعذر رفع الشعار. جرّب صورة PNG أو JPG أصغر.");
    }
  };

  const removeLogo = () => {
    const next = { name: brand.name };
    setBrand(next);
    persistBrand(next);
    toast.success("تمت إزالة الشعار المحلي. احفظ شعاراً جديداً لمزامنة هوية المؤسسة.");
  };

  return <article className="surface-panel rounded-2xl p-6">
    <div className="flex items-start justify-between gap-4"><div><p className="text-display text-3xl">هوية الإيصال</p><p className="mt-1 text-xs leading-5 text-white/45">تظهر هذه الهوية في الطباعة وملف PDF. عند تسجيل الدخول تُحفظ أيضاً في مساحة المؤسسة.</p></div><ImagePlus className="h-5 w-5 text-white/45" /></div>
    <div className="mt-6 grid gap-5 md:grid-cols-[1fr_180px] md:items-end">
      <label className="block text-xs text-white/50">اسم المؤسسة<input value={brand.name} onChange={event => updateName(event.target.value)} className="mt-2 w-full control-light px-4 py-3 text-sm" placeholder="مثال: أكاديمية النور" /></label>
      <div className="flex items-center gap-3"><div className="flex h-16 w-24 items-center justify-center rounded-2xl border border-cyan-100 bg-white p-2 shadow-sm">{brand.logoDataUrl ? <img src={brand.logoDataUrl} alt="شعار المؤسسة" className="max-h-full max-w-full object-contain" /> : <span className="text-[10px] text-white/35">بدون شعار</span>}</div><div className="flex flex-col gap-2"><label className="cursor-pointer text-xs text-white/75 hover:text-white">اختيار شعار<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={event => updateLogo(event.target.files?.[0])} /></label>{brand.logoDataUrl && <button type="button" onClick={removeLogo} className="inline-flex items-center gap-1 text-right text-xs text-white/45 hover:text-white"><Trash2 className="h-3 w-3" /> إزالة</button>}</div></div>
    </div>
  </article>;
}
