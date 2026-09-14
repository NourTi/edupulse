import React, { useState } from "react";
import {
  Binary,
  Calculator,
  Search,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sigma,
  Atom,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { trpc } from "../../lib/trpc";

interface WolframStemSolverProps {
  isArabic?: boolean;
}

export function WolframStemSolver({ isArabic = true }: WolframStemSolverProps) {
  const [queryInput, setQueryInput] = useState("integrate x * exp(x) dx");
  const [searchedQuery, setSearchedQuery] = useState("integrate x * exp(x) dx");

  const wolframQuery = trpc.integrations.wolframAlpha.useQuery(
    { query: searchedQuery },
    { enabled: Boolean(searchedQuery) }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setSearchedQuery(queryInput.trim());
  };

  const sampleQueries = [
    { label: "حساب تكامل بالدوال الأسية", q: "integrate x * e^x dx" },
    { label: "اشتقاق دالة كسرية ولوغاريتمية", q: "derivative of ln(x^2 + 1)" },
    { label: "سرعة الضوء وثوابت الفيزياء", q: "speed of light and planck constant" },
    { label: "حل معادلة تفاضلية من الدرجة الأولى", q: "solve y' + 2y = 4" },
  ];

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-orange-950 to-red-950 p-6 text-white shadow-sm border border-orange-900/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300 border border-orange-400/30">
              <Binary className="h-3.5 w-3.5" />
              <span>{isArabic ? "محرك Wolfram|Alpha الحسابي ومساعد STEM التوليدي" : "Wolfram|Alpha STEM Computational Engine"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              {isArabic ? "الحاسبة الرمزية وحل المسائل العلمية والرياضيات" : "Wolfram Computational Solver"}
            </h1>
            <p className="mt-1 text-sm text-orange-200/80 max-w-3xl">
              {isArabic
                ? "حل دقيق بالخطوات للمعادلات التفاضلية، التكاملات، مشتقات الدوال، قوانين الفيزياء الكهرومغناطيسية والنووية، والثوابت الكيميائية."
                : "Step-by-step mathematical reasoning, symbolic integration, physics constants, and scientific queries via Wolfram LLM API."}
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Sigma className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={isArabic ? "أدخل مسألة رياضية أو صيغة فيزيائية (مثال: integrate x^2 * sin(x) dx)..." : "Enter mathematical query or physics formula..."}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-3 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            type="submit"
            disabled={wolframQuery.isFetching || !queryInput.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50 transition shadow-md shadow-orange-600/30"
          >
            {wolframQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
            <span>{wolframQuery.isFetching ? (isArabic ? "جاري الحساب..." : "Computing...") : isArabic ? "احسب بالخطوات" : "Solve"}</span>
          </button>
        </form>

        {/* Quick Samples */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>{isArabic ? "أمثلة شائعة:" : "Common examples:"}</span>
          {sampleQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryInput(item.q);
                setSearchedQuery(item.q);
              }}
              className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {wolframQuery.isLoading ? (
        <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          <span className="mr-3 text-sm text-slate-600">{isArabic ? "جاري معالجة السؤال الحسابي عبر محرك Wolfram..." : "Computing with Wolfram Alpha Engine..."}</span>
        </div>
      ) : wolframQuery.data ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{isArabic ? "النتيجة الحسابية المؤكدة" : "Computational Output"}</span>
            <span className="text-xs text-slate-400 font-mono">{wolframQuery.data.query}</span>
          </div>

          <div className="rounded-xl bg-slate-900 p-5 text-white font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {wolframQuery.data.resultText}
          </div>

          {wolframQuery.data.steps && wolframQuery.data.steps.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">{isArabic ? "خطوات الحل والاستنتاج الرياضي:" : "Step-by-Step Derivation:"}</h4>
              <div className="space-y-2">
                {wolframQuery.data.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-800">
                    <span className="rounded-md bg-orange-100 px-2 py-0.5 font-bold text-orange-800 text-[11px]">{idx + 1}</span>
                    <span className="font-mono">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
