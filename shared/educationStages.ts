export const ALGERIA_EDUCATION_STAGES = [
  { id: "preparatory", ar: "التعليم التحضيري", en: "Preparatory education", detailAr: "05–06 سنوات · غير إلزامي", detailEn: "Ages 5–6 · non-compulsory" },
  { id: "primary", ar: "التعليم الابتدائي", en: "Primary education", detailAr: "5 سنوات · شهادة التعليم الابتدائي", detailEn: "5 years · primary education certificate" },
  { id: "middle", ar: "التعليم المتوسط", en: "Middle education", detailAr: "4 سنوات · شهادة التعليم المتوسط (البيام)", detailEn: "4 years · BEM" },
  { id: "secondary", ar: "التعليم الثانوي", en: "Secondary education", detailAr: "3 سنوات · شهادة البكالوريا", detailEn: "3 years · Baccalaureate" },
  { id: "higher", ar: "التعليم العالي", en: "Higher education", detailAr: "نظام LMD: ليسانس–ماستر–دكتوراه", detailEn: "LMD: Licence–Master–Doctorate" },
] as const;

export type AlgeriaEducationStage = (typeof ALGERIA_EDUCATION_STAGES)[number]["id"];

export function educationStageLabel(stage: string | null | undefined, isArabic: boolean) {
  const match = ALGERIA_EDUCATION_STAGES.find(item => item.id === stage);
  return match ? (isArabic ? match.ar : match.en) : (stage || (isArabic ? "غير محدد" : "Unspecified"));
}
