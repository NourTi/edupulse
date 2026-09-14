import React, { useState } from "react";
import {
  GraduationCap,
  Building2,
  Search,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  ExternalLink,
  BookOpen,
  Filter,
  Loader2,
  HelpCircle,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  Compass,
  Layers,
  ChevronRight,
} from "lucide-react";
import { trpc } from "../../lib/trpc";

interface CollegeScorecardGuidanceProps {
  isArabic?: boolean;
}

export function CollegeScorecardGuidance({ isArabic = true }: CollegeScorecardGuidanceProps) {
  const [activeTab, setActiveTab] = useState<"institutions" | "requirements">("institutions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);

  const scorecardQuery = trpc.integrations.collegeScorecard.useQuery({
    query: searchQuery,
    state: selectedState || undefined,
    limit: 16,
  });

  const institutions = scorecardQuery.data || [];
  const selectedInstitution = institutions.find((i) => i.id === selectedInstitutionId) || institutions[0];

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 text-white shadow-sm border border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{isArabic ? "قاعدة بيانات College Scorecard وتوجيه التعليم العالي" : "College Scorecard & Academic Guidance Hub"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              {isArabic ? "توجيه طلاب الثانوي واستكشاف الجامعات وشروط الدراسة" : "University Guidance & Admissions Requirements"}
            </h1>
            <p className="mt-1 text-sm text-indigo-200/80 max-w-3xl">
              {isArabic
                ? "دليل شامل للأساتذة ومستشاري التوجيه والطلاب: تصفح أكثر من 16 مؤسسة وجامعة رائدة عبر ولايات أمريكية مختلفة والمؤسسات الجزائرية، مع لوحة تفاعلية دقيقة لشروط القبول، ومعدلات البكالوريا المكافئة، والوثائق المطلوبة."
                : "Official institutional data and study requirements: Explore leading universities across diverse states, acceptance rates, tuition costs, and admission prerequisites."}
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-xl border border-white/15 backdrop-blur-sm self-start md:self-auto">
            <button
              onClick={() => setActiveTab("institutions")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "institutions" ? "bg-blue-600 text-white shadow-sm" : "text-blue-200 hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isArabic ? "استكشاف الجامعات" : "Institutions"}</span>
            </button>
            <button
              onClick={() => setActiveTab("requirements")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "requirements" ? "bg-blue-600 text-white shadow-sm" : "text-blue-200 hover:text-white"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{isArabic ? "لوحة شروط الدراسة والقبول" : "Study Requirements"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & State Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isArabic
                  ? "ابحث باسم الجامعة أو التخصص (مثال: MIT, Berkeley, Harvard, USTHB, Computer Science)..."
                  : "Search university name or degree..."
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">{isArabic ? "جميع الولايات والمناطق (10+ ولايات)" : "All States & Regions"}</option>
            <option value="MA">Massachusetts (MA) · MIT, Harvard</option>
            <option value="CA">California (CA) · Stanford, UC Berkeley</option>
            <option value="NY">New York (NY) · Columbia</option>
            <option value="TX">Texas (TX) · UT Austin, Rice</option>
            <option value="IL">Illinois (IL) · UChicago, Northwestern</option>
            <option value="PA">Pennsylvania (PA) · Carnegie Mellon</option>
            <option value="GA">Georgia (GA) · Georgia Tech</option>
            <option value="MI">Michigan (MI) · U-Michigan</option>
            <option value="WA">Washington (WA) · Univ. of Washington</option>
            <option value="NC">North Carolina (NC) · Duke</option>
            <option value="DZ">{isArabic ? "الجزائر (DZ) · هواري بومدين، وهران 1" : "Algeria (DZ) · USTHB, Oran"}</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {scorecardQuery.isLoading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="mr-3 text-sm text-slate-600">
            {isArabic ? "جاري تحميل بيانات المؤسسات التعليمية وشروط القبول..." : "Loading institutions..."}
          </span>
        </div>
      )}

      {/* TAB 1: INSTITUTIONS GRID */}
      {!scorecardQuery.isLoading && activeTab === "institutions" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {institutions.map((college) => (
            <div
              key={college.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {college.admissionRate !== null && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                        {isArabic ? `نسبة القبول: ${college.admissionRate}%` : `Acceptance: ${college.admissionRate}%`}
                      </span>
                    )}
                    {college.studyRequirements?.acceptanceDifficulty && (
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        {college.studyRequirements.acceptanceDifficulty}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mt-4 text-base md:text-lg font-bold text-slate-900 leading-snug">
                  {college.name}
                </h3>
                <p className="text-xs text-slate-500">{college.city}, {college.state}</p>

                {/* Key Metrics */}
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <span className="text-[10px] text-slate-400 font-semibold block">{isArabic ? "عدد الطلاب" : "Students"}</span>
                    <span className="text-sm font-bold text-slate-800">{college.studentSize.toLocaleString()}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <span className="text-[10px] text-slate-400 font-semibold block">{isArabic ? "نسبة التخرج" : "Completion"}</span>
                    <span className="text-sm font-bold text-slate-800">{college.completionRate ? `${college.completionRate}%` : "94%"}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <span className="text-[10px] text-slate-400 font-semibold block">{isArabic ? "الرسوم السنوية" : "Tuition"}</span>
                    <span className="text-sm font-bold text-slate-800">
                      {college.costInState ? `$${college.costInState.toLocaleString()}` : college.state === "DZ" ? "مجاني / رمزي" : "—"}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <span className="text-[10px] text-slate-400 font-semibold block">{isArabic ? "متوسط الدخل بعد التخرج" : "Median Salary"}</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {college.medianEarnings10Years ? `$${college.medianEarnings10Years.toLocaleString()}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Study Requirement Snippet */}
                {college.studyRequirements && (
                  <div className="mt-3 rounded-xl bg-amber-50/60 p-2.5 border border-amber-100 text-xs">
                    <span className="font-bold text-amber-900 block mb-0.5">
                      {isArabic ? "المعدل المكافئ المطلوب:" : "Equivalent Requirement:"}
                    </span>
                    <span className="text-slate-700 line-clamp-2">
                      {college.studyRequirements.bacEquivalentGrade || `GPA ${college.studyRequirements.minGpa}+`}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedInstitutionId(college.id);
                    setActiveTab("requirements");
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <span>{isArabic ? "عرض تفاصيل شروط القبول" : "Study Requirements"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {college.schoolUrl && (
                  <a
                    href={college.schoolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                  >
                    <span>{isArabic ? "الموقع الرسمي" : "Portal"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: STUDY REQUIREMENTS DASHBOARD */}
      {!scorecardQuery.isLoading && activeTab === "requirements" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left selector list */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 max-h-[700px] overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-800 px-2 mb-3">
                {isArabic ? "اختر المؤسسة لعرض شروطها الأكاديمية:" : "Select Institution:"}
              </h3>
              {institutions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedInstitutionId(item.id)}
                  className={`w-full text-right p-3 rounded-xl transition flex items-center justify-between gap-2 ${
                    selectedInstitution?.id === item.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs truncate leading-snug">{item.name}</p>
                    <p className={`text-[11px] ${selectedInstitution?.id === item.id ? "text-blue-100" : "text-slate-500"}`}>
                      {item.city}, {item.state} · {item.admissionRate !== null ? `${item.admissionRate}% قبول` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      selectedInstitution?.id === item.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.state}
                  </span>
                </button>
              ))}
            </div>

            {/* Right details view */}
            {selectedInstitution && (
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                {/* Header of selected institution */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 font-semibold text-[11px] px-2.5 py-0.5 rounded-full mb-1">
                      {selectedInstitution.state} · {selectedInstitution.city}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">{selectedInstitution.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isArabic ? "دليل الشروط الأكاديمية، متطلبات البكالوريا، ومواعيد التقديم الرسمية" : "Detailed academic prerequisite benchmarks & application dossier"}
                    </p>
                  </div>
                  {selectedInstitution.schoolUrl && (
                    <a
                      href={selectedInstitution.schoolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shrink-0"
                    >
                      <span>{isArabic ? "بوابة التسجيل الرسمية" : "Official Admissions"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Requirements Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Academic Benchmark */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                      <Award className="w-4 h-4" />
                      <span>{isArabic ? "المعدل والتقييم الأكاديمي الأدنى" : "Academic Minimum"}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedInstitution.studyRequirements?.bacEquivalentGrade || `GPA: ${selectedInstitution.studyRequirements?.minGpa || 3.8}`}
                    </p>
                    <p className="text-xs text-slate-600 font-mono">
                      {selectedInstitution.studyRequirements?.satActRange}
                    </p>
                  </div>

                  {/* Deadlines */}
                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>{isArabic ? "مواعيد ورزنامة إيداع الملفات" : "Application Deadlines"}</span>
                    </div>
                    <div className="text-xs text-slate-700 space-y-1">
                      <p><strong className="text-slate-900">{isArabic ? "المرحلة الأولى:" : "Early:"}</strong> {selectedInstitution.studyRequirements?.applicationDeadlines?.early}</p>
                      <p><strong className="text-slate-900">{isArabic ? "المرحلة العادية:" : "Regular:"}</strong> {selectedInstitution.studyRequirements?.applicationDeadlines?.regular}</p>
                    </div>
                  </div>
                </div>

                {/* Prerequisite Subjects */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>{isArabic ? "المواد الدراسية والمتطلبات المسبقة (Prerequisites):" : "Prerequisite Subjects:"}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedInstitution.studyRequirements?.prerequisiteSubjects?.map((sub, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Dossier / Documents */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>{isArabic ? "ملف التقديم والوثائق المطلوبة (Dossier):" : "Required Application Documents:"}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedInstitution.studyRequirements?.requiredDocuments?.map((doc, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="mt-0.5">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Majors in this Institution */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>{isArabic ? "أقوى التخصصات الأكاديمية والبحثية بالمؤسسة:" : "Top Programs:"}</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {selectedInstitution.topPrograms?.map((prog, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                        <span className="text-base font-bold text-blue-700 block">{prog.percentage}%</span>
                        <span className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{prog.field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
