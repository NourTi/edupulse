import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UsersRound,
  FileCheck2,
  Bell,
  HeartPulse,
  Send,
  Printer,
  ChevronRight,
  Compass,
  Check,
  Clock,
  Sparkles,
  PhoneCall,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { StudentRadarProfile, type StudentRadarData } from "./StudentRadarProfile";

interface Props {
  isArabic: boolean;
  guardianName?: string;
}

export function GuardianPortalPanel({ isArabic, guardianName = "الطيب المنصوري" }: Props) {
  const query = trpc.records.guardianLearners.useQuery(undefined, { retry: false });

  // Consent states
  const [consents, setConsents] = useState({
    institutional: {
      granted: true,
      signedAt: "01 سبتمبر 2025",
      titleAr: "الموافقة على النظام الداخلي والانضباط المدرسي",
      titleEn: "Institutional Bylaws & Conduct Consent",
      descAr: "الموافقة الصريحة على اللائحة الداخلية للمؤسسة والتزام التلميذ بقواعد السلوك والمواظبة.",
    },
    digitalAlerts: {
      granted: true,
      signedAt: "15 سبتمبر 2025",
      titleAr: "الموافقة على استلام الإشعارات المباشرة ورسائل التقدم",
      titleEn: "Digital Alerts & Progress Messages Consent",
      descAr: "التفويض باستلام رسائل الحضور الأسبوعية وتقارير الكفاءات الدورية عبر الهاتف.",
    },
    fieldwork: {
      granted: true,
      signedAt: "10 أكتوبر 2025",
      titleAr: "الموافقة على الأنشطة البيداغوجية والخرجات الميدانية",
      titleEn: "Field Trips & Educational Activities Consent",
      descAr: "الإذن بالمشاركة في الورشات العلمية، المعارض الأكاديمية والزيارات الاستكشافية المؤطرة.",
    },
    emergencyHealth: {
      granted: true,
      signedAt: "05 سبتمبر 2025",
      titleAr: "التفويض الصحي والتصريح في الحالات الطارئة",
      titleEn: "Emergency Medical & Health Care Authorization",
      descAr: "تفويض إدارة المؤسسة بنقل التلميذ للرعاية الطبية العاجلة وإخطار ولي الأمر فوراً.",
    },
  });

  const [activeTab, setActiveTab] = useState<"consent" | "children" | "radar">("consent");
  const [selectedChildId, setSelectedChildId] = useState<string>("stu-1");

  // Local linked children records
  const linkedChildren: StudentRadarData[] = [
    {
      id: "stu-1",
      name: "Yassine Mansouri",
      nameAr: "ياسين المنصوري",
      grade: "3 ثانوي - علوم تجريبية (BAC)",
      guardian: guardianName,
      phone: "+213 550 12 34 56",
      level: "B1",
      attendance: 95,
      subjects: ["اللغة العربية", "العلوم الفيزيائية", "الرياضيات", "علوم الطبيعة والحياة"],
      status: "Active",
    },
    {
      id: "stu-2",
      name: "Meriem Mansouri",
      nameAr: "مريم المنصوري",
      grade: "1 متوسط - لغات عامة",
      guardian: guardianName,
      phone: "+213 550 12 34 56",
      level: "A2",
      attendance: 98,
      subjects: ["اللغة العربية", "اللغة الفرنسية", "اللغة الإنجليزية", "الرياضيات"],
      status: "Active",
    },
  ];

  const activeChild = linkedChildren.find((c) => c.id === selectedChildId) || linkedChildren[0];

  const handleToggleConsent = (key: keyof typeof consents) => {
    setConsents((prev) => {
      const current = prev[key];
      const nextGranted = !current.granted;
      return {
        ...prev,
        [key]: {
          ...current,
          granted: nextGranted,
          signedAt: nextGranted
            ? new Date().toLocaleDateString("ar-DZ", { day: "numeric", month: "long", year: "numeric" })
            : "—",
        },
      };
    });

    toast.success(
      isArabic
        ? "تم تحديث حالة الموافقة والتفويض بنجاح وتسجيل التاريخ"
        : "Parental consent status updated and timestamped"
    );
  };

  const handlePrintCertificate = () => {
    window.print();
    toast.success(isArabic ? "تم تجهيز وثيقة الموافقة للطباعة" : "Consent certificate ready for printing");
  };

  return (
    <div className="space-y-8" dir={isArabic ? "rtl" : "ltr"}>
      {/* Vivid Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-700 via-emerald-800 to-indigo-800 p-8 text-white shadow-xl shadow-teal-700/10">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              <span>{isArabic ? "بوابة ولي الأمر الرسمية · سجل الموافقات الحصرية" : "Guardian Portal & Official Consent Hub"}</span>
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {isArabic ? `مرحباً بك، ولي الأمر: ${guardianName}` : `Welcome, Guardian: ${guardianName}`}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-teal-100/90 max-w-2xl">
              {isArabic
                ? "مساحتك الخاصة لمتابعة الأبناء، إدارة الموافقات والتفويضات الرسمية، والاطلاع على البصمة الإدراكية بكل شفافية وأمان."
                : "Dedicated space to manage parental authorizations, track attendance, and inspect student cognitive KPIs."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrintCertificate}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black text-teal-900 shadow-md transition hover:bg-teal-50"
            >
              <Printer className="h-4 w-4 text-teal-700" />
              <span>{isArabic ? "طباعة شهادة الموافقات" : "Print Consent Form"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("consent")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "consent"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>{isArabic ? "سجل الموافقات والتفويضات" : "Consent & Authorizations"}</span>
        </button>

        <button
          onClick={() => setActiveTab("children")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "children"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UsersRound className="h-4 w-4" />
          <span>{isArabic ? `الأبناء المسجلون (${linkedChildren.length})` : `Linked Children (${linkedChildren.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab("radar")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "radar"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>{isArabic ? "المخطط الإدراكي للأبناء (Radar)" : "Student Radar Profile"}</span>
        </button>
      </div>

      {/* TAB 1: CONSENT & AUTHORIZATIONS */}
      {activeTab === "consent" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                {isArabic
                  ? "جميع التوقيعات والتفويضات الرقمية مسجلة رسمياً ومحمية وفق معايير الخصوصية البيداغوجية الجزائرية."
                  : "All authorizations are digitally recorded and secured under strict institutional protocols."}
              </span>
            </div>
            <span className="font-bold text-emerald-700">{isArabic ? "مُصدق رسمياً" : "Verified"}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(consents).map(([key, item]) => {
              const consentKey = key as keyof typeof consents;
              return (
                <div
                  key={key}
                  className="relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white ${
                            item.granted ? "bg-emerald-500 shadow-sm" : "bg-slate-300"
                          }`}
                        >
                          <FileCheck2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-sm">
                            {isArabic ? item.titleAr : item.titleEn}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {item.granted
                              ? isArabic
                                ? `تم التوقيع والموافقة في: ${item.signedAt}`
                                : `Signed on: ${item.signedAt}`
                              : isArabic
                              ? "بانتظار موافقة ولي الأمر"
                              : "Pending Signature"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black ${
                          item.granted
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {item.granted
                          ? isArabic ? "موافق عليه" : "Granted"
                          : isArabic ? "موقوف" : "Revoked"}
                      </span>
                    </div>

                    <p className="mt-4 text-xs leading-6 text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {isArabic ? item.descAr : item.titleEn}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {isArabic ? "صلاحية ولي الأمر" : "Guardian Authority"}
                    </span>
                    <button
                      onClick={() => handleToggleConsent(consentKey)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                        item.granted
                          ? "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                          : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                      }`}
                    >
                      {item.granted ? (
                        <>
                          <span>{isArabic ? "سحب الموافقة مؤقتاً" : "Revoke Consent"}</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>{isArabic ? "منح الموافقة والتوقيع" : "Sign & Authorize"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LINKED CHILDREN CARDS */}
      {activeTab === "children" && (
        <div className="grid gap-6 md:grid-cols-2">
          {linkedChildren.map((child) => (
            <div
              key={child.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-lg font-black text-white shadow-md">
                    {child.nameAr.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{child.nameAr}</h3>
                    <p className="text-xs text-slate-500">{child.grade}</p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                  {child.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div className="rounded-2xl bg-slate-50 p-3 text-center border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400">{isArabic ? "نسبة الحضور" : "Attendance"}</p>
                  <p className="text-xl font-black text-teal-700">{child.attendance}%</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-center border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400">{isArabic ? "المستوى اللغوي" : "CEFR Level"}</p>
                  <p className="text-xl font-black text-indigo-700">{child.level}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-bold text-slate-500 mb-2">
                  {isArabic ? "المواد المسجلة في الخطة:" : "Enrolled subjects:"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {child.subjects.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => {
                    setSelectedChildId(child.id);
                    setActiveTab("radar");
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>{isArabic ? "عرض المخطط العنكبوتي (Radar)" : "Open Radar Profile"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: RADAR PROFILE FOR LINKED CHILD */}
      {activeTab === "radar" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{isArabic ? "اختر التلميذ:" : "Select Child:"}</span>
              <div className="flex gap-2">
                {linkedChildren.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                      child.id === selectedChildId
                        ? "border-teal-500 bg-teal-50 text-teal-800 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {child.nameAr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <StudentRadarProfile
            student={activeChild}
            canEditKpi={false}
            language={isArabic ? "ar" : "en"}
          />
        </div>
      )}
    </div>
  );
}
