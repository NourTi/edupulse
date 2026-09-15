import { useState } from "react";
import { Loader2, ShieldAlert, UserRound, Sparkles, BookOpen, GraduationCap, Calendar, Compass } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { StudentRadarProfile, type StudentRadarData, type StudentAssessmentData } from "./StudentRadarProfile";

interface Props {
  isArabic: boolean;
  fallbackStudent?: {
    id?: string;
    nameAr: string;
    grade: string;
    level: string;
    attendance: number;
    subjects: string[];
    guardian?: string;
  };
  assessment?: StudentAssessmentData | null;
}

export function StudentPortalPanel({ isArabic, fallbackStudent, assessment }: Props) {
  const query = trpc.records.myStudentRecord.useQuery(undefined, { retry: false });

  // Use query data if linked, otherwise use the rich active local student record
  const studentData: StudentRadarData = query.data
    ? {
        id: query.data.id,
        name: query.data.name,
        nameAr: query.data.nameAr || query.data.name,
        grade: query.data.grade,
        guardian: (query.data as any).guardian || "الولي الشرعي",
        level: "B1",
        attendance: 94,
        subjects: ["arabic", "english", "math", "physics"],
        status: query.data.status,
      }
    : {
        id: fallbackStudent?.id || "STU-2026-DZ",
        name: "Yassine Mansouri",
        nameAr: fallbackStudent?.nameAr || "ياسين المنصوري",
        grade: fallbackStudent?.grade || "3 ثانوي - علوم تجريبية (BAC)",
        guardian: fallbackStudent?.guardian || "الطيب المنصوري",
        level: fallbackStudent?.level || "B1",
        attendance: fallbackStudent?.attendance || 94,
        subjects: fallbackStudent?.subjects || ["اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "العلوم الفيزيائية"],
        status: "Active",
      };

  const defaultAssessment: StudentAssessmentData = assessment || {
    studentId: studentData.id,
    date: "10 مارس 2026",
    level: studentData.level,
    speaking: 86,
    listening: 90,
    reading: 88,
    writing: 84,
    note: isArabic
      ? "مستوى استيعاب ممتاز في الشعبة العلمية مع تطور ملحوظ في اللغة الإنجليزية التقنية والمصطلحات العلمية."
      : "Excellent cognitive comprehension with marked progress in scientific and academic terminology.",
  };

  return (
    <div className="space-y-8" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 p-8 text-white shadow-lg shadow-indigo-500/15">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <Compass className="h-3.5 w-3.5 text-cyan-300" />
              {isArabic ? "بوابة التلميذ الشخصية · مساحة المتابعة" : "Student Personal Portal & Performance Hub"}
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {isArabic ? `مرحباً بك، ${studentData.nameAr}` : `Welcome back, ${studentData.nameAr}`}
            </h1>
            <p className="mt-2 text-sm text-indigo-100/80">
              {isArabic
                ? "مخططك الإدراكي الشامل، تقدم الكفاءات ومعدلات الحضور المعتمدة في المؤسسة"
                : "Your multidimensional cognitive radar, curriculum progress, and certified attendance"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md border border-white/15 text-center">
              <p className="text-[11px] font-bold text-cyan-200">{isArabic ? "مستوى CEFR" : "CEFR Level"}</p>
              <p className="text-2xl font-black">{studentData.level}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md border border-white/15 text-center">
              <p className="text-[11px] font-bold text-emerald-200">{isArabic ? "نسبة الحضور" : "Attendance"}</p>
              <p className="text-2xl font-black">{studentData.attendance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature: Interactive Radar Spider Chart */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span>{isArabic ? "البصمة الإدراكية ومؤشرات الأداء (Spider / Radar Chart)" : "Cognitive Radar & KPI Profile"}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isArabic
                ? "رسم بياني تفاعلي يعرض التوازن بين الأداء الأكاديمي، الحضور، والمشاركة المعرفية"
                : "Interactive multidimensional radar comparing student metrics with class standards"}
            </p>
          </div>
        </div>

        <StudentRadarProfile
          student={studentData}
          assessment={defaultAssessment}
          canEditKpi={false}
          language={isArabic ? "ar" : "en"}
        />
      </section>

      {/* Curricular & Subjects Snapshot */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          <span>{isArabic ? "المواد المسجلة في الخطة التعليمية" : "Enrolled Curriculum Subjects"}</span>
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {studentData.subjects.map((sub, idx) => (
            <div
              key={sub}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
            >
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${idx % 2 === 0 ? "bg-indigo-500" : "bg-cyan-500"}`} />
                <span className="text-sm font-black text-slate-800">{sub}</span>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {isArabic ? "معتمد" : "Enrolled"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
