import React, { useState } from "react";
import {
  UserCheck,
  Brain,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  Target,
  BookOpen,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { trpc } from "../../lib/trpc";

interface PersonalityProfilerProps {
  isArabic?: boolean;
}

export function PersonalityProfiler({ isArabic = true }: PersonalityProfilerProps) {
  const [studentName, setStudentName] = useState("أحمد بن سالم");
  const [behaviors, setBehaviors] = useState<string[]>([
    "شديد التركيز على المسائل المنطقية والرياضيات",
    "يفضل العمل الفردي المتعمق على المشاريع الجماعية الصاخبة",
    "يسأل دوماً عن البرهان الرياضي والعلة وراء كل قانون",
  ]);
  const [newBehavior, setNewBehavior] = useState("");

  const personalityQuery = trpc.integrations.personality.useQuery({
    studentName,
    observedBehaviors: behaviors,
  });

  const handleAddBehavior = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBehavior.trim()) return;
    setBehaviors([...behaviors, newBehavior.trim()]);
    setNewBehavior("");
  };

  const profile = personalityQuery.data;

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 text-white shadow-sm border border-purple-900/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-400/30">
              <Brain className="h-3.5 w-3.5" />
              <span>{isArabic ? "نظام Personality.fyi للتحليل النفسي والتربوي للطلاب" : "Personality.fyi Cognitive Profiler"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              {isArabic ? "الملف النفسي والنمط الإدراكي للتلميذ" : "Student Psychological & Learning Profile"}
            </h1>
            <p className="mt-1 text-sm text-purple-200/80 max-w-3xl">
              {isArabic
                ? "تحديد الأنماط السلوكية والشخصية ومقاييس Big Five لمساعدة الأساتذة في تكييف خطط التدريس وفق طبيعة تفكير كل متعلم."
                : "Personality assessment mapping learning tendencies, Big Five traits, and custom pedagogical interventions."}
            </p>
          </div>
        </div>
      </div>

      {/* Input / Student Observation Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">{isArabic ? "بيانات وملاحظات التلميذ" : "Observed Student Traits"}</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{isArabic ? "اسم التلميذ" : "Student Name"}</label>
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">{isArabic ? "السلوكيات والملاحظات البيداغوجية" : "Behaviors"}</label>
            <div className="space-y-1.5 mb-3">
              {behaviors.map((b, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs text-slate-700 border border-slate-100">
                  <span>{b}</span>
                  <button
                    onClick={() => setBehaviors(behaviors.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-500 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddBehavior} className="flex gap-1.5">
              <input
                value={newBehavior}
                onChange={(e) => setNewBehavior(e.target.value)}
                placeholder={isArabic ? "أضف ملاحظة سلوكية جديدة..." : "Add observed behavior..."}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
              />
              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700"
              >
                +
              </button>
            </form>
          </div>
        </div>

        {/* Profile Output */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          {personalityQuery.isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="mr-3 text-sm text-slate-600">{isArabic ? "جاري تحليل الشخصية الإدراكية..." : "Analyzing personality profile..."}</span>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Archetype Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">{profile.mbtiType}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{profile.mbtiTitleAr}</h3>
                  <p className="text-xs text-slate-500">{profile.mbtiTitleEn}</p>
                </div>

                <div className="rounded-xl bg-purple-50 px-4 py-2 text-center border border-purple-100">
                  <span className="text-[10px] text-purple-600 font-bold block">{isArabic ? "نمط التعلم المفضل" : "Learning Style"}</span>
                  <span className="text-xs font-bold text-purple-900">{profile.learningStyle?.primaryAr || profile.learningStyle?.primary}</span>
                </div>
              </div>

              {/* Big Five Dimensions */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">{isArabic ? "أبعاد الشخصية الخمسة (Big Five)" : "Big Five Dimensions"}</h4>
                <div className="space-y-2.5">
                  {Object.entries(profile.bigFive).map(([trait, val]) => (
                    <div key={trait}>
                      <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-slate-600 capitalize">{trait}</span>
                        <span className="text-slate-900">{val}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Pedagogical Guidance */}
              <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    <span>{isArabic ? "نقاط القوة الدراسية" : "Key Strengths"}</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {profile.strengthsAr.map((s: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-purple-600" />
                    <span>{isArabic ? "توجيهات بيداغوجية للأستاذ" : "Teaching Strategies"}</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {profile.pedagogicalAdviceAr?.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
