import { useState } from 'react'
import { Users, GraduationCap, Wallet, CalendarCheck, BookOpen, FileText, BarChart3, MessageSquare, FolderKanban, Library, ArrowUpRight } from 'lucide-react'

export default function Dashboard() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  
  const t = {
    ar: { 
      welcome: 'مرحباً بك في إدوبلس',
      overview: 'نظرة عامة على المؤسسة',
      students: 'الطلاب', teachers: 'المعلمون', finance: 'المالية', attendance: 'الحضور',
      admissions: 'قبولات', classes: 'الفصول', reports: 'التقارير', messages: 'الرسائل',
      library: 'المكتبة', evaluations: 'التقييمات', analytics: 'التحليلات', viewAll: 'عرض الكل'
    },
    en: { 
      welcome: 'Welcome to EduPulse',
      overview: 'Institution Overview',
      students: 'Students', teachers: 'Teachers', finance: 'Finance', attendance: 'Attendance',
      admissions: 'Admissions', classes: 'Classes', reports: 'Reports', messages: 'Messages',
      library: 'Library', evaluations: 'Evaluations', analytics: 'Analytics', viewAll: 'View All'
    }
  }[lang]

  const stats = [
    { title: t.students, value: '124', change: '+12%', color: 'bg-blue-50 text-blue-600', icon: Users },
    { title: t.teachers, value: '12', change: '+2%', color: 'bg-violet-50 text-violet-600', icon: GraduationCap },
    { title: t.finance, value: 'DZD 450k', change: '+8%', color: 'bg-green-50 text-green-600', icon: Wallet },
    { title: t.attendance, value: '94%', change: '-1%', color: 'bg-amber-50 text-amber-600', icon: CalendarCheck },
  ]

  const modules = [
    { title: t.students, icon: Users, color: 'hover:bg-blue-50 hover:text-blue-600' },
    { title: t.teachers, icon: GraduationCap, color: 'hover:bg-violet-50 hover:text-violet-600' },
    { title: t.classes, icon: BookOpen, color: 'hover:bg-cyan-50 hover:text-cyan-600' },
    { title: t.admissions, icon: FolderKanban, color: 'hover:bg-rose-50 hover:text-rose-600' },
    { title: t.evaluations, icon: FileText, color: 'hover:bg-amber-50 hover:text-amber-600' },
    { title: t.finance, icon: Wallet, color: 'hover:bg-green-50 hover:text-green-600' },
    { title: t.messages, icon: MessageSquare, color: 'hover:bg-indigo-50 hover:text-indigo-600' },
    { title: t.library, icon: Library, color: 'hover:bg-purple-50 hover:text-purple-600' },
    { title: t.reports, icon: BarChart3, color: 'hover:bg-slate-50 hover:text-slate-600' },
  ]

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="p-8 bg-gray-50 min-h-full text-slate-800 font-body">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">{t.welcome}</h1>
          <p className="text-sm text-slate-500">{t.overview}</p>
        </div>
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
      </div>

      {/* Top Stat Cards (AdminKit Style) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> {stat.change}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Object Navigation Grid */}
      <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.overview}</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {modules.map((module) => (
          <button 
            key={module.title} 
            className={`flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300 ${module.color}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 transition-colors">
              <module.icon className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">{module.title}</h3>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-400 opacity-0 transition-opacity hover:opacity-100">
              {t.viewAll} <ArrowUpRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}
