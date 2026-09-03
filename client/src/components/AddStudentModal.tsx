import { useState } from "react";
import { X, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const educationStages = [
  { id: "preparatory", ar: "التعليم التحضيري", en: "Preparatory" },
  { id: "primary", ar: "التعليم الابتدائي", en: "Primary" },
  { id: "middle", ar: "التعليم المتوسط", en: "Middle" },
  { id: "secondary", ar: "التعليم الثانوي", en: "Secondary" },
  { id: "higher", ar: "التعليم العالي", en: "Higher" },
];

export function AddStudentModal({ isOpen, onClose, isArabic }: { isOpen: boolean; onClose: () => void; isArabic: boolean }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("secondary");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  const createLearner = trpc.records.createLearner.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم إنشاء الطالب بنجاح" : "Student created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create student");
    }
  });

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLearner.mutate({ 
      name, 
      nameAr: name, 
      phone, 
      grade: stage, 
      avatarDataUrl: avatarDataUrl || undefined 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" dir={isArabic ? "rtl" : "ltr"}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{isArabic ? "إضافة طالب جديد" : "Add New Student"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="avatarInput" />
            <label htmlFor="avatarInput" className="cursor-pointer text-xs font-medium text-blue-600 hover:underline">
              {isArabic ? "رفع صورة الطالب" : "Upload Student Photo"}
            </label>
          </div>

          {/* Name Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{isArabic ? "الاسم" : "Name"}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder={isArabic ? "أدخل الاسم الكامل" : "Enter full name"}
            />
          </div>

          {/* Phone Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{isArabic ? "الهاتف" : "Phone"}</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder="+213..."
            />
          </div>

          {/* Education Stage Select */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{isArabic ? "المرحلة التعليمية" : "Education Stage"}</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {educationStages.map((s) => (
                <option key={s.id} value={s.id}>{isArabic ? s.ar : s.en}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createLearner.isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {createLearner.isPending ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ الطالب" : "Save Student")}
          </button>
        </form>
      </div>
    </div>
  );
}
