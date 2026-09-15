import React, { useState, useEffect } from "react";
import {
  Palette,
  FileText,
  Printer,
  Download,
  Upload,
  Sparkles,
  Layers,
  Quote,
  CheckCircle2,
  Share2,
  Edit3,
  Eye,
  RefreshCw,
  BookOpen,
  Award,
  GraduationCap,
  Plus,
  Trash2,
  Copy,
  Save,
  FileCode,
  FolderOpen,
} from "lucide-react";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import { ALGERIAN_CURRICULUM_LESSON_PLANS } from "@/data/algerianLessonPlans";

interface CurriculumTemplateStudioProps {
  isArabic?: boolean;
}

interface CustomTemplateItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  stage: string;
  stream?: string;
  descriptionAr: string;
  defaultData: Record<string, any>;
  isCustomUserTemplate?: boolean;
}

const STORAGE_KEY = "edupulse_custom_curriculum_templates";

export function CurriculumTemplateStudio({ isArabic = true }: CurriculumTemplateStudioProps) {
  const templatesQuery = trpc.integrations.listTemplates.useQuery();
  const renderTemplateMutation = trpc.integrations.renderTemplate.useMutation();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("lesson-plan-bac-stem");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [customFields, setCustomFields] = useState<Array<{ key: string; label: string; value: string }>>([]);
  const [newFieldLabel, setNewFieldLabel] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Custom templates stored locally
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [selectedOfficialPlanId, setSelectedOfficialPlanId] = useState("");

  // Save custom templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
    } catch (e) {
      console.error("Failed to save custom templates:", e);
    }
  }, [customTemplates]);

  // Combine official templates from query with user custom templates
  const allTemplates = React.useMemo(() => {
    const base = templatesQuery.data || [];
    return [...customTemplates, ...base];
  }, [templatesQuery.data, customTemplates]);

  const filteredTemplates = activeCategory === "all"
    ? allTemplates
    : activeCategory === "custom"
    ? allTemplates.filter((t) => (t as any).isCustomUserTemplate)
    : allTemplates.filter((t) => t.category === activeCategory);

  const currentTemplate = allTemplates.find((t) => t.id === selectedTemplateId) || allTemplates[0];

  // Load default template data on selection
  useEffect(() => {
    if (currentTemplate) {
      setFormData(currentTemplate.defaultData || {});
      // Extract custom fields if any
      const existingCustom = (currentTemplate.defaultData as any)?.extraFields || [];
      setCustomFields(existingCustom);
    }
  }, [selectedTemplateId, currentTemplate]);

  // Insert pedagogical quote
  const handleInsertQuote = async () => {
    const quotes = [
      "العلم يبدأ بالتجربة وينتهي بالقانون الرياضي. — ابن الهيثم",
      "الرياضيات هي الموسيقى الخفية التي يفهم بها العقل بنية الكون. — الخوارزمي",
      "المعلم الحقيقي لا يصب المعرفة في عقل التلميذ، بل يوقد فيه شعلة الاستكشاف والبحث الذاتي. — ابن باديس",
      "غاية المعرفة ليست الامتلاء بالمعلومات، بل القدرة على مساءلة البديهيات. — ابن رشد",
      "التعلم بالاكتشاف وحل المشكلات يرسخ الأثر المعرفي الدائم في الذاكرة طويلة المدى. — المقاربة بالكفاءات",
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setFormData((prev) => ({ ...prev, quote: randomQuote }));
    toast.success(isArabic ? "تم إدراج الحكمة البيداغوجية بنجاح!" : "Quote inserted successfully!");
  };

  // Add dynamic custom field
  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) return;
    const key = `custom_${Date.now()}`;
    const updated = [...customFields, { key, label: newFieldLabel.trim(), value: "" }];
    setCustomFields(updated);
    setNewFieldLabel("");
    toast.success(isArabic ? "تمت إضافة الحقل الجديد بنجاح" : "Custom field added");
  };

  // Remove custom field
  const handleRemoveCustomField = (index: number) => {
    const updated = customFields.filter((_, i) => i !== index);
    setCustomFields(updated);
  };

  // Update custom field value
  const handleCustomFieldValueChange = (index: number, val: string) => {
    const updated = [...customFields];
    updated[index].value = val;
    setCustomFields(updated);
  };

  // Import from Official Algerian Lesson Plan
  const handleImportOfficialPlan = () => {
    const plan = ALGERIAN_CURRICULUM_LESSON_PLANS.find((p) => p.id === selectedOfficialPlanId);
    if (!plan) {
      toast.error(isArabic ? "يرجى اختيار جذاذة من القائمة" : "Please select a lesson plan");
      return;
    }

    const mergedData = {
      institutionName: "ثانوية الأمير عبد القادر / متوسطة مفدي زكرياء",
      teacherName: "أستاذ المادة",
      subject: plan.subjectNameAr,
      grade: `${plan.cycleNameAr} — ${plan.gradeNameAr}${plan.streamNameAr ? ` (${plan.streamNameAr})` : ""}`,
      unitTitle: `${plan.unitSequence} : ${plan.lessonTitleAr}`,
      competency: `${plan.terminalCompetencyAr} | الإنجليزية: ${plan.targetedCompetencyEn}`,
      didacticAids: plan.didacticMaterials.join("، "),
      duration: `${plan.durationMinutes} دقيقة`,
      quote: "التلميذ صانع لمعرفته وممارس لكفاءاته الحياتية. — المنهاج الوطني الجزائري",
      stagesSummary: plan.stages.map((s) => `${s.stepNameAr}: ${s.teacherRoleAr.substring(0, 70)}...`).join(" | "),
    };

    setFormData(mergedData);
    setIsImportModalOpen(false);
    toast.success(isArabic ? `تم استيراد جذاذة: "${plan.lessonTitleAr}" بنجاح!` : "Official lesson plan imported!");
  };

  // Import from JSON text
  const handleImportJsonText = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.id && parsed.nameAr) {
        // Full template object
        const newTemplate: CustomTemplateItem = {
          ...parsed,
          id: `custom-tmpl-${Date.now()}`,
          isCustomUserTemplate: true,
        };
        setCustomTemplates((prev) => [newTemplate, ...prev]);
        setSelectedTemplateId(newTemplate.id);
        toast.success(isArabic ? "تم استيراد وحفظ القالب المخصص بنجاح!" : "Custom template imported!");
      } else {
        // Just form field payload
        setFormData(parsed);
        toast.success(isArabic ? "تم تحميل بيانات النموذج بنجاح!" : "Template data loaded!");
      }
      setIsImportModalOpen(false);
      setImportJsonText("");
    } catch (err: any) {
      toast.error(isArabic ? "صيغة JSON غير صحيحة، يرجى التأكد من البيانات." : "Invalid JSON format");
    }
  };

  // Save current customized form as a new custom template
  const handleSaveAsCustomTemplate = () => {
    const templateName = prompt(
      isArabic ? "أدخل اسم القالب المخصص الجديد:" : "Enter template name:",
      `${currentTemplate?.nameAr || "قالب مخصص"} (نسختي)`
    );
    if (!templateName) return;

    const newCustomTmpl: CustomTemplateItem = {
      id: `custom-tmpl-${Date.now()}`,
      nameAr: templateName,
      nameEn: "Custom Teacher Template",
      category: currentTemplate?.category || "lesson_plan",
      stage: currentTemplate?.stage || "التعليم الثانوي",
      stream: currentTemplate?.stream || "جميع الشعب",
      descriptionAr: `قالب مخصص للأستاذ تم حفظه وتعديله محلياً. يتضمن ${Object.keys(formData).length} حقلاً.`,
      defaultData: {
        ...formData,
        extraFields: customFields,
      },
      isCustomUserTemplate: true,
    };

    setCustomTemplates((prev) => [newCustomTmpl, ...prev]);
    setSelectedTemplateId(newCustomTmpl.id);
    setActiveCategory("custom");
    toast.success(isArabic ? "تم حفظ القالب بنجاح في قائمة قوالبك المخصصة!" : "Saved to custom templates!");
  };

  // Export current template as JSON
  const handleExportJson = () => {
    const payload = {
      ...currentTemplate,
      defaultData: {
        ...formData,
        extraFields: customFields,
      },
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTemplate?.id || "template"}-custom.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isArabic ? "تم تنزيل ملف القالب JSON بنجاح!" : "Template JSON exported!");
  };

  // Print / Render document
  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    try {
      const mergedPayload = {
        ...formData,
        extraFields: customFields,
      };

      const res = await renderTemplateMutation.mutateAsync({
        templateId: selectedTemplateId.startsWith("custom-") ? "lesson-plan-bac-stem" : selectedTemplateId,
        customData: mergedPayload,
        format: "pdf",
      });

      if (res.htmlContent) {
        setPreviewHtml(res.htmlContent);
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(res.htmlContent);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
        toast.success(isArabic ? "تم توليد القالب وجاهز للطباعة أو الحفظ كـ PDF!" : "Template rendered & print dialog opened!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to render template");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 text-white shadow-sm border border-emerald-900/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
              <Palette className="h-3.5 w-3.5" />
              <span>{isArabic ? "استوديو القوالب البيداغوجية واستيراد المذكرات" : "Curriculum Template & Document Studio"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              {isArabic ? "استوديو تصميم المذكرات والشهادات وامتحانات BAC" : "Curriculum Template & Form Builder"}
            </h1>
            <p className="mt-1 text-sm text-emerald-200/80 max-w-3xl">
              {isArabic
                ? "توليد وتعديل مذكرات الدروس الرسمية، استيراد الجذاذات الوطنية، تخصيص الحقول، وتصدير النماذج للطباعة وحفظها كملفات PDF عالية الجودة."
                : "Import, edit, and render sovereign Algerian lesson plans, BAC exam papers, and certificates with custom field extensibility."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Upload className="h-4 w-4 text-emerald-300" />
              <span>{isArabic ? "استيراد مذكرة / قالب" : "Import Template"}</span>
            </button>

            <button
              onClick={handleGenerateDocument}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/30 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>{isGenerating ? (isArabic ? "جاري التوليد..." : "Rendering...") : isArabic ? "طباعة وحفظ PDF" : "Print / Save PDF"}</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/15 pt-4">
          {[
            { id: "all", label: isArabic ? "جميع القوالب" : "All Templates" },
            { id: "custom", label: isArabic ? `قوالبي المخصصة (${customTemplates.length})` : `My Templates (${customTemplates.length})` },
            { id: "lesson_plan", label: isArabic ? "مذكرات الدروس (Lesson Plans)" : "Lesson Plans" },
            { id: "exam_paper", label: isArabic ? "امتحانات وفروض BAC" : "Exam Papers" },
            { id: "certificate", label: isArabic ? "شهادات التقدير والامتياز" : "Certificates" },
            { id: "cheat_sheet", label: isArabic ? "مطويات وملخصات القوانين" : "Cheat Sheets" },
            { id: "research_syllabus", label: isArabic ? "مذكرات التخرج والأطروحات" : "Theses & Syllabi" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                activeCategory === cat.id ? "bg-emerald-500 text-slate-950 shadow-sm font-bold" : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Selector Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template Catalog Selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">{isArabic ? "قائمة النماذج المعتمدة" : "Official Templates"}</h3>
            <span className="text-[11px] font-semibold text-slate-500">{filteredTemplates.length} قالب</span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredTemplates.map((t) => {
              const isSelected = selectedTemplateId === t.id;
              const isUserCustom = (t as any).isCustomUserTemplate;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-400"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{t.nameAr}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isUserCustom ? "bg-purple-100 text-purple-800" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isUserCustom ? (isArabic ? "مخصص" : "Custom") : t.stage}
                    </span>
                  </div>
                  {t.stream && <p className="mt-1 text-[11px] font-semibold text-blue-600">{t.stream}</p>}
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{t.descriptionAr}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Template Customization Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            {/* Header of Editor */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{currentTemplate?.nameAr}</h3>
                <p className="text-xs text-slate-500">{currentTemplate?.descriptionAr}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleInsertQuote}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-xs"
                >
                  <Quote className="h-3.5 w-3.5" />
                  <span>{isArabic ? "حكمة بيداغوجية" : "Quote"}</span>
                </button>

                <button
                  onClick={handleSaveAsCustomTemplate}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition shadow-xs"
                  title="Save customized version"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isArabic ? "حفظ كقالب مخصص" : "Save Custom"}</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  title="Export JSON"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Form Fields according to template type */}
            <div className="grid gap-4 sm:grid-cols-2 max-h-[420px] overflow-y-auto p-1">
              {formData.institutionName !== undefined && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "اسم المؤسسة التعليمية" : "Institution"}</label>
                  <input
                    value={formData.institutionName || ""}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {formData.teacherName !== undefined && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "اسم الأستاذ(ة)" : "Teacher Name"}</label>
                  <input
                    value={formData.teacherName || ""}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {formData.subject !== undefined && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "المادة التعليمية" : "Subject"}</label>
                  <input
                    value={formData.subject || ""}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {formData.grade !== undefined && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "القسم / الشعبة" : "Grade / Stream"}</label>
                  <input
                    value={formData.grade || ""}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {formData.unitTitle !== undefined && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "عنوان الوحدة أو الدرس" : "Lesson / Unit Title"}</label>
                  <input
                    value={formData.unitTitle || ""}
                    onChange={(e) => setFormData({ ...formData, unitTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              )}

              {formData.competency !== undefined && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "الكفاءة الختامية المستهدفة" : "Target Competency"}</label>
                  <textarea
                    value={formData.competency || ""}
                    onChange={(e) => setFormData({ ...formData, competency: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {formData.didacticAids !== undefined && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "السندات والوسائل التعليمية" : "Didactic Aids"}</label>
                  <input
                    value={formData.didacticAids || ""}
                    onChange={(e) => setFormData({ ...formData, didacticAids: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800"
                  />
                </div>
              )}

              {/* Certificate specific fields */}
              {formData.awardedTo !== undefined && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "اسم التلميذ(ة) المكرم" : "Awarded To"}</label>
                  <input
                    value={formData.awardedTo || ""}
                    onChange={(e) => setFormData({ ...formData, awardedTo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-bold"
                  />
                </div>
              )}

              {formData.average !== undefined && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "المعدل / الرتبة" : "Score / Rank"}</label>
                  <input
                    value={formData.average || ""}
                    onChange={(e) => setFormData({ ...formData, average: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800"
                  />
                </div>
              )}

              {formData.quote !== undefined && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isArabic ? "الحكمة البيداغوجية والشعار" : "Pedagogical Quote"}</label>
                  <input
                    value={formData.quote || ""}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-xs text-slate-800 italic"
                  />
                </div>
              )}

              {/* Render User-Added Custom Fields */}
              {customFields.map((field, idx) => (
                <div key={field.key} className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-indigo-900">{field.label}</label>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(idx)}
                      className="text-slate-400 hover:text-red-500 text-xs transition"
                      title="Delete field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    value={field.value}
                    onChange={(e) => handleCustomFieldValueChange(idx, e.target.value)}
                    placeholder={isArabic ? `محتوى ${field.label}...` : "Value..."}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            {/* Add Custom Field Inline Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <input
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder={isArabic ? "اسم حقل مخصص جديد (مثال: ملاحظات المفتش التربوي، سلم التنقيط)..." : "New custom field label..."}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomField();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isArabic ? "إضافة حقل" : "Add Field"}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isArabic ? "توليد فوري بتنسيق A4 للطباعة الرسمية" : "Ready for official A4 print output"}
            </span>

            <button
              onClick={handleGenerateDocument}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>{isArabic ? "معاينة وطباعة النموذج" : "Render & Print Document"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {isArabic ? "استيراد مذكرة أو جذاذة تحضير رسمية" : "Import Lesson Plan or Template"}
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Option 1: Quick-load from Official Algerian Curriculum */}
            <div className="space-y-2 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <label className="block text-xs font-bold text-emerald-950">
                {isArabic ? "1. الاستيراد المباشر من المستودع الوطني للجذاذات الجزائرية:" : "1. Import from Algerian Official Repository:"}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedOfficialPlanId}
                  onChange={(e) => setSelectedOfficialPlanId(e.target.value)}
                  className="flex-1 bg-white border border-emerald-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="">-- {isArabic ? "اختر جذاذة من المنهاج الرسمي" : "Select official plan"} --</option>
                  {ALGERIAN_CURRICULUM_LESSON_PLANS.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.cycleNameAr} · {plan.subjectNameAr} · {plan.lessonTitleAr}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleImportOfficialPlan}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shrink-0"
                >
                  {isArabic ? "استيراد للجذاذة" : "Load Plan"}
                </button>
              </div>
              <p className="text-[11px] text-emerald-800">
                {isArabic
                  ? "يتم تلقائياً ملء الكفاءات والمراحل البيداغوجية والوسائل والحكمة داخل القالب."
                  : "Auto-populates didactic competencies, aids, and instructional stages."}
              </p>
            </div>

            {/* Option 2: Paste JSON */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {isArabic ? "2. أو استيراد قالب مخصص عبر رمز JSON:" : "2. Or paste JSON Template code:"}
              </label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"institutionName": "ثانوية عمارة رشيد", "subject": "الفيزياء", ...}'
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleImportJsonText}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                {isArabic ? "معالجة واستيراد قالب JSON" : "Parse and Import JSON"}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                {isArabic ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
