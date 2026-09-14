import React, { useState } from "react";
import {
  UserRoundPlus,
  Printer,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  BadgeCheck,
  GraduationCap,
  Sparkles,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export interface AlgerianStudentRegistrationData {
  // Student Identity
  nationalStudentId: string; // رقم التعريف المدرسي الوطني
  familyNameAr: string;
  firstNameAr: string;
  familyNameFr: string;
  firstNameFr: string;
  birthDate: string;
  birthPlace: string;
  birthWilaya: string;
  birthCommune: string;
  birthCertificateNumber: string;
  gender: "male" | "female";
  bloodType: string;

  // Academic Placement
  cycle: "primary" | "middle" | "secondary";
  grade: string;
  stream: string;
  regime: "externat" | "demi-pension" | "internat";
  isRepeating: boolean;
  foreignLanguage1: string;
  foreignLanguage2: string;
  amazighLanguage: boolean;

  // Guardian Identity
  guardianRelationship: "father" | "mother" | "legal_guardian";
  guardianNameAr: string;
  guardianNin: string; // رقم التعريف الوطني البيومتري
  guardianJob: string;
  guardianPhone: string;
  guardianEmergencyPhone: string;
  guardianEmail: string;
  addressAr: string;
  residenceWilaya: string;
  residenceCommune: string;

  // Health & Special Needs
  hasChronicCondition: boolean;
  chronicConditionDetails: string;
  peExemption: boolean; // إعفاء من التربية البدنية
  specialNeeds: string;

  // Documents attached
  docsBirthCert: boolean;
  docsVaccinationBook: boolean;
  docsPhotos: boolean;
  docsResidencyProof: boolean;
  docsSchoolTransferCert: boolean;
}

const ALGERIAN_WILAYAS = [
  "01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة",
  "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة",
  "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو",
  "16 - الجزائر العاصمة", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة",
  "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة",
  "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة",
  "31 - وهران", "32 - البيض", "33 - إليزي", "34 - برج بوعريريج", "35 - بومرداس",
  "36 - الطارف", "37 - تندوف", "38 - تسمسيلت", "39 - الوادي", "40 - خنشلة",
  "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلى", "45 - النعامة",
  "46 - عين تموشنت", "47 - غرداية", "48 - غليزان", "49 - تيميمون", "50 - برج باجي مختار",
  "51 - أولاد جلال", "52 - بني عباس", "53 - عين صالح", "54 - عين قزام", "55 - تقرت",
  "56 - جانت", "57 - المغير", "58 - المنيعة"
];

interface AlgerianOfficialRegistrationFormProps {
  isArabic?: boolean;
  compact?: boolean;
  onSuccess?: (student: AlgerianStudentRegistrationData) => void;
  onCancel?: () => void;
}

export function AlgerianOfficialRegistrationForm({
  isArabic = true,
  compact = false,
  onSuccess,
  onCancel,
}: AlgerianOfficialRegistrationFormProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [formData, setFormData] = useState<AlgerianStudentRegistrationData>({
    nationalStudentId: `DZ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    familyNameAr: "",
    firstNameAr: "",
    familyNameFr: "",
    firstNameFr: "",
    birthDate: "2008-05-14",
    birthPlace: "الجزائر العاصمة",
    birthWilaya: "16 - الجزائر العاصمة",
    birthCommune: "سيدي امحمد",
    birthCertificateNumber: "02481",
    gender: "male",
    bloodType: "O+",

    cycle: "secondary",
    grade: "3as",
    stream: "علوم تجريبية (Sciences Expérimentales)",
    regime: "demi-pension",
    isRepeating: false,
    foreignLanguage1: "الفرنسية (Français)",
    foreignLanguage2: "الإنجليزية (English)",
    amazighLanguage: false,

    guardianRelationship: "father",
    guardianNameAr: "",
    guardianNin: "119821601002340012",
    guardianJob: "موظف بالوظيفة العمومية",
    guardianPhone: "+213 555 12 34 56",
    guardianEmergencyPhone: "+213 661 78 90 12",
    guardianEmail: "wali.amr@gmail.com",
    addressAr: "حي 500 مسكن، عمارة ب، رقم 12",
    residenceWilaya: "16 - الجزائر العاصمة",
    residenceCommune: "باب الزوار",

    hasChronicCondition: false,
    chronicConditionDetails: "",
    peExemption: false,
    specialNeeds: "لا يوجد",

    docsBirthCert: true,
    docsVaccinationBook: true,
    docsPhotos: true,
    docsResidencyProof: true,
    docsSchoolTransferCert: true,
  });

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("يرجى السماح بالنوافذ المنبثقة للطباعة");
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>استمارة تسجيل تلميذ - وزارة التربية الوطنية</title>
        <style>
          body { font-family: 'Amiri', 'DejaVu Sans', serif; margin: 20px; color: #111; direction: rtl; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
          .header h3, .header h4, .header h2 { margin: 3px 0; }
          .republic { font-size: 15px; font-weight: bold; }
          .ministry { font-size: 14px; }
          .form-title { font-size: 18px; font-weight: bold; margin-top: 10px; background: #eee; padding: 6px; border: 1px solid #999; }
          .section-title { background: #044b35; color: white; padding: 4px 8px; font-size: 13px; font-weight: bold; margin-top: 14px; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 12px; }
          td, th { border: 1px solid #777; padding: 5px 8px; text-align: right; }
          th { background: #f5f5f5; width: 25%; font-weight: bold; }
          .barcode { text-align: center; margin: 8px 0; font-family: monospace; font-size: 16px; letter-spacing: 4px; }
          .footer { margin-top: 25px; display: flex; justify-content: space-between; font-size: 12px; }
          .signature-box { border: 1px dashed #444; height: 75px; width: 220px; margin-top: 6px; text-align: center; padding-top: 5px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="republic">الجمهورية الجزائرية الديمقراطية الشعبية</div>
          <div class="ministry">وزارة التربية الوطنية · مديرية التعليم الثانوي والتقني</div>
          <div class="form-title">استمارة تسجيل تلميذ رسمي بالمنظومة التربوية (بطاقة التلميذ الرقمية)</div>
          <div class="barcode">||| ${formData.nationalStudentId} |||</div>
        </div>

        <div class="section-title">1. الهوية الرسمية للتلميذ</div>
        <table>
          <tr>
            <th>رقم التعريف المدرسي الوطني (NIE):</th>
            <td><strong>${formData.nationalStudentId}</strong></td>
            <th>رقم عقد الازدياد:</th>
            <td>${formData.birthCertificateNumber}</td>
          </tr>
          <tr>
            <th>اللقب والاسم (بالعربية):</th>
            <td>${formData.familyNameAr} ${formData.firstNameAr}</td>
            <th>اللقب والاسم (باللاتينية):</th>
            <td>${formData.familyNameFr} ${formData.firstNameFr}</td>
          </tr>
          <tr>
            <th>تاريخ ومكان الازدياد:</th>
            <td>${formData.birthDate} بـ ${formData.birthPlace}</td>
            <th>الولاية والبلدية:</th>
            <td>${formData.birthWilaya} - ${formData.birthCommune}</td>
          </tr>
          <tr>
            <th>الجنس وزمرة الدم:</th>
            <td>${formData.gender === "male" ? "ذكر" : "أنثى"} · ${formData.bloodType}</td>
            <th>الصفة المدرسية:</th>
            <td>${formData.regime === "internat" ? "داخلي" : formData.regime === "demi-pension" ? "نصف داخلي" : "خارجي"}</td>
          </tr>
        </table>

        <div class="section-title">2. التوجيه التربوي والشعبة الدراسية</div>
        <table>
          <tr>
            <th>الطور التعليمي:</th>
            <td>${formData.cycle === "secondary" ? "التعليم الثانوي العام والتكنولوجي" : formData.cycle === "middle" ? "التعليم المتوسط" : "التعليم الابتدائي"}</td>
            <th>المستوى الدراسي:</th>
            <td>${formData.grade.toUpperCase()}</td>
          </tr>
          <tr>
            <th>الشعبة الموجه إليها:</th>
            <td colspan="3"><strong>${formData.stream}</strong></td>
          </tr>
          <tr>
            <th>اللغات المدرجة:</th>
            <td colspan="3">ل.أ 1: ${formData.foreignLanguage1} | ل.أ 2: ${formData.foreignLanguage2} | الأمازيغية: ${formData.amazighLanguage ? "نعم" : "معفى"}</td>
          </tr>
        </table>

        <div class="section-title">3. هوية الولي أو الوصي الشرعي</div>
        <table>
          <tr>
            <th>الاسم واللقب وصلة القرابة:</th>
            <td>${formData.guardianNameAr} (${formData.guardianRelationship === "father" ? "الأب" : formData.guardianRelationship === "mother" ? "الأم" : "وصي شرعي"})</td>
            <th>رقم التعريف الوطني (NIN):</th>
            <td>${formData.guardianNin}</td>
          </tr>
          <tr>
            <th>المهنة وجهة العمل:</th>
            <td>${formData.guardianJob}</td>
            <th>أرقام الهاتف للتواصل:</th>
            <td>${formData.guardianPhone} / طوارئ: ${formData.guardianEmergencyPhone}</td>
          </tr>
          <tr>
            <th>العنوان الدائم:</th>
            <td colspan="3">${formData.addressAr} · ${formData.residenceCommune}، ${formData.residenceWilaya}</td>
          </tr>
        </table>

        <div class="section-title">4. الملاحظات الصحية والتربية البدنية</div>
        <table>
          <tr>
            <th>أمراض مزمنة أو متابعة خاصة:</th>
            <td>${formData.hasChronicCondition ? formData.chronicConditionDetails : "لا يوجد، بصحة جيدة"}</td>
            <th>التربية البدنية والرياضية:</th>
            <td>${formData.peExemption ? "معفى بتقرير طبي" : "مؤهل وغير معفى"}</td>
          </tr>
        </table>

        <div class="footer">
          <div>
            <strong>توقيع ومصادقة الولي:</strong>
            <div class="signature-box">بصمة / توقيع الولي القانوني</div>
          </div>
          <div style="text-align: center;">
            <strong>تاريخ التسجيل:</strong><br>
            ${new Date().toLocaleDateString("ar-DZ")}
          </div>
          <div>
            <strong>ختم وتوقيع مدير المؤسسة:</strong>
            <div class="signature-box">ختم الإدارة التربوية</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    toast.success("تم إعداد الاستمارة الرسمية للطباعة بنجاح");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familyNameAr.trim() || !formData.firstNameAr.trim()) {
      toast.error("يرجى إدخال اسم ولقب التلميذ بالعربية");
      return;
    }
    if (!formData.guardianNameAr.trim() || !formData.guardianPhone.trim()) {
      toast.error("يرجى إدخال اسم ورقم هاتف ولي الأمر");
      return;
    }

    toast.success(`تم حفظ وتسجيل التلميذ "${formData.firstNameAr} ${formData.familyNameAr}" بنجاح في المنظومة الرقمية!`);
    if (onSuccess) {
      onSuccess(formData);
    }
  };

  return (
    <div className={`space-y-6 ${compact ? "p-2" : "surface-panel rounded-2xl p-6"}`} dir={isArabic ? "rtl" : "ltr"}>
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-600/10 text-emerald-700 px-2.5 py-1 text-xs font-bold border border-emerald-600/20">
              وزارة التربية الوطنية · المنظومة الرقمية
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">{formData.nationalStudentId}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {isArabic ? "استمارة تسجيل تلميذ جديد (المنظومة التربوية الرسمية)" : "Official Algerian Ministry Student Registration Form"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isArabic
              ? "استمارة التسجيل المطابقة لمعايير وزارة التربية الوطنية الجزائرية (الرقمنة): الهوية الوطنية، المسار والشعبة، الولي، والملف الصحي والإداري."
              : "Standard Algerian educational system registration form compliant with Ministry of National Education digitization standards."}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm self-start sm:self-auto"
        >
          <Printer className="h-4 w-4" />
          <span>{isArabic ? "طباعة الاستمارة الرسمية" : "Print Official Form"}</span>
        </button>
      </div>

      {/* Stepper Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs">
        {[
          { step: 1, label: isArabic ? "1. هوية التلميذ" : "1. Student ID" },
          { step: 2, label: isArabic ? "2. الطور والشعبة" : "2. Placement" },
          { step: 3, label: isArabic ? "3. ولي الأمر" : "3. Guardian" },
          { step: 4, label: isArabic ? "4. الملف الصحي" : "4. Health & PE" },
          { step: 5, label: isArabic ? "5. الملف والوثائق" : "5. Dossier" },
        ].map((tab) => (
          <button
            key={tab.step}
            type="button"
            onClick={() => setActiveStep(tab.step as any)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeStep === tab.step
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: STUDENT IDENTITY */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>{isArabic ? "معلومات الحالة المدنية وهوية التلميذ:" : "Civil Status & Identity:"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اللقب بالعربية *</label>
                <input
                  required
                  value={formData.familyNameAr}
                  onChange={(e) => setFormData({ ...formData, familyNameAr: e.target.value })}
                  placeholder="مثال: عبد الرحمن"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم بالعربية *</label>
                <input
                  required
                  value={formData.firstNameAr}
                  onChange={(e) => setFormData({ ...formData, firstNameAr: e.target.value })}
                  placeholder="مثال: سارة"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اللقب باللاتينية (Nom)</label>
                <input
                  value={formData.familyNameFr}
                  onChange={(e) => setFormData({ ...formData, familyNameFr: e.target.value })}
                  placeholder="ABDERRAHMANE"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم باللاتينية (Prénom)</label>
                <input
                  value={formData.firstNameFr}
                  onChange={(e) => setFormData({ ...formData, firstNameFr: e.target.value })}
                  placeholder="Sara"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ الازدياد *</label>
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم عقد الازدياد</label>
                <input
                  value={formData.birthCertificateNumber}
                  onChange={(e) => setFormData({ ...formData, birthCertificateNumber: e.target.value })}
                  placeholder="02481"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ولاية الازدياد</label>
                <select
                  value={formData.birthWilaya}
                  onChange={(e) => setFormData({ ...formData, birthWilaya: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">مكان / بلدية الازدياد</label>
                <input
                  value={formData.birthCommune}
                  onChange={(e) => setFormData({ ...formData, birthCommune: e.target.value })}
                  placeholder="سيدي امحمد"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الجنس وزمرة الدم</label>
                <div className="flex gap-2">
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                  >
                    <option value="male">ذكر (Masculin)</option>
                    <option value="female">أنثى (Féminin)</option>
                  </select>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 font-mono"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PLACEMENT & STREAMS */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>{isArabic ? "المسار التربوي والصف والشعبة الرسمية:" : "Academic Placement & Stream:"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الطور التعليمي</label>
                <select
                  value={formData.cycle}
                  onChange={(e) => setFormData({ ...formData, cycle: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                >
                  <option value="secondary">التعليم الثانوي العام والتكنولوجي (Lycée)</option>
                  <option value="middle">التعليم المتوسط (CEM)</option>
                  <option value="primary">التعليم الابتدائي (Primaire)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المستوى الدراسي</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                >
                  {formData.cycle === "secondary" ? (
                    <>
                      <option value="1as">السنة الأولى ثانوي (1AS - جذع مشترك)</option>
                      <option value="2as">السنة الثانية ثانوي (2AS)</option>
                      <option value="3as">السنة الثالثة ثانوي (3AS - تحضير البكالوريا)</option>
                    </>
                  ) : formData.cycle === "middle" ? (
                    <>
                      <option value="1am">السنة الأولى متوسط (1AM)</option>
                      <option value="2am">السنة الثانية متوسط (2AM)</option>
                      <option value="3am">السنة الثالثة متوسط (3AM)</option>
                      <option value="4am">السنة الرابعة متوسط (4AM - شهادة BEM)</option>
                    </>
                  ) : (
                    <>
                      <option value="1ap">السنة الأولى ابتدائي</option>
                      <option value="2ap">السنة الثانية ابتدائي</option>
                      <option value="3ap">السنة الثالثة ابتدائي</option>
                      <option value="4ap">السنة الرابعة ابتدائي</option>
                      <option value="5ap">السنة الخامسة ابتدائي</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الشعبة الرسمية (للثانوي)</label>
                <select
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 font-semibold"
                >
                  <option value="علوم تجريبية (Sciences Expérimentales)">علوم تجريبية (Sciences Expérimentales)</option>
                  <option value="رياضيات (Mathématiques)">رياضيات (Mathématiques)</option>
                  <option value="تقني رياضي - هندسة كهربائية/ميكانيكية (Technique Math)">تقني رياضي (Technique Math)</option>
                  <option value="تسيير واقتصاد (Gestion et Économie)">تسيير واقتصاد (Gestion et Économie)</option>
                  <option value="لغات أجنبية (Langues Étrangères)">لغات أجنبية (Langues Étrangères)</option>
                  <option value="آداب وفلسفة (Lettres et Philosophie)">آداب وفلسفة (Lettres et Philosophie)</option>
                  <option value="جذع مشترك علوم وتكنولوجيا">جذع مشترك علوم وتكنولوجيا (1AS)</option>
                  <option value="جذع مشترك آداب">جذع مشترك آداب (1AS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الصفة المدرسية (النظام)</label>
                <select
                  value={formData.regime}
                  onChange={(e) => setFormData({ ...formData, regime: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                >
                  <option value="demi-pension">نصف داخلي (Demi-pensionnaire - مطعم مدرسي)</option>
                  <option value="externat">خارجي (Externe)</option>
                  <option value="internat">داخلي (Interne - إيواء كامل)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اللغة الأجنبية الثانية (LV2)</label>
                <select
                  value={formData.foreignLanguage2}
                  onChange={(e) => setFormData({ ...formData, foreignLanguage2: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                >
                  <option value="الإنجليزية (English)">الإنجليزية (English)</option>
                  <option value="الإسبانية (Espagnol)">الإسبانية (Espagnol)</option>
                  <option value="الألمانية (Allemand)">الألمانية (Allemand)</option>
                  <option value="الإيطالية (Italien)">الإيطالية (Italien)</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isRepeating}
                    onChange={(e) => setFormData({ ...formData, isRepeating: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                  />
                  <span>تلميذ معيد للمستوى (Redoublant)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.amazighLanguage}
                    onChange={(e) => setFormData({ ...formData, amazighLanguage: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                  />
                  <span>مدرج في تدريس الأمازيغية</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: GUARDIAN IDENTITY */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>{isArabic ? "بيانات الولي أو الوصي الشرعي:" : "Legal Guardian & Parent Details:"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">صلة القرابة</label>
                <select
                  value={formData.guardianRelationship}
                  onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                >
                  <option value="father">الأب (Père)</option>
                  <option value="mother">الأم (Mère)</option>
                  <option value="legal_guardian">وصي شرعي / كفيل قانوني (Tuteur légal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم واللقب الكامل للولي *</label>
                <input
                  required
                  value={formData.guardianNameAr}
                  onChange={(e) => setFormData({ ...formData, guardianNameAr: e.target.value })}
                  placeholder="محمد عبد الرحمن"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم التعريف الوطني البيومتري (NIN)</label>
                <input
                  value={formData.guardianNin}
                  onChange={(e) => setFormData({ ...formData, guardianNin: e.target.value })}
                  placeholder="119821601002340012"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">مهنة الولي</label>
                <input
                  value={formData.guardianJob}
                  onChange={(e) => setFormData({ ...formData, guardianJob: e.target.value })}
                  placeholder="أستاذ / موظف / تاجر..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف الرئيسي للولي *</label>
                <input
                  required
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  placeholder="+213 555 12 34 56"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">هاتف الطوارئ البديل</label>
                <input
                  value={formData.guardianEmergencyPhone}
                  onChange={(e) => setFormData({ ...formData, guardianEmergencyPhone: e.target.value })}
                  placeholder="+213 661 78 90 12"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">العنوان الدائم ومحل الإقامة</label>
                <input
                  value={formData.addressAr}
                  onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                  placeholder="حي 500 مسكن، عمارة ب، رقم 12"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ولاية الإقامة</label>
                <select
                  value={formData.residenceWilaya}
                  onChange={(e) => setFormData({ ...formData, residenceWilaya: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                >
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: HEALTH & PHYSICAL EDUCATION */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-600" />
              <span>{isArabic ? "الملف الصحي والتربية البدنية والرياضية:" : "Health & Physical Education:"}</span>
            </h3>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.hasChronicCondition}
                  onChange={(e) => setFormData({ ...formData, hasChronicCondition: e.target.checked })}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-400"
                />
                <span>التلميذ يعاني من مرض مزمن أو يتطلب رعاية صحية خاصة (حساسية، ربو، سكري...)</span>
              </label>

              {formData.hasChronicCondition && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تفاصيل الحالة الصحية وإرشادات الطبيب المعالج:</label>
                  <textarea
                    rows={2}
                    value={formData.chronicConditionDetails}
                    onChange={(e) => setFormData({ ...formData, chronicConditionDetails: e.target.value })}
                    placeholder="يرجى كتابة البروتوكول الطبي وأدوية الطوارئ..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                  />
                </div>
              )}

              <div className="border-t border-slate-200 pt-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.peExemption}
                    onChange={(e) => setFormData({ ...formData, peExemption: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-400"
                  />
                  <span>إعفاء رسمي من ممارسة التربية البدنية والرياضية (بموجب شهادة طبية معتمدة من طبيب الصحة المدرسية UDS)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DOSSIER CHECKLIST */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>{isArabic ? "وثائق الملف الإداري المدرسي المرفقة (Dossier Scolaire):" : "Required Registration Dossier:"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "docsBirthCert", label: "شهادة الميلاد رقم 12 أو عقد الازدياد الأصلي" },
                { key: "docsVaccinationBook", label: "نسخة من الدفتر الصحي وبطاقة التلقيحات المحدثة" },
                { key: "docsPhotos", label: "صورتان شمسيتان حديثتان ملونتان (خلفية بيضاء)" },
                { key: "docsResidencyProof", label: "بطاقة الإقامة أو وصل إثبات السكن ضمن المقاطعة" },
                { key: "docsSchoolTransferCert", label: "شهادة المغادرة / الانتقال المدرسية الرسمية الأصلية" },
              ].map((doc) => (
                <label
                  key={doc.key}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition text-xs font-semibold text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={(formData as any)[doc.key]}
                    onChange={(e) => setFormData({ ...formData, [doc.key]: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                  />
                  <span>{doc.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((activeStep - 1) as any)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                السابق
              </button>
            )}
            {activeStep < 5 && (
              <button
                type="button"
                onClick={() => setActiveStep((activeStep + 1) as any)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800"
              >
                التالي
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                إلغاء
              </button>
            )}
            <button
              type="submit"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-600/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isArabic ? "تأكيد وتسجيل التلميذ في المنظومة" : "Confirm Official Registration"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
