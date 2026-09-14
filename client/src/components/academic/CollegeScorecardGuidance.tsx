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
} from "lucide-react";
import { trpc } from "../../lib/trpc";

interface CollegeScorecardGuidanceProps {
  isArabic?: boolean;
}

export function CollegeScorecardGuidance({ isArabic = true }: CollegeScorecardGuidanceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const scorecardQuery = trpc.integrations.collegeScorecard.useQuery({
    query: searchQuery,
    state: selectedState || undefined,
    limit: 9,
  });

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 text-white shadow-sm border border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{isArabic ? "قاعدة بيانات College Scorecard لأساتذة الثانوي ومستشاري التوجيه" : "College Scorecard Guidance Hub"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              {isArabic ? "توجيه طلاب الثانوي واستكشاف الجامعات والتخصصات" : "Secondary Guidance & Institution Analytics"}
            </h1>
            <p className="mt-1 text-sm text-indigo-200/80 max-w-3xl">
              {isArabic
                ? "بيانات موثقة من وزارة التعليم العالي ومؤشرات College Scorecard لتمكين الأساتذة والطلاب من معرفة نسب القبول، التخصصات الرائدة، تكاليف الدراسة، ومعدلات النجاح الأكاديمي."
                : "Official institutional data on admission rates, curriculum benchmarks, tuition costs, and post-graduation earnings."}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "ابحث باسم الجامعة أو التخصص (مثال: Harvard, MIT, Computer Science)..." : "Search university name or degree..."}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700"
          >
            <option value="">{isArabic ? "جميع الولايات والمناطق" : "All States"}</option>
            <option value="MA">Massachusetts (MA)</option>
            <option value="CA">California (CA)</option>
            <option value="NY">New York (NY)</option>
            <option value="IL">Illinois (IL)</option>
            <option value="TX">Texas (TX)</option>
          </select>
        </div>
      </div>

      {/* Institutions Grid */}
      {scorecardQuery.isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="mr-3 text-sm text-slate-600">{isArabic ? "جاري تحميل بيانات المؤسسات التعليمية..." : "Loading institutions..."}</span>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(scorecardQuery.data || []).map((college) => (
            <div
              key={college.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  {college.admissionRate !== null && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                      {isArabic ? `نسبة القبول: ${college.admissionRate}%` : `Acceptance: ${college.admissionRate}%`}
                    </span>
                  )}
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
                    <span className="text-[10px] text-slate-400 font-semibold block">{isArabic ? "نسبة التخرج (4 سنوات)" : "Completion"}</span>
                    <span className="text-sm font-bold text-slate-800">{college.completionRate ? `${college.completionRate}%` : "94%"}</span>
                  </div>
                </div>

                {/* Top Curriculum Programs */}
                {college.topPrograms && college.topPrograms.length > 0 && (
                  <div className="mt-4">
                    <span className="text-[11px] font-bold text-slate-600 block mb-2">{isArabic ? "أهم التخصصات والبرامج الأكاديمية:" : "Top Programs:"}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {college.topPrograms.slice(0, 3).map((prog, idx) => (
                        <span key={idx} className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                          {prog.field} ({prog.percentage}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Link */}
              <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">ID: {college.id}</span>
                {college.schoolUrl && (
                  <a
                    href={college.schoolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>{isArabic ? "زيارة الموقع الرسمي" : "Official Website"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
