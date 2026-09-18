import { Router, Request, Response } from "express";
import {
  generateLessonNotes,
  generateQcmQuiz,
  generateRubric,
  generateSupportSheets,
  generateSummaryAndFlashcards,
  generateHomeworkSheet,
  regenerateSingleSection,
  type GenerationLanguage,
  type GenerationMode,
} from "../ai/teacherGenerators";

export interface LibraryItem {
  id: string;
  type: "lesson_notes" | "quiz" | "rubric" | "support_sheets" | "summary_flashcards" | "homework";
  title: string;
  subject: string;
  gradeLevel: string;
  topic: string;
  language: GenerationLanguage;
  mode: GenerationMode;
  content: string; // Markdown or JSON string
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumMemory {
  frequentSubjects: Record<string, number>;
  frequentGrades: Record<string, number>;
  lastSubject: string;
  lastGrade: string;
}

// In-memory persistent cache for server lifecycle + instant response
const memoryLibrary: Map<string, LibraryItem> = new Map();
const memoryCurriculum: CurriculumMemory = {
  frequentSubjects: {
    "الرياضيات": 6,
    "اللغة العربية": 5,
    "العلوم الفيزيائية": 4,
    "علوم الطبيعة والحياة": 4,
    "اللغة الإنجليزية": 3,
    "اللغة الفرنسية": 3,
  },
  frequentGrades: {
    "3 ثانوي": 7,
    "4 متوسط": 5,
    "2 ثانوي": 4,
    "1 ثانوي": 3,
  },
  lastSubject: "الرياضيات",
  lastGrade: "3 ثانوي",
};

// Seed with two high-value realistic sample documents
const sampleItem1: LibraryItem = {
  id: "lib-sample-01",
  type: "lesson_notes",
  title: "مذكرة بيداغوجية: الدوال الأسية وخصائصها",
  subject: "الرياضيات",
  gradeLevel: "3 ثانوي",
  topic: "الدوال الأسية وخصائصها الجبرية والتفاضلية",
  language: "ar",
  mode: "detailed",
  content: `# مذكرة الدرس البيداغوجية: الدوال الأسية وخصائصها الجبرية والتفاضلية
**المادة:** الرياضيات | **المستوى الدراسي:** 3 ثانوي

## 1. Objectives | الأهداف التعلمية
- تعريف الدالة الأسية النيبيرية كحل للمعادلة التفاضلية y' = y مع y(0) = 1.
- استنتاج الخواص الجبرية الأساسية وحساب النهايات الشهيرة.
- دراسة تغيرات الدالة وتوظيفها في حل المسائل المركبة.

## 2. Prerequisites | المكتسبات القبلية
- مفهوم الاشتقاق ومعادلة المماس ودراسة اتجاه التغير.
- خواص القوى الصحيحة والمعادلات التفاضلية البسيطة.

## 3. Materials | الوسائل والوسائط الديداكتيكية
- الكتاب المدرسي، برمجية GeoGebra لتمثيل المنحنى البياني، بطاقات تمارين تطبيقية.

## 4. Introduction | وضعية الانطلاق والتمهيد
- دراسة ظاهرة التكاثر البكتيري أو الفائدة المركبة وملاحظة التزايد السريع غير الخطي (10 دقائق).

## 5. Detailed Content | المضمون المعرفي المفصل
- مبرهنة الوجود والوحدانية للدالة الأسية e^x.
- الخصائص الجبرية: e^(a+b) = e^a * e^b و e^(-a) = 1/e^a.
- المشتقة والنهايات الشهيرة: lim (e^x / x) لما x يؤول إلى +مالانهاية.

## 6. Timeline/Pacing | التوزيع الزمني للحصة
- 00–10 د: وضعية الانطلاق وربطها بالواقع الحيوي.
- 10–30 د: البناء النظري للخاصية التفاضلية والجبرية.
- 30–48 د: تمرين نموذجي موجه من بكالوريا سابقة.
- 48–60 د: تقويم سريع وخلاصة تشاركية.

## 7. Pedagogical Differentiation | الفروق الفردية والتمايز البيداغوجي
- دعم المتعثرين بمخطط تدفقي لخطوات تبسيط العبارات الأسية.
- تكليف المتقدمين ببرهان نهاية التزايد المقارن.

## 8. Student Activities | أنشطة المتعلمين
- تبسيط عبارات جبرية في أفواج ثنائية.
- استنتاج إشارة مشتقة دالة مركبة f(x) = exp(2x - 1).

## 9. Evaluation | التقويم التكويني ومؤشرات الكفاءة
- مسألة مصغرة: حل المعادلة e^(2x) - 3e^x + 2 = 0.

## 10. Conclusion | الحوصلة والخاتمة
- تدوين المخطط العام لتغيرات الدالة وتكليف المتعلمين بتمارين الصفحة 92.`,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

memoryLibrary.set(sampleItem1.id, sampleItem1);

export function recordCurriculumUsage(subject?: string, grade?: string) {
  if (subject && subject.trim()) {
    const s = subject.trim();
    memoryCurriculum.frequentSubjects[s] = (memoryCurriculum.frequentSubjects[s] || 0) + 1;
    memoryCurriculum.lastSubject = s;
  }
  if (grade && grade.trim()) {
    const g = grade.trim();
    memoryCurriculum.frequentGrades[g] = (memoryCurriculum.frequentGrades[g] || 0) + 1;
    memoryCurriculum.lastGrade = g;
  }
}

export const teacherGeneratorsRouter = Router();

/* =========================================================================
   1. GENERATOR ENDPOINTS
   ========================================================================= */

// 1. Lesson Notes
teacherGeneratorsRouter.post("/lesson-notes", async (req: Request, res: Response) => {
  try {
    const { subject, gradeLevel, topic, language, mode, autoSave = true } = req.body || {};
    if (!subject || !gradeLevel || !topic) {
      return res.status(400).json({ error: "Subject, grade level, and topic are required." });
    }

    const markdown = await generateLessonNotes({
      subject: String(subject),
      gradeLevel: String(gradeLevel),
      topic: String(topic),
      language: language as GenerationLanguage,
      mode: mode as GenerationMode,
    });

    recordCurriculumUsage(subject, gradeLevel);

    let savedItem: LibraryItem | null = null;
    if (autoSave) {
      const id = `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      savedItem = {
        id,
        type: "lesson_notes",
        title: `مذكرة درس: ${topic}`,
        subject: String(subject),
        gradeLevel: String(gradeLevel),
        topic: String(topic),
        language: (language || "ar") as GenerationLanguage,
        mode: (mode || "detailed") as GenerationMode,
        content: markdown,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryLibrary.set(id, savedItem);
    }

    return res.status(200).json({
      success: true,
      output: markdown,
      savedItem,
    });
  } catch (err: any) {
    console.error("[TeacherGeneratorsRouter] Lesson Notes error:", err);
    return res.status(500).json({ error: err?.message || "Failed to generate lesson notes." });
  }
});

// 2. QCM Quiz
teacherGeneratorsRouter.post("/quiz", async (req: Request, res: Response) => {
  try {
    const { subject, topic, numberOfQuestions, language, mode, gradeLevel, autoSave = true } = req.body || {};
    if (!subject || !topic) {
      return res.status(400).json({ error: "Subject and topic are required." });
    }

    const quizResult = await generateQcmQuiz({
      subject: String(subject),
      topic: String(topic),
      numberOfQuestions: numberOfQuestions ? Number(numberOfQuestions) : 5,
      language: language as GenerationLanguage,
      mode: mode as GenerationMode,
    });

    recordCurriculumUsage(subject, gradeLevel);

    let savedItem: LibraryItem | null = null;
    if (autoSave) {
      const id = `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      savedItem = {
        id,
        type: "quiz",
        title: `اختبار QCM: ${topic}`,
        subject: String(subject),
        gradeLevel: String(gradeLevel || "عام"),
        topic: String(topic),
        language: (language || "ar") as GenerationLanguage,
        mode: (mode || "detailed") as GenerationMode,
        content: JSON.stringify(quizResult, null, 2),
        metadata: { questionCount: quizResult.questions.length },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryLibrary.set(id, savedItem);
    }

    return res.status(200).json({
      success: true,
      output: quizResult,
      savedItem,
    });
  } catch (err: any) {
    console.error("[TeacherGeneratorsRouter] QCM Quiz error:", err);
    return res.status(500).json({ error: err?.message || "Failed to generate QCM quiz." });
  }
});

// 3. Rubric
teacherGeneratorsRouter.post("/rubric", async (req: Request, res: Response) => {
  try {
    const { subject, topic, assignmentType, language, mode, gradeLevel, autoSave = true } = req.body || {};
    if (!subject || !topic || !assignmentType) {
      return res.status(400).json({ error: "Subject, topic, and assignment type are required." });
    }

    const markdown = await generateRubric({
      subject: String(subject),
      topic: String(topic),
      assignmentType: String(assignmentType),
      language: language as GenerationLanguage,
      mode: mode as GenerationMode,
    });

    recordCurriculumUsage(subject, gradeLevel);

    let savedItem: LibraryItem | null = null;
    if (autoSave) {
      const id = `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      savedItem = {
        id,
        type: "rubric",
        title: `سلم تقييم (${assignmentType}): ${topic}`,
        subject: String(subject),
        gradeLevel: String(gradeLevel || "عام"),
        topic: String(topic),
        language: (language || "ar") as GenerationLanguage,
        mode: (mode || "detailed") as GenerationMode,
        content: markdown,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryLibrary.set(id, savedItem);
    }

    return res.status(200).json({
      success: true,
      output: markdown,
      savedItem,
    });
  } catch (err: any) {
    console.error("[TeacherGeneratorsRouter] Rubric error:", err);
    return res.status(500).json({ error: err?.message || "Failed to generate rubric." });
  }
});

// 4. Support Sheets
teacherGeneratorsRouter.post("/support-sheets", async (req: Request, res: Response) => {
  try {
    const { subject, topic, language, mode, gradeLevel, autoSave = true } = req.body || {};
    if (!subject || !topic) {
      return res.status(400).json({ error: "Subject and topic are required." });
    }

    const sheets = await generateSupportSheets({
      subject: String(subject),
      topic: String(topic),
      language: language as GenerationLanguage,
      mode: mode as GenerationMode,
    });

    recordCurriculumUsage(subject, gradeLevel);

    let savedItem: LibraryItem | null = null;
    if (autoSave) {
      const id = `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      savedItem = {
        id,
        type: "support_sheets",
        title: `أوراق الدعم المتمايز (3 مستويات): ${topic}`,
        subject: String(subject),
        gradeLevel: String(gradeLevel || "عام"),
        topic: String(topic),
        language: (language || "ar") as GenerationLanguage,
        mode: (mode || "detailed") as GenerationMode,
        content: sheets.fullMarkdown,
        metadata: { easy: sheets.easy, standard: sheets.standard, advanced: sheets.advanced },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryLibrary.set(id, savedItem);
    }

    return res.status(200).json({
      success: true,
      output: sheets,
      savedItem,
    });
  } catch (err: any) {
    console.error("[TeacherGeneratorsRouter] Support Sheets error:", err);
    return res.status(500).json({ error: err?.message || "Failed to generate support sheets." });
  }
});

// 5. Summary & Flashcards
teacherGeneratorsRouter.post("/summary-flashcards", async (req: Request, res: Response) => {
  try {
    const { topicOrText, subject, language, mode, gradeLevel, autoSave = true } = req.body || {};
    if (!topicOrText || !topicOrText.trim()) {
      return res.status(400).json({ error: "Topic or uploaded text is required." });
    }

    const result = await generateSummaryAndFlashcards({
      topicOrText: String(topicOrText),
      subject: subject ? String(subject) : undefined,
      language: language as GenerationLanguage,
      mode: mode as GenerationMode,
    });

    recordCurriculumUsage(subject, gradeLevel);

    let savedItem: LibraryItem | null = null;
    if (autoSave) {
      const id = `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const topicSnippet = topicOrText.slice(0, 45).trim();
      savedItem = {
        id,
        type: "summary_flashcards",
        title: `ملخص وبطاقات تعليمية: ${topicSnippet}`,
        subject: String(subject || "عام"),
        gradeLevel: String(gradeLevel || "عام"),
        topic: topicSnippet,
        language: (language || "ar") as GenerationLanguage,
        mode: (mode || "detailed") as GenerationMode,
        content: JSON.stringify(result, null, 2),
        metadata: { cardCount: result.flashcards.length },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryLibrary.set(id, savedItem);
    }

    return res.status(200).json({
      success: true,
      output: result,
      savedItem,
    });
  } catch (err: any) {
    console.error("[TeacherGeneratorsRouter] Summary & Flashcards error:", err);
    return res.status(500).json({ error: err?.message || "Failed to generate summary & flashcards." });
  }
});

// 6. Homework Sheet
teacherGeneratorsRouter.post("/homework", async (req: Request, res: Response) => {
  try {
    const { subject, topic, gradeLevel, language, mode, autoSave = true } = req.body || {};
    if (!subject || !topic || !gradeLevel) {
      return res.status(400).json({ error: "Subject, topic, and grade level are required." });
    }

    const markdown = await generateHomeworkSheet({
      subject: String(subject),
      topic: String(topic),
      gradeLevel: String(gradeLevel),
      language: language as GenerationLanguage,
      mode: mode as GenerationMode,
    });

    recordCurriculumUsage(subject, gradeLevel);

    let savedItem: LibraryItem | null = null;
    if (autoSave) {
      const id = `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      savedItem = {
        id,
        type: "homework",
        title: `واجب منزلي: ${topic}`,
        subject: String(subject),
        gradeLevel: String(gradeLevel),
        topic: String(topic),
        language: (language || "ar") as GenerationLanguage,
        mode: (mode || "detailed") as GenerationMode,
        content: markdown,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryLibrary.set(id, savedItem);
    }

    return res.status(200).json({
      success: true,
      output: markdown,
      savedItem,
    });
  } catch (err: any) {
    console.error("[TeacherGeneratorsRouter] Homework error:", err);
    return res.status(500).json({ error: err?.message || "Failed to generate homework sheet." });
  }
});

// 7. Section-Level Regeneration
teacherGeneratorsRouter.post("/regenerate-section", async (req: Request, res: Response) => {
  try {
    const { generatorType, sectionKey, sectionTitle, subject, topic, gradeLevel, fullContext, language, mode, libraryItemId } = req.body || {};
    if (!generatorType || !sectionTitle || !subject || !topic) {
      return res.status(400).json({ error: "Missing required fields for section regeneration." });
    }

    const regeneratedText = await regenerateSingleSection({
      generatorType,
      sectionKey: String(sectionKey || sectionTitle),
      sectionTitle: String(sectionTitle),
      subject: String(subject),
      topic: String(topic),
      gradeLevel: gradeLevel ? String(gradeLevel) : undefined,
      fullContext: fullContext ? String(fullContext) : undefined,
      language: language as GenerationLanguage,
      mode: mode as GenerationMode,
    });

    // Optionally update library item if provided
    if (libraryItemId && memoryLibrary.has(libraryItemId)) {
      const existing = memoryLibrary.get(libraryItemId)!;
      existing.updatedAt = new Date().toISOString();
      memoryLibrary.set(libraryItemId, existing);
    }

    return res.status(200).json({
      success: true,
      regeneratedContent: regeneratedText,
    });
  } catch (err: any) {
    console.error("[TeacherGeneratorsRouter] Regenerate section error:", err);
    return res.status(500).json({ error: err?.message || "Failed to regenerate section." });
  }
});

/* =========================================================================
   2. CONTENT LIBRARY API
   ========================================================================= */

// List items with filters
teacherGeneratorsRouter.get("/library", (req: Request, res: Response) => {
  const { type, subject, gradeLevel, search } = req.query as {
    type?: string;
    subject?: string;
    gradeLevel?: string;
    search?: string;
  };

  let items = Array.from(memoryLibrary.values());

  if (type) {
    items = items.filter(i => i.type === type);
  }
  if (subject) {
    items = items.filter(i => i.subject.toLowerCase().includes(subject.toLowerCase()));
  }
  if (gradeLevel) {
    items = items.filter(i => i.gradeLevel.toLowerCase().includes(gradeLevel.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(i =>
      i.title.toLowerCase().includes(s) ||
      i.topic.toLowerCase().includes(s) ||
      i.subject.toLowerCase().includes(s)
    );
  }

  // Sort by newest first
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.status(200).json({
    success: true,
    total: items.length,
    items,
  });
});

// Save / manual save
teacherGeneratorsRouter.post("/library", (req: Request, res: Response) => {
  const { type, title, subject, gradeLevel, topic, language, mode, content, metadata } = req.body || {};
  if (!type || !title || !content) {
    return res.status(400).json({ error: "Type, title, and content are required." });
  }

  const id = `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const item: LibraryItem = {
    id,
    type,
    title: String(title),
    subject: String(subject || "عام"),
    gradeLevel: String(gradeLevel || "عام"),
    topic: String(topic || title),
    language: (language || "ar") as GenerationLanguage,
    mode: (mode || "detailed") as GenerationMode,
    content: String(content),
    metadata: metadata || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryLibrary.set(id, item);
  recordCurriculumUsage(subject, gradeLevel);

  return res.status(201).json({ success: true, item });
});

// Delete item
teacherGeneratorsRouter.delete("/library/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  if (memoryLibrary.has(id)) {
    memoryLibrary.delete(id);
    return res.status(200).json({ success: true, deletedId: id });
  }
  return res.status(404).json({ error: "Item not found in library." });
});

/* =========================================================================
   3. CURRICULUM CONTEXT MEMORY API
   ========================================================================= */

teacherGeneratorsRouter.get("/context-memory", (_req: Request, res: Response) => {
  // Sort frequent subjects and grades
  const topSubjects = Object.entries(memoryCurriculum.frequentSubjects)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(e => e[0]);

  const topGrades = Object.entries(memoryCurriculum.frequentGrades)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(e => e[0]);

  return res.status(200).json({
    success: true,
    memory: {
      defaultSubject: memoryCurriculum.lastSubject || topSubjects[0] || "الرياضيات",
      defaultGrade: memoryCurriculum.lastGrade || topGrades[0] || "3 ثانوي",
      topSubjects,
      topGrades,
    },
  });
});

teacherGeneratorsRouter.post("/context-memory", (req: Request, res: Response) => {
  const { subject, grade } = req.body || {};
  recordCurriculumUsage(subject, grade);
  return res.status(200).json({ success: true, memory: memoryCurriculum });
});
