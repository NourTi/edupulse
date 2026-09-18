import React from "react";
import { Sparkles, Bookmark, ArrowUpRight } from "lucide-react";

interface CurriculumMemoryBarProps {
  currentSubject: string;
  currentGrade: string;
  topSubjects: string[];
  topGrades: string[];
  onSelectSubject: (s: string) => void;
  onSelectGrade: (g: string) => void;
  isArabic?: boolean;
}

export function CurriculumMemoryBar({
  currentSubject,
  currentGrade,
  topSubjects,
  topGrades,
  onSelectSubject,
  onSelectGrade,
  isArabic = true,
}: CurriculumMemoryBarProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-cyan-200">
          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
          <span className="font-semibold tracking-wide">
            {isArabic ? "ذاكرة السياق التربوي (Curriculum Memory):" : "Curriculum Context Memory:"}
          </span>
          <span className="text-white/60">
            {isArabic ? "تفضيلاتك الذكية المعتمدة تلقائياً" : "Auto-detected teaching defaults"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-cyan-500/20 px-2.5 py-1 text-cyan-200 font-medium border border-cyan-400/30">
            {currentSubject || (isArabic ? "الرياضيات" : "Mathematics")}
          </span>
          <span className="text-white/30">&bull;</span>
          <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-amber-200 font-medium border border-amber-400/30">
            {currentGrade || (isArabic ? "3 ثانوي" : "3rd Secondary")}
          </span>
        </div>
      </div>

      {/* Quick Switch Chips */}
      {(topSubjects.length > 0 || topGrades.length > 0) && (
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-white/40 text-[11px]">
            {isArabic ? "التبديل السريع للمواد الشائعة:" : "Frequent subjects:"}
          </span>
          {topSubjects.slice(0, 5).map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => onSelectSubject(subj)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${
                currentSubject === subj
                  ? "bg-cyan-500 text-white font-medium shadow-sm"
                  : "bg-white/5 text-white/70 hover:bg-white/15 hover:text-white border border-white/10"
              }`}
            >
              {subj}
            </button>
          ))}

          <span className="mx-1 text-white/20">|</span>

          <span className="text-white/40 text-[11px]">
            {isArabic ? "المستويات الأكثر تدريساً:" : "Frequent grades:"}
          </span>
          {topGrades.slice(0, 4).map((gr) => (
            <button
              key={gr}
              type="button"
              onClick={() => onSelectGrade(gr)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${
                currentGrade === gr
                  ? "bg-amber-500 text-slate-900 font-semibold shadow-sm"
                  : "bg-white/5 text-white/70 hover:bg-white/15 hover:text-white border border-white/10"
              }`}
            >
              {gr}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
