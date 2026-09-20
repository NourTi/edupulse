import React, { useState, useEffect } from "react";
import {
  BookOpen,
  HelpCircle,
  ClipboardCheck,
  Layers,
  Lightbulb,
  FileCheck2,
  FolderArchive,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { LessonNotesScreen } from "./LessonNotesScreen";
import { QuizScreen } from "./QuizScreen";
import { RubricScreen } from "./RubricScreen";
import { SupportSheetsScreen } from "./SupportSheetsScreen";
import { SummaryFlashcardsScreen } from "./SummaryFlashcardsScreen";
import { HomeworkScreen } from "./HomeworkScreen";
import { ContentLibraryScreen } from "./ContentLibraryScreen";
import { DocumentImporter } from '@/components/teacher/DocumentImporter';

export default function TeacherResources() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Import Documents</h1>
      <p className="text-gray-600 mb-6">Paste a Scribd URL to download books, papers, or articles.</p>
      <DocumentImporter />
    </div>
  );
}
interface TeacherStudioHubProps {
  isArabic?: boolean;
}

export type TeacherStudioScreen =
  | "lesson_notes"
  | "quiz"
  | "rubric"
  | "support_sheets"
  | "summary_flashcards"
  | "homework"
  | "library";

export function TeacherStudioHub({ isArabic = true }: TeacherStudioHubProps) {
  const [activeScreen, setActiveScreen] = useState<TeacherStudioScreen>("lesson_notes");

  // Context memory state
  const [defaultSubject, setDefaultSubject] = useState("الرياضيات");
  const [defaultGrade, setDefaultGrade] = useState("3 ثانوي");
  const [topSubjects, setTopSubjects] = useState<string[]>([]);
  const [topGrades, setTopGrades] = useState<string[]>([]);

  // Fetch curriculum memory from server on mount
  useEffect(() => {
    fetch("/api/teacher-generators/context-memory")
      .then((res) => res.json())
      .then((data) => {
        if (data.defaultSubject) setDefaultSubject(data.defaultSubject);
        if (data.defaultGrade) setDefaultGrade(data.defaultGrade);
        if (data.topSubjects) setTopSubjects(data.topSubjects);
        if (data.topGrades) setTopGrades(data.topGrades);
      })
      .catch((err) => console.error("Curriculum memory fetch error:", err));
  }, []);

  const handleCurriculumUpdate = (subj: string, grade: string) => {
    setDefaultSubject(subj);
    setDefaultGrade(grade);
    if (!topSubjects.includes(subj)) setTopSubjects([subj, ...topSubjects].slice(0, 5));
    if (!topGrades.includes(grade)) setTopGrades([grade, ...topGrades].slice(0, 4));

    // Persist to server
    fetch("/api/teacher-generators/context-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: subj, gradeLevel: grade }),
    }).catch(console.error);
  };

  const SCREENS = [
    {
      id: "lesson_notes",
      labelAr: "مذكرات الدروس (10 أقسام)",
      labelEn: "Lesson Notes (10 Sections)",
      icon: BookOpen,
      accent: "from-cyan-500 to-blue-600",
      pillColor: "border-cyan-400/40 text-cyan-300",
    },
    {
      id: "quiz",
      labelAr: "أسئلة QCM",
      labelEn: "QCM Quiz",
      icon: HelpCircle,
      accent: "from-blue-600 to-indigo-600",
      pillColor: "border-blue-400/40 text-blue-300",
    },
    {
      id: "rubric",
      labelAr: "سلالم التقييم (Rubrics)",
      labelEn: "Rubrics",
      icon: ClipboardCheck,
      accent: "from-indigo-600 to-purple-600",
      pillColor: "border-indigo-400/40 text-indigo-300",
    },
    {
      id: "support_sheets",
      labelAr: "أوراق الدعم (3 مستويات)",
      labelEn: "3-Tier Support Sheets",
      icon: Layers,
      accent: "from-emerald-600 to-teal-600",
      pillColor: "border-emerald-400/40 text-emerald-300",
    },
    {
      id: "summary_flashcards",
      labelAr: "الملخص والبطاقات",
      labelEn: "Summary & Flashcards",
      icon: Lightbulb,
      accent: "from-purple-600 to-pink-600",
      pillColor: "border-purple-400/40 text-purple-300",
    },
    {
      id: "homework",
      labelAr: "الواجب المنزلي (5 أقسام)",
      labelEn: "Homework (5 Sections)",
      icon: FileCheck2,
      accent: "from-pink-600 to-rose-600",
      pillColor: "border-pink-400/40 text-pink-300",
    },
    {
      id: "library",
      labelAr: "المكتبة والذاكرة",
      labelEn: "Content Library",
      icon: FolderArchive,
      accent: "from-amber-500 to-orange-600",
      pillColor: "border-amber-400/40 text-amber-300",
    },
  ];

  return (
    <div className="min-h-screen py-4 sm:py-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
        {/* Navigation Bar between the dedicated screens */}
        <header className="rounded-3xl border border-white/10 bg-slate-950/70 p-3 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {isArabic ? "منصة المعلم الذكية لتوليد المحتوى" : "Teacher Content Studio"}
                  </h2>
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                    Gemini Pro 2.5
                  </span>
                </div>
                <p className="text-[11px] text-white/50">
                  {isArabic
                    ? "توليد بيداغوجي احترافي، ذاكرة سياقية ذكية، وتصدير مباشر لـ Word و PDF"
                    : "Automated pedagogical generation, curriculum memory, and instant exports"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{isArabic ? "شاشات مستقلة ومركزة" : "Focused single-action screens"}</span>
            </div>
          </div>

          {/* Screen Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {SCREENS.map((s) => {
              const isActive = activeScreen === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveScreen(s.id as TeacherStudioScreen)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${s.accent} text-white shadow-lg shadow-black/40 scale-[1.02]`
                      : "bg-white/[0.03] text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{isArabic ? s.labelAr : s.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* Dedicated Screen Content */}
        <main className="transition-all duration-300">
          {activeScreen === "lesson_notes" && (
            <LessonNotesScreen
              isArabic={isArabic}
              defaultSubject={defaultSubject}
              defaultGrade={defaultGrade}
              topSubjects={topSubjects}
              topGrades={topGrades}
              onCurriculumUpdate={handleCurriculumUpdate}
            />
          )}

          {activeScreen === "quiz" && (
            <QuizScreen
              isArabic={isArabic}
              defaultSubject={defaultSubject}
              defaultGrade={defaultGrade}
              topSubjects={topSubjects}
              topGrades={topGrades}
              onCurriculumUpdate={handleCurriculumUpdate}
            />
          )}

          {activeScreen === "rubric" && (
            <RubricScreen
              isArabic={isArabic}
              defaultSubject={defaultSubject}
              defaultGrade={defaultGrade}
              topSubjects={topSubjects}
              topGrades={topGrades}
              onCurriculumUpdate={handleCurriculumUpdate}
            />
          )}

          {activeScreen === "support_sheets" && (
            <SupportSheetsScreen
              isArabic={isArabic}
              defaultSubject={defaultSubject}
              defaultGrade={defaultGrade}
              topSubjects={topSubjects}
              topGrades={topGrades}
              onCurriculumUpdate={handleCurriculumUpdate}
            />
          )}

          {activeScreen === "summary_flashcards" && (
            <SummaryFlashcardsScreen
              isArabic={isArabic}
              defaultSubject={defaultSubject}
              defaultGrade={defaultGrade}
              topSubjects={topSubjects}
              topGrades={topGrades}
              onCurriculumUpdate={handleCurriculumUpdate}
            />
          )}

          {activeScreen === "homework" && (
            <HomeworkScreen
              isArabic={isArabic}
              defaultSubject={defaultSubject}
              defaultGrade={defaultGrade}
              topSubjects={topSubjects}
              topGrades={topGrades}
              onCurriculumUpdate={handleCurriculumUpdate}
            />
          )}

          {activeScreen === "library" && (
            <ContentLibraryScreen isArabic={isArabic} />
          )}
        </main>
      </div>
    </div>
  );
}
