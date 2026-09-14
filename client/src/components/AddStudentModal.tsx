import { useState } from "react";
import { X, Upload, Check, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface AlgerianGradeOption {
  id: string;
  cycleAr: string;
  gradeAr: string;
  streamAr?: string;
  en: string;
}

export const ALGERIAN_DETAILED_GRADES: AlgerianGradeOption[] = [
  // Primary
  { id: "1ap", cycleAr: "التعليم الابتدائي", gradeAr: "السنة الأولى ابتدائي (1AP)", en: "Primary Year 1" },
  { id: "2ap", cycleAr: "التعليم الابتدائي", gradeAr: "السنة الثانية ابتدائي (2AP)", en: "Primary Year 2" },
  { id: "3ap", cycleAr: "التعليم الابتدائي", gradeAr: "السنة الثالثة ابتدائي — بداية الإنجليزية (3AP)", en: "Primary Year 3 (English Start)" },
  { id: "4ap", cycleAr: "التعليم الابتدائي", gradeAr: "السنة الرابعة ابتدائي (4AP)", en: "Primary Year 4" },
  { id: "5ap", cycleAr: "التعليم الابتدائي", gradeAr: "السنة الخامسة ابتدائي (5AP)", en: "Primary Year 5" },
  
  // Middle
  { id: "1am", cycleAr: "التعليم المتوسط", gradeAr: "السنة الأولى متوسط (1AM)", en: "Middle Year 1" },
  { id: "2am", cycleAr: "التعليم المتوسط", gradeAr: "السنة الثانية متوسط (2AM)", en: "Middle Year 2" },
  { id: "3am", cycleAr: "التعليم المتوسط", gradeAr: "السنة الثالثة متوسط (3AM)", en: "Middle Year 3" },
  { id: "4am-bem", cycleAr: "التعليم المتوسط", gradeAr: "السنة الرابعة متوسط — شهادة BEM", en: "Middle Year 4 (BEM Exam)" },
  
  // Secondary 1st Year
  { id: "1as-st", cycleAr: "التعليم الثانوي", gradeAr: "1AS · جذع مشترك علوم وتكنولوجيا", en: "Secondary 1: Science & Tech" },
  { id: "1as-l", cycleAr: "التعليم الثانوي", gradeAr: "1AS · جذع مشترك آداب ولغات", en: "Secondary 1: Letters & Languages" },
  
  // Secondary 2nd Year
  { id: "2as-sci", cycleAr: "التعليم الثانوي", gradeAr: "2AS · شعبة علوم تجريبية", en: "Secondary 2: Experimental Sciences" },
  { id: "2as-math", cycleAr: "التعليم الثانوي", gradeAr: "2AS · شعبة رياضيات", en: "Secondary 2: Mathematics" },
  { id: "2as-lang", cycleAr: "التعليم الثانوي", gradeAr: "2AS · شعبة لغات أجنبية (English focus)", en: "Secondary 2: Foreign Languages" },
  { id: "2as-phil", cycleAr: "التعليم الثانوي", gradeAr: "2AS · شعبة آداب وفلسفة", en: "Secondary 2: Literature & Philosophy" },
  { id: "2as-econ", cycleAr: "التعليم الثانوي", gradeAr: "2AS · شعبة تسيير واقتصاد", en: "Secondary 2: Management & Economics" },
  
  // Secondary 3rd Year (BAC)
  { id: "3as-sci-bac", cycleAr: "التعليم الثانوي", gradeAr: "3AS بكالوريا · شعبة علوم تجريبية", en: "Secondary 3 (BAC): Experimental Sciences" },
  { id: "3as-math-bac", cycleAr: "التعليم الثانوي", gradeAr: "3AS بكالوريا · شعبة رياضيات", en: "Secondary 3 (BAC): Mathematics" },
  { id: "3as-tm-bac", cycleAr: "التعليم الثانوي", gradeAr: "3AS بكالوريا · تقني رياضي", en: "Secondary 3 (BAC): Math-Technical" },
  { id: "3as-lang-bac", cycleAr: "التعليم الثانوي", gradeAr: "3AS بكالوريا · لغات أجنبية (English, French, Spanish/German/Italian)", en: "Secondary 3 (BAC): Foreign Languages" },
  { id: "3as-phil-bac", cycleAr: "التعليم الثانوي", gradeAr: "3AS بكالوريا · آداب وفلسفة", en: "Secondary 3 (BAC): Literature & Philosophy" },
  { id: "3as-econ-bac", cycleAr: "التعليم الثانوي", gradeAr: "3AS بكالوريا · تسيير واقتصاد", en: "Secondary 3 (BAC): Management & Economics" },
  
  // Higher Education
  { id: "univ-l1", cycleAr: "التعليم العالي", gradeAr: "جامعي · السنة الأولى ليسانس (L1)", en: "University L1" },
  { id: "univ-l2", cycleAr: "التعليم العالي", gradeAr: "جامعي · السنة الثانية ليسانس (L2)", en: "University L2" },
  { id: "univ-l3", cycleAr: "التعليم العالي", gradeAr: "جامعي · تخرج ليسانس (L3)", en: "University L3 (Degree)" },
  { id: "univ-m1", cycleAr: "التعليم العالي", gradeAr: "جامعي · ماستر أبحاث / تخصص (M1)", en: "University M1" },
  { id: "univ-m2", cycleAr: "التعليم العالي", gradeAr: "جامعي · ماستر مناقشة المذكرة (M2)", en: "University M2 (Defense)" },
  { id: "univ-phd", cycleAr: "التعليم العالي والبحث العلمي", gradeAr: "جامعي · طور الدكتوراه وبحث الأطروحة (PhD)", en: "Doctoral Research (PhD)" },
];

export const AVAILABLE_SUBJECTS = [
  { id: "english", ar: "اللغة الإنجليزية", en: "English Language" },
  { id: "arabic", ar: "اللغة العربية وآدابها", en: "Arabic" },
  { id: "mathematics", ar: "الرياضيات", en: "Mathematics" },
  { id: "physics", ar: "العلوم الفيزيائية والتكنولوجيا", en: "Physics" },
  { id: "natural_sciences", ar: "علوم الطبيعة والحياة", en: "Natural Sciences" },
  { id: "philosophy", ar: "الفلسفة", en: "Philosophy" },
  { id: "french", ar: "اللغة الفرنسية", en: "French" },
  { id: "history_geo", ar: "التاريخ والجغرافيا", en: "History & Geography" },
  { id: "islamic_studies", ar: "العلوم الإسلامية", en: "Islamic Studies" },
  { id: "computer_science", ar: "الإعلام الآلي والبرمجة", en: "Computer Science" },
];

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
  onStudentCreated?: (student: any) => void;
}

export function AddStudentModal({ isOpen, onClose, isArabic, onStudentCreated }: AddStudentModalProps) {
  const [nameAr, setNameAr] = useState("");
  const [name, setName] = useState("");
  const [guardian, setGuardian] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("3as-sci-bac");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["english", "mathematics", "physics"]);
  const [level, setLevel] = useState("B1");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const createLearnerMutation = trpc.records.createLearner.useMutation({
    onSuccess: (learner) => {
      toast.success(isArabic ? "تم تسجيل الطالب بنجاح في قاعدة المؤسسة" : "Student enrolled successfully");
      if (onStudentCreated) {
        onStudentCreated({
          id: learner.id,
          name: learner.name,
          nameAr: learner.nameAr,
          grade: learner.grade,
          guardian: guardian || "—",
          phone: learner.phone || phone || "—",
          level: level || "A1",
          attendance: 100,
          subjects: selectedSubjects,
          status: "Active",
          avatarUrl: learner.avatarUrl || avatarDataUrl || undefined,
        });
      }
      onClose();
    },
    onError: (error) => {
      console.error("[createLearner error]", error);
      toast.error(error.message || (isArabic ? "تعذر تسجيل الطالب، يرجى التحقق من البيانات" : "Failed to register student"));
    }
  });

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(isArabic ? "يرجى اختيار ملف صورة صالح" : "Please select an image file");
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 160;
        const MAX_HEIGHT = 160;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
          setAvatarDataUrl(compressedDataUrl);
        } else {
          setAvatarDataUrl(event.target?.result as string);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsCompressing(false);
      toast.error(isArabic ? "فشل قراءة الصورة" : "Failed to read image");
    };
    reader.readAsDataURL(file);
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId) ? prev.filter(s => s !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) {
      toast.error(isArabic ? "يرجى كتابة اسم الطالب بالعربية" : "Please enter student name in Arabic");
      return;
    }

    createLearnerMutation.mutate({
      name: name.trim() || nameAr.trim(),
      nameAr: nameAr.trim(),
      guardian: guardian.trim() || undefined,
      phone: phone.trim() || undefined,
      grade,
      avatarDataUrl: avatarDataUrl || undefined,
      status: "active"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8 border border-slate-200" 
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {isArabic ? "نظام التسجيل المركزي الموحد" : "Centralized Enrollment"}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {isArabic ? "تسجيل طالب جديد في المنهاج والمؤسسة" : "Register New Student"}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload Box */}
          <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="relative h-20 w-20 shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-dashed border-blue-400 shadow-xs">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <Upload className="h-7 w-7 text-blue-500" />
              )}
              {isCompressing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <p className="text-xs font-bold text-slate-800">
                {isArabic ? "صورة الطالب الرسمية (للبطاقة المدرسية والسجل)" : "Student Profile Picture"}
              </p>
              <p className="text-[11px] text-slate-500">
                {isArabic ? "تدعم JPG و PNG و WebP. يتم ضغطها وتحسينها تلقائياً." : "Supports JPG, PNG, WebP. Compressed automatically."}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  id="studentAvatarInput" 
                />
                <label 
                  htmlFor="studentAvatarInput" 
                  className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isArabic ? "اختيار صورة من الجهاز" : "Upload Photo"}
                </label>
                {avatarDataUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarDataUrl(null)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isArabic ? "حذف الصورة" : "Remove"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Student Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                {isArabic ? "اسم الطالب الكامل بالعربية *" : "Full Name (Arabic) *"}
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 bg-white text-slate-900"
                placeholder={isArabic ? "مثال: مريم بلقاسم" : "e.g. مريم بلقاسم"}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                {isArabic ? "الاسم باللاتينية / الإنجليزية" : "Name (Latin / English)"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 bg-white text-slate-900"
                placeholder="e.g. Meriem Belkacem"
              />
            </div>
          </div>

          {/* Guardian and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                {isArabic ? "اسم ولي الأمر" : "Guardian Name"}
              </label>
              <input
                type="text"
                value={guardian}
                onChange={(e) => setGuardian(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 bg-white text-slate-900"
                placeholder={isArabic ? "مثال: عبد الحميد بلقاسم" : "Guardian name"}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                {isArabic ? "رقم الهاتف للتواصل وإشعارات الولي" : "Contact Phone Number"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 bg-white text-slate-900"
                placeholder="+213 6..."
              />
            </div>
          </div>

          {/* Grade & CEFR Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                {isArabic ? "الطور والمستوى الدراسي الجزائري" : "Algerian Education Grade & Stream"}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-medium outline-none focus:border-blue-500 bg-white text-slate-900"
              >
                {ALGERIAN_DETAILED_GRADES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.cycleAr} — {g.gradeAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                {isArabic ? "المستوى التقديري في الإنجليزية (CEFR)" : "Initial English CEFR Level"}
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-medium outline-none focus:border-blue-500 bg-white text-slate-900"
              >
                <option value="A1">A1 — مبتدئ (Beginner)</option>
                <option value="A2">A2 — أساسي (Elementary)</option>
                <option value="B1">B1 — متوسط (Intermediate)</option>
                <option value="B2">B2 — فوق المتوسط (Upper-Intermediate / BAC)</option>
                <option value="C1">C1 — متقدم جامعي (Advanced / University)</option>
              </select>
            </div>
          </div>

          {/* Subject Enrollment Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700">
                {isArabic ? "المواد الدراسية المقيدة في البرنامج:" : "Enrolled Curriculum Subjects:"}
              </label>
              <span className="text-[11px] font-semibold text-blue-600">
                {selectedSubjects.length} {isArabic ? "مواد مختارة" : "selected"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.id);
                return (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 text-blue-900 font-semibold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{isArabic ? sub.ar : sub.en}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={createLearnerMutation.isPending || isCompressing}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
            >
              {createLearnerMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isArabic ? "جاري الحفظ والتسجيل..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isArabic ? "تأكيد تسجيل الطالب في المؤسسة" : "Confirm Student Enrollment"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
