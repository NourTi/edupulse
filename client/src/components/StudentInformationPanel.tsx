import { useState } from "react";
import { AddStudentModal } from "./AddStudentModal";
import { Download, Filter, MoreHorizontal, Plus, Search, UsersRound } from "lucide-react";

type StudentRecord = { id: string; name: string; nameAr: string; grade: string; guardian: string; phone: string; level: string; attendance: number; subjects: string[]; status: string; avatarUrl?: string };

type Props = { students: StudentRecord[]; onAdd: () => void; isArabic: boolean };

const statusLabel = (status: string, isArabic: boolean) => isArabic ? (status === "Review" ? "مراجعة" : status === "New" ? "جديد" : "نشط") : (status === "Review" ? "Review" : status === "New" ? "New" : "Active");

export function StudentInformationPanel({ students, isArabic }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="-mx-5 -my-5 min-h-[calc(100vh-7rem)] bg-[#f4f7fc] px-4 py-5 text-slate-900 sm:px-6 lg:-mx-8 lg:-my-7 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-[1480px]">
        <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(35,49,82,0.06)] lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{isArabic ? "قاعدة المؤسسة" : "School database"}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{isArabic ? "سجل الطلاب" : "Students"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "هوية الطالب، ولي الأمر، التسجيل، والتقدم في سجل واحد." : "Learner identity, guardian, registration, and progress in one record."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              <Download className="h-4 w-4" />{isArabic ? "تصدير" : "Export"}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />{isArabic ? "إضافة طالب" : "Add student"}
            </button>
          </div>
        </header>
        
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(35,49,82,0.06)]">
          <div className="flex flex-wrap items-center gap-5 border-b border-slate-100 px-5 pt-4 text-xs font-bold text-slate-400">
            <button className="border-b-2 border-indigo-500 pb-4 text-indigo-600">{isArabic ? `الطلاب ${students.length}` : `Students ${students.length}`}</button>
            <button className="pb-4 hover:text-slate-700">{isArabic ? "المعلمون" : "Teachers"}</button>
            <button className="pb-4 hover:text-slate-700">{isArabic ? "الموظفون" : "Staff"}</button>
            <button className="pb-4 hover:text-slate-700">{isArabic ? "جهات الاتصال" : "Related contacts"}</button>
            <button className="pb-4 hover:text-slate-700">{isArabic ? "المرشحون" : "Prospects"}</button>
          </div>
          
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-400 sm:w-64">
              <Search className="h-4 w-4 shrink-0" /><span>{isArabic ? "البحث في الطلاب" : "Search students"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500"><span>{isArabic ? "الصف: الكل" : "Class: All"}</span></button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500"><span>{isArabic ? "الحالة: نشط" : "Status: Active"}</span></button>
              <button className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500"><Filter className="h-4 w-4" /></button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-right text-xs">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">{isArabic ? "الطالب" : "Student"}</th>
                  <th className="px-4 py-4">{isArabic ? "الهاتف" : "Phone"}</th>
                  <th className="px-4 py-4">{isArabic ? "ولي الأمر" : "Guardian"}</th>
                  <th className="px-4 py-4">{isArabic ? "التسجيل" : "Registration"}</th>
                  <th className="px-4 py-4">{isArabic ? "المستوى" : "Level"}</th>
                  <th className="px-4 py-4">{isArabic ? "الحضور" : "Attendance"}</th>
                  <th className="px-4 py-4">{isArabic ? "الصف" : "Class"}</th>
                  <th className="px-5 py-4">{isArabic ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-4" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-t border-slate-100 transition hover:bg-indigo-50/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar Logic: Shows image if available, otherwise shows initials */}
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 font-black text-white">{student.nameAr.slice(0, 1)}</span>
                        )}
                        <div>
                          <p className="font-black text-slate-800">{isArabic ? student.nameAr : student.name}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{student.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-indigo-600">{student.phone}</td>
                    <td className="px-4 py-4 text-slate-600">{student.guardian}</td>
                    <td className="px-4 py-4 text-slate-500">—</td>
                    <td className="px-4 py-4"><span className="rounded-full bg-violet-50 px-2.5 py-1 font-black text-violet-700">{student.level}</span></td>
                    <td className="px-4 py-4 font-black text-slate-700">{student.attendance}%</td>
                    <td className="px-4 py-4 text-slate-600">{student.grade}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 font-black ${student.status === "Review" ? "bg-rose-50 text-rose-600" : student.status === "New" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{statusLabel(student.status, isArabic)}</span></td>
                    <td className="px-4 py-4"><button className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={isArabic ? "خيارات الطالب" : "Student options"}><MoreHorizontal className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {students.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-center text-slate-400">
              <UsersRound className="h-8 w-8" />
              <p className="text-sm font-semibold">{isArabic ? "لا يوجد طلاب في السجل بعد." : "No learners are in the record yet."}</p>
            </div>
          )}
        </section>
      </div>
      
      {/* This is the modal that will pop up when you click "Add Student" */}
      <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isArabic={isArabic} />
      
    </div>
  );
}
