import React, { useState } from "react";
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Key,
  Copy,
  Check,
  Calendar,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
  BarChart3,
  Users,
  Cpu,
  Clock,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

interface CloneDashboardViewProps {
  isArabic?: boolean;
  onOpenPhoneModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

const mockChartData = [
  { time: "00:00", requests: 120, successful: 118, errors: 2 },
  { time: "04:00", requests: 80, successful: 79, errors: 1 },
  { time: "08:00", requests: 450, successful: 442, errors: 8 },
  { time: "12:00", requests: 920, successful: 910, errors: 10 },
  { time: "16:00", requests: 1150, successful: 1135, errors: 15 },
  { time: "20:00", requests: 780, successful: 772, errors: 8 },
  { time: "23:59", requests: 340, successful: 337, errors: 3 },
];

export function CloneDashboardView({
  isArabic = true,
  onOpenPhoneModal,
  onNavigateTab,
}: CloneDashboardViewProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [copiedKey, setCopiedKey] = useState(false);

  const defaultApiKey = "num_live_GtX4eOYWwoE1uoEa0c60IrKASHVraweeeIpOHRsu";

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    toast.success(isArabic ? "تم نسخ مفتاح API بنجاح" : "API Key copied to clipboard");
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top Welcome Header matching clone dashboard.PNG */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {isArabic ? "الخادم قيد التشغيل المباشر" : "System Live Production"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isArabic ? "لوحة التحكم الرئيسية والمؤشرات" : "Dashboard & System Metrics"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isArabic
              ? "متابعة استدعاءات الـ APIs، مؤشرات الأداء، وتكاملات NumLookup و Archive و APITemplate"
              : "Monitor real-time API requests, system throughput, and verified service endpoints."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPhoneModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isArabic ? "التحقق بالهاتف (NumLookup)" : "Phone Verification"}</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards matching the exact layout of clone dashboard.PNG */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{isArabic ? "إجمالي الاستدعاءات" : "Total Requests"}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">3,840</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 ml-0.5" />
              +14.2%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{isArabic ? "خلال آخر 24 ساعة" : "vs yesterday"}</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{isArabic ? "الاستدعاءات الناجحة" : "Successful"}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">3,793</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600">98.8%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{isArabic ? "معدل استجابة 200 OK" : "Success rate"}</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{isArabic ? "نسبة الأخطاء" : "Error Rate"}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">1.2%</span>
            <span className="inline-flex items-center text-xs font-bold text-amber-600">-0.4%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{isArabic ? "ضمن الحدود الطبيعية" : "Within normal threshold"}</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{isArabic ? "الرصيد المتبقي (Credits)" : "Remaining Credits"}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">246,160</span>
            <span className="text-xs font-bold text-purple-600">/ 250k</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{isArabic ? "خطة الإنتاج غير المحدودة" : "Pro Tier Active"}</p>
        </div>
      </div>

      {/* Interactive Time-Series Chart matching clone dashboard.PNG */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {isArabic ? "مخطط استدعاءات الـ APIs والنشاط الزمني" : "API Requests Over Time"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isArabic ? "حجم الزيارات واستجابات الخوادم المتزامنة" : "Real-time query volume and server responses"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Legend pills */}
            <div className="flex items-center gap-3 text-xs ml-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span>{isArabic ? "إجمالي الطلبات" : "Requests"}</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>{isArabic ? "ناجح" : "Success"}</span>
              </span>
            </div>

            {/* Time Filter Buttons */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(["24h", "7d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    timeRange === r ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSucc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="requests" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReq)" />
              <Area type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSucc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns Underneath matching clone dashboard.PNG */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Live API Key Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Key className="h-4 w-4" />
                </div>
                <h4 className="text-base font-bold text-slate-900">{isArabic ? "مفتاح الربط الحي (Live API Key)" : "Live API Key"}</h4>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {isArabic
                ? "المفتاح المعتمد لربط خدمات التحقق NumLookupAPI ومكتبة الكتب والأبحاث مع التطبيق."
                : "Your secret API key for authenticating requests and accessing verified educational services."}
            </p>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="font-mono text-xs text-slate-800 font-semibold truncate max-w-[280px]">
                {defaultApiKey}
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
              >
                {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey ? (isArabic ? "تم النسخ" : "Copied") : isArabic ? "نسخ" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>{isArabic ? "تم الإنشاء: 2026-05-12" : "Created: May 12, 2026"}</span>
            <button
              onClick={onOpenPhoneModal}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              {isArabic ? "إدارة الصلاحيات" : "Manage"}
            </button>
          </div>
        </div>

        {/* Right Card: Quick Start / Onboarding Checklist */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{isArabic ? "دليل الإعداد السريع للأدوات الجديدة" : "Quick Start Checklist"}</span>
              </h4>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                5 / 5 {isArabic ? "مكتملة" : "Completed"}
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "cambridge_lexicon",
                  title: isArabic ? "قاموس كامبريدج وكاشط الصوتيات IPA (Apify)" : "Cambridge Dictionary & IPA Scraper",
                  desc: isArabic ? "صوتيات بريطانية وأمريكية ومستويات CEFR لأساتذة الإنجليزية" : "Live Apify scraper, UK/US audio & CEFR",
                  done: true,
                },
                {
                  id: "studivexa",
                  title: isArabic ? "منصة Studivexa للطلبة (الذكاء الاصطناعي وبومودورو)" : "Studivexa Student Suite",
                  desc: isArabic ? "مفعلة بالكامل مع حاسبة البكالوريا والبطاقات التفاعلية" : "AI study buddy, timer & flashcards active",
                  done: true,
                },
                {
                  id: "book_downloader",
                  title: isArabic ? "تنزيل الكتب والأوراق ومكتبة Archive.org" : "Direct Book Downloader & Archive.org",
                  desc: isArabic ? "تنزيل مباشر للكتب والأبحاث بدون وسيط" : "Direct download proxy ready",
                  done: true,
                },
                {
                  id: "template_studio",
                  title: isArabic ? "استوديو APITemplate.io وحكم Quoterism" : "APITemplate Studio & Quoterism",
                  desc: isArabic ? "توليد مذكرات الدروس وامتحانات BAC الرسمية" : "Canva-like print rendering engine",
                  done: true,
                },
                {
                  id: "scorecard_guidance",
                  title: isArabic ? "توجيه الثانوي وقاعدة College Scorecard" : "College Scorecard Secondary Guidance",
                  desc: isArabic ? "متاحة لأساتذة الثانوي ومستشاري التوجيه" : "Higher-ed career analytics active",
                  done: true,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigateTab?.(item.id)}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-200 hover:bg-blue-50/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <span className="text-[11px] text-slate-400">
              {isArabic ? "جميع البوابات تعمل بأعلى موثوقية وبدون انقطاع" : "All sovereign educational modules operating normally"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
