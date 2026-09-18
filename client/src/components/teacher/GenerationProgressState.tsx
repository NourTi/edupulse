import React, { useEffect, useState } from "react";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

interface GenerationProgressStateProps {
  steps: string[];
  active: boolean;
  isArabic?: boolean;
}

export function GenerationProgressState({
  steps,
  active,
  isArabic = true,
}: GenerationProgressStateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrentStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [active, steps]);

  if (!active) return null;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/70 via-slate-900/90 to-blue-950/70 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse">
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {isArabic ? "جاري بناء وتنسيق محتواك التعليمي بعناية..." : "Crafting your educational document with pedagogical care..."}
            </h4>
            <p className="mt-0.5 text-xs text-cyan-200/80">
              {steps[currentStepIndex] || (isArabic ? "جاري صياغة الخطوات..." : "Processing...")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          <span>
            {currentStepIndex + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={idx}
              className={`rounded-lg p-2.5 transition-all text-[11px] leading-tight ${
                isCurrent
                  ? "bg-cyan-500/20 text-cyan-100 border border-cyan-400/50 shadow-sm"
                  : isDone
                  ? "bg-white/5 text-white/50 border border-white/5"
                  : "bg-white/[0.02] text-white/25 border border-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-medium">
                {isDone ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : (
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      isCurrent ? "bg-cyan-400 animate-ping" : "bg-white/20"
                    }`}
                  />
                )}
                <span>{isArabic ? `المرحلة ${idx + 1}` : `Phase ${idx + 1}`}</span>
              </div>
              <span className="line-clamp-2">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
