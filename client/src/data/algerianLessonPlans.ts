export interface AlgerianLessonPlan {
  id: string;
  cycle: "primary" | "middle" | "secondary";
  cycleNameAr: string;
  gradeId: string;
  gradeNameAr: string;
  streamNameAr?: string;
  subjectId: string;
  subjectNameAr: string;
  subjectNameEn: string;
  unitSequence: string;
  unitSequenceEn?: string;
  rubricRubrique: string;
  lessonTitleAr: string;
  lessonTitleEn: string;
  durationMinutes: number;
  terminalCompetencyAr: string;
  targetedCompetencyEn: string;
  didacticMaterials: string[];
  stages: {
    step: number;
    stepNameAr: string;
    stepNameEn: string;
    duration: number;
    teacherRoleAr: string;
    learnerRoleAr: string;
    pedagogicalAimsAr: string;
    formativeCheckpointAr: string;
  }[];
  googleDocTemplateTitle: string;
  googleSlidePresentationTitle: string;
  googleSheetRubricTitle: string;
}

export const ALGERIAN_CURRICULUM_LESSON_PLANS: AlgerianLessonPlan[] = [
  // ==========================================
  // ENGLISH - SECONDARY 3AS (BAC PREP)
  // ==========================================
  {
    id: "lp-3as-eng-01",
    cycle: "secondary",
    cycleNameAr: "التعليم الثانوي",
    gradeId: "3as",
    gradeNameAr: "السنة الثالثة ثانوي (3AS بكالوريا)",
    streamNameAr: "شعبة لغات أجنبية + آداب وفلسفة",
    subjectId: "english",
    subjectNameAr: "اللغة الإنجليزية",
    subjectNameEn: "English",
    unitSequence: "Unit 1: Exploring the Past (Ancient Civilizations)",
    unitSequenceEn: "Ancient Civilizations: Rise & Fall",
    rubricRubrique: "Read & Consider / Grammar in Context",
    lessonTitleAr: "التعبير عن الأفعال الماضية المتزامنة والسبب والنتيجة (Past Habits & Consequence)",
    lessonTitleEn: "Expressing Consequence & Past Habits with 'used to' and 'so... that'",
    durationMinutes: 60,
    terminalCompetencyAr: "الإنتاج الكتابي لنص تفسيري معلل حول عوامل ازدهار وسقوط الحضارات القديمة وفق مواصفات البكالوريا.",
    targetedCompetencyEn: "Learners will be able to synthesize historical evidence and argue causes and consequences of civilizational collapse using targeted cohesive markers.",
    didacticMaterials: ["Student Textbook (Ticket to Success)", "Timeline Infographic Slide", "Whiteboard", "Sample BAC Paper Excerpt"],
    stages: [
      {
        step: 1,
        stepNameAr: "وضعية الانطلاق والإحماء النشط",
        stepNameEn: "Warm-up & Retrieval Practice",
        duration: 8,
        teacherRoleAr: "عرض صور للبتراء، الأهرامات، وتيمقاد على جهاز العرض. طرح أسئلة محفزة: 'Why did these flourishing cities turn to ruins?'",
        learnerRoleAr: "استرجاع المصطلحات المكتسبة (irrigation, collapse, flourishing, conquest) وتدوينها على السبورة.",
        pedagogicalAimsAr: "تنشيط المعارف القبلية وكسر الجليد باللغة المستهدفة.",
        formativeCheckpointAr: "التأكد من التمييز بين 'cause' و 'effect'."
      },
      {
        step: 2,
        stepNameAr: "القراءة والتحليل الاستكشافي",
        stepNameEn: "Silent Reading & Textual Analysis",
        duration: 15,
        teacherRoleAr: "توجيه التلاميذ لقراءة النص المعتمد ص 22، وتحديد جمل المقارنة والسببية.",
        learnerRoleAr: "قراءة صامتة مسحية لاستخراج أسباب جفاف أنظمة الري في بلاد الرافدين وتسطير الروابط (as a result, consequently).",
        pedagogicalAimsAr: "تطوير استراتيجيات القراءة الاستكشافية وتحديد الفكرة المركزية.",
        formativeCheckpointAr: "فحص إجابات ثنائيات التلاميذ لأسئلة الفهم العام."
      },
      {
        step: 3,
        stepNameAr: "النمذجة الصريحة للقاعدة اللغوية",
        stepNameEn: "Explicit Grammar Conceptualization",
        duration: 12,
        teacherRoleAr: "استنباط القاعدة اللغوية على السبورة: (So + Adj + That) و (Such + Noun Phrase + That) ومقارنتها بنموذج البكالوريا.",
        learnerRoleAr: "تحويل 3 جمل نموذجية من صيغة معزولة إلى صيغة مترابطة مبيناً الأثر والنتيجة.",
        pedagogicalAimsAr: "التحكم الدقيق في التراكيب النحوية المعتمدة في موضوع البكالوريا.",
        formativeCheckpointAr: "التحقق من عدم الخلط بين so that (الغرض) و so... that (النتيجة)."
      },
      {
        step: 4,
        stepNameAr: "التدريب الموجه والمكافئ",
        stepNameEn: "Guided & Scaffolding Practice",
        duration: 15,
        teacherRoleAr: "توزيع بطاقات تمارين ثنائية تحاكي تمرين B1 في امتحان البكالوريا (Sentence Re-ordering & Synthesis).",
        learnerRoleAr: "حل التمارين ثنائياً ومقارنة الإجابات مع الفوج المجاور قبل التصحيح الجماعي.",
        pedagogicalAimsAr: "التمكين من مهارة إعادة الصياغة دون تغيير المعنى.",
        formativeCheckpointAr: "تصحيح فوري على السبورة التفاعلية مع تعليل القاعدة."
      },
      {
        step: 5,
        stepNameAr: "الإنتاج التكاملي والتقويم الختامي",
        stepNameEn: "Integration & Formative Check",
        duration: 10,
        teacherRoleAr: "تكليف التلاميذ بكتابة فقرة من 4 أسطر تجيب: 'How did deforestation lead to the collapse of the Mayan Empire?'",
        learnerRoleAr: "كتابة فردية وتطبيق الروابط النحوية ومشاركة نموذجين للقراءة الجهرية.",
        pedagogicalAimsAr: "إدماج المكتسبات المعرفية واللغوية في سياق إنتاجي.",
        formativeCheckpointAr: "تقييم العينات بمعيار: صحة الربط، دقة المعجم، وحسن التركيب."
      }
    ],
    googleDocTemplateTitle: "جذاذة تربوية رسمية — 3AS English: Unit 1 Exploring the Past",
    googleSlidePresentationTitle: "عرض تقديمي تفاعلي — Causes of Ancient Civilizations Collapse",
    googleSheetRubricTitle: "شبكة تقويم الإنتاج الكتابي وفق المعايير الوزارية BAC"
  },

  {
    id: "lp-3as-eng-02",
    cycle: "secondary",
    cycleNameAr: "التعليم الثانوي",
    gradeId: "3as",
    gradeNameAr: "السنة الثالثة ثانوي (3AS بكالوريا)",
    streamNameAr: "جميع الشعب العلمية والتقنية وتسيير",
    subjectId: "english",
    subjectNameAr: "اللغة الإنجليزية",
    subjectNameEn: "English",
    unitSequence: "Unit 2: Ill-Gotten Gains Never Prosper (Ethics in Business)",
    unitSequenceEn: "Ethics in Business & Counterfeiting",
    rubricRubrique: "Language Outcomes / Expressing Wishes & Regret",
    lessonTitleAr: "التعبير عن التمني والندم في سياق أخلاقيات الأعمال (I wish / If only)",
    lessonTitleEn: "Expressing Wishes, Regrets and Moral Obligations with 'I wish' and 'It's high time'",
    durationMinutes: 60,
    terminalCompetencyAr: "إنتاج نص توعوي موجه للجمهور يحذر من مخاطر التقليد والرشوة ويدعو للنزاهة المالية.",
    targetedCompetencyEn: "Learners will articulate hypothetical ethical dilemmas, express constructive criticism, and suggest reform policies using subjunctive and modal structures.",
    didacticMaterials: ["Anti-Corruption Posters", "Short Audio Clip (Consumer Protection)", "Flashcards of Commercial Fraud"],
    stages: [
      {
        step: 1,
        stepNameAr: "الانطلاق: استثارة الموقف المشكل",
        stepNameEn: "Problematic Situation & Warm-up",
        duration: 10,
        teacherRoleAr: "عرض صورتين لمنتج دوائي أصلي وآخر مقلد: 'What are the ethical and health repercussions?'",
        learnerRoleAr: "التعبير الحر بعبارات الاستنكار والتحذير: 'Counterfeiting kills, unethical, consumer protection'.",
        pedagogicalAimsAr: "بناء الدافعية وربط اللغة بواقع المستهلك الجزائري.",
        formativeCheckpointAr: "استخدام المفردات التخصصية للوحدة."
      },
      {
        step: 2,
        stepNameAr: "الملاحظة الصريحة والاستنتاج النحوي",
        stepNameEn: "Grammar Analysis (I wish / It's about time)",
        duration: 15,
        teacherRoleAr: "كتابة جمل مقارنة: الحاضر مقابل الماضي (Past Simple after wish for present regret, Past Perfect for past regret).",
        learnerRoleAr: "استنتاج انزياح الزمن (Tense Backshift) واستخراج صيغة (It's high time + Subject + Past Simple).",
        pedagogicalAimsAr: "التحكم في الأزمنة الاستثنائية الأكثر وروداً في مواضيع البكالوريا.",
        formativeCheckpointAr: "التأكد من تفطن التلميذ لصيغة (It's high time the government enacted strict laws)."
      },
      {
        step: 3,
        stepNameAr: "التطبيق المحاكي لتمارين البكالوريا",
        stepNameEn: "BAC Drill: Sentence Re-writing",
        duration: 20,
        teacherRoleAr: "إعطاء 4 أزواج من الجمل تبدأ بـ (Sentence B) لإعادة الصياغة مع تتبع خطوات الحل الفردي.",
        learnerRoleAr: "إعادة كتابة الجمل فردياً في الدفتر ثم تصحيح على السبورة بالألوان التمييزية.",
        pedagogicalAimsAr: "تثبيت المهارة الإجرائية لامتحان البكالوريا.",
        formativeCheckpointAr: "نسبة النجاح لا تقل عن 85% في الفوج."
      },
      {
        step: 4,
        stepNameAr: "المهمة الإدماجية المصغرة",
        stepNameEn: "Mini-Production Task",
        duration: 15,
        teacherRoleAr: "توجيه التلاميذ لكتابة نصائح لمدير شركة اكتشف رشوة في قسم الصفقات العمومية.",
        learnerRoleAr: "صياغة 3 توصيات مستعملين: (It's high time..., I wish businessmen would..., Had they been honest...).",
        pedagogicalAimsAr: "القدرة على توظيف القاعدة في موقف تواصلي ذي معنى.",
        formativeCheckpointAr: "سلامة الإملاء وتطابق البنية النحوية."
      }
    ],
    googleDocTemplateTitle: "جذاذة تربوية — 3AS English: Unit 2 Ethics in Business",
    googleSlidePresentationTitle: "عرض الشرائح التعليمي — Ethics in Business & Fighting Corruption",
    googleSheetRubricTitle: "شبكة المتابعة الجزائية للوحدة الثانية — BAC Prep"
  },

  // ==========================================
  // ENGLISH - MIDDLE 4AM (BEM PREP)
  // ==========================================
  {
    id: "lp-4am-eng-01",
    cycle: "middle",
    cycleNameAr: "التعليم المتوسط",
    gradeId: "4am",
    gradeNameAr: "السنة الرابعة متوسط (4AM شهادة BEM)",
    streamNameAr: "التعليم العام الإلزامي",
    subjectId: "english",
    subjectNameAr: "اللغة الإنجليزية",
    subjectNameEn: "English",
    unitSequence: "Sequence 1: Me, My Country and the World",
    unitSequenceEn: "Outstanding Figures & Algerian Heritage Sites",
    rubricRubrique: "I Listen & Do / I Pronounce (Diphthongs)",
    lessonTitleAr: "وصف المعالم التاريخية الجزائرية والشخصيات البارزة (The Passive Voice in Historical Context)",
    lessonTitleEn: "Describing Algerian Landmarks & Outstanding Historical Figures Using Passive Voice",
    durationMinutes: 60,
    terminalCompetencyAr: "القدرة على إنتاج فقرة وصفية للتعريف بمعلم تاريخي جزائري (مقام الشهيد، قصبة الجزائر، قصر المشور) لكتيب سياحي مدرسي.",
    targetedCompetencyEn: "Learners will produce a structured descriptive brochure introducing a national historical landmark, detailing location, designer, construction date, and cultural value.",
    didacticMaterials: ["Map of Algeria with UNESCO Sites", "Short Video Clip on Maqam Echahid", "Flashcards of Architectural Terms"],
    stages: [
      {
        step: 1,
        stepNameAr: "التهيئة والانطلاق الصوتي",
        stepNameEn: "Warm-up & Cultural Hook",
        duration: 8,
        teacherRoleAr: "عرض صورة مجسم مقام الشهيد في الجزائر العاصمة: 'When was it built? Who was it designed by?'",
        learnerRoleAr: "الإجابة بالإنجليزية وتسمية معالم أخرى (Mansourah in Tlemcen, Santa Cruz in Oran, Casbah of Algiers).",
        pedagogicalAimsAr: "الربط بالهوية الوطنية وتعزيز الانتماء عبر اللغة الإنجليزية.",
        formativeCheckpointAr: "وضوح النطق الصوتي لمصطلح 'Monument' و 'Heritage'."
      },
      {
        step: 2,
        stepNameAr: "الاستماع النشط وتدوين الملاحظات",
        stepNameEn: "Listening & Active Information Transfer",
        duration: 14,
        teacherRoleAr: "تسميع تسجيل صوتي موجز (Listening Script p. 14) مرتين.",
        learnerRoleAr: "ملء بطاقة الهوية التذكارية (ID Fact-File: Landmark, Location, Architect, Date, Material).",
        pedagogicalAimsAr: "تطوير الإصغاء الانتقائي الموجه لاستخلاص الأرقام والأسماء.",
        formativeCheckpointAr: "مراجعة صحة معطيات بطاقة التعريف."
      },
      {
        step: 3,
        stepNameAr: "الاستقراء النحوي: المبني للمجهول (Passive Voice)",
        stepNameEn: "Grammar Elicitation: Passive Voice",
        duration: 15,
        teacherRoleAr: "مقارنة الجملتين: 'Bachir Yelles designed the monument' مقابل 'The monument was designed by Bachir Yelles'.",
        learnerRoleAr: "استنتاج القاعدة: (Subject + was/were + Past Participle of Verb + by + Agent).",
        pedagogicalAimsAr: "التركيز على المعلم كمركز للاهتمام بدلاً من الفاعل.",
        formativeCheckpointAr: "التصريف الصحيح لـ was/were حسب المفرد والجمع."
      },
      {
        step: 4,
        stepNameAr: "التدريب الموجه والمحاكاة",
        stepNameEn: "Guided Practice & Pair Work",
        duration: 13,
        teacherRoleAr: "توزيع بطاقات معالم (قصر المشور، تيمقاد، قلعة بني حماد) لتحويل بطاقات الهوية إلى جمل تامة.",
        learnerRoleAr: "العمل الثنائي وصياغة 4 جمل في المبني للمجهول في زمن الماضي البسيط.",
        pedagogicalAimsAr: "الطلاقة التعبيرية التحريرية.",
        formativeCheckpointAr: "الملاحظة التدوينية للأخطاء الشائعة في الـ Past Participle."
      },
      {
        step: 5,
        stepNameAr: "وضعية الإدماج والتقييم الذاتي",
        stepNameEn: "Autonomous Integration & Peer Feedback",
        duration: 10,
        teacherRoleAr: "تكليف التلاميذ بكتابة منشور ترويجي سياحي من 3 أسطر لصفحة النادي الثقافي بالمتوسطة.",
        learnerRoleAr: "كتابة المنشور، ثم تبادل الكراس مع الزميل للتصحيح المتبادل وفق شبكة المؤشرات.",
        pedagogicalAimsAr: "تعويد المتعلم على النقد البناء وتصحيح الذات.",
        formativeCheckpointAr: "التأكد من تضمين: الاسم، الموقع، سنة البناء، والمصمم."
      }
    ],
    googleDocTemplateTitle: "جذاذة تحضير درس — 4AM BEM English: Sequence 1 Heritage Landmarks",
    googleSlidePresentationTitle: "عرض بصري تفاعلي — Algerian Landmarks & UNESCO Heritage Sites",
    googleSheetRubricTitle: "شبكة تقييم الأداء التواصلي لمستوى الرابعة متوسط BEM"
  },

  // ==========================================
  // ENGLISH - PRIMARY 4AP / 5AP
  // ==========================================
  {
    id: "lp-4ap-eng-01",
    cycle: "primary",
    cycleNameAr: "التعليم الابتدائي",
    gradeId: "4ap",
    gradeNameAr: "السنة الرابعة ابتدائي (4AP)",
    streamNameAr: "التعليم الابتدائي التأسيسي",
    subjectId: "english",
    subjectNameAr: "اللغة الإنجليزية",
    subjectNameEn: "English",
    unitSequence: "Unit 1: Family and Friends",
    unitSequenceEn: "My Family Members & Daily Routines",
    rubricRubrique: "Oral Interaction & Vocabulary Building",
    lessonTitleAr: "التعريف بأفراد العائلة والمهن (Jobs and Family Relationships)",
    lessonTitleEn: "Introducing Family Members and Occupations with 'He is / She is a...'",
    durationMinutes: 45,
    terminalCompetencyAr: "التفاعل الشفهي البسيط باللغة الإنجليزية للتعريف بشجرة العائلة ومهنة الوالدين أمام زملائه في القسم.",
    targetedCompetencyEn: "Young learners will orally introduce members of their immediate family, identify occupations, and express basic appreciation with clear phonological output.",
    didacticMaterials: ["Finger Puppets of Family Members", "Picture Flashcards (Doctor, Teacher, Engineer, Farmer)", "Audio Chant: 'This is my happy family'"],
    stages: [
      {
        step: 1,
        stepNameAr: "النشيد الترحيبي والإحماء الحركي",
        stepNameEn: "Greeting & TPR Warm-up Chant",
        duration: 7,
        teacherRoleAr: "أداء النشيد الحركي 'Finger Family' ومطالبة التلاميذ بالترديد مع الإشارة بالأصابع.",
        learnerRoleAr: "الترديد الجماعي بحماس ومحاكاة الحركات (Daddy finger, Mommy finger, Brother, Sister, Baby).",
        pedagogicalAimsAr: "توفير مناخ تعلم آمن وتثبيت النطق السليم لمصطلحات القرابة.",
        formativeCheckpointAr: "ملاحظة نطق الصوت /ð/ في كلمة 'Father' و 'Mother'."
      },
      {
        step: 2,
        stepNameAr: "تقديم المفردات الجديدة بالبطاقات المصورة",
        stepNameEn: "Vocabulary Presentation with Flashcards",
        duration: 12,
        teacherRoleAr: "عرض بطاقات المهن: Teacher, Doctor, Police Officer, Nurse, Farmer وطرح السؤال: 'What is his job?'",
        learnerRoleAr: "الاستماع والتكرار الفردي والجماعي: 'He is a doctor. She is a teacher.'",
        pedagogicalAimsAr: "الربط البصري الصوتي المباشر دون ترجمة حرفية.",
        formativeCheckpointAr: "استعمال أداة النكرة 'a' قبل الحرف الساكن."
      },
      {
        step: 3,
        stepNameAr: "لعبة التخمين والممارسة الشفهية",
        stepNameEn: "Guessing Game & Total Physical Response",
        duration: 13,
        teacherRoleAr: "محاكاة حركة الطبيب أو المعلم ومطالبة التلاميذ بالتخمين: 'Is she a nurse?'",
        learnerRoleAr: "التلاميذ يرفعون بطاقات Yes / No والإجابة بصوت واضح: 'Yes, she is! / No, she isn't.'",
        pedagogicalAimsAr: "ترسيخ الجمل الاسمية البسيطة والجواب المختصر.",
        formativeCheckpointAr: "مشاركة جميع التلاميذ خاصة ذوي الخجل الدراسي."
      },
      {
        step: 4,
        stepNameAr: "الإنتاج في شجرة العائلة",
        stepNameEn: "Mini-Production: My Family Tree",
        duration: 13,
        teacherRoleAr: "توزيع رسم شجرة العائلة لتلوينها وتسمية الأفراد ومهنهم بملصق صغير.",
        learnerRoleAr: "تلوين الشجرة وكتابة الاسم والمهنة ثم تقديمها لزميل الطاولة: 'This is my father. He is an engineer.'",
        pedagogicalAimsAr: "الإدماج الحركي والكتابي البسيط.",
        formativeCheckpointAr: "تشجيع التلاميذ بملصقات تحفيزية نجمية."
      }
    ],
    googleDocTemplateTitle: "جذاذة نشاط اللغة الإنجليزية — 4AP: My Family and Jobs",
    googleSlidePresentationTitle: "عرض تفاعلي بالصور المتحركة — Family Members & Fun Jobs",
    googleSheetRubricTitle: "شبكة الملاحظة المستمرة للغة الإنجليزية — الطور الابتدائي 4AP"
  },

  // ==========================================
  // MATHEMATICS - SECONDARY 3AS (BAC)
  // ==========================================
  {
    id: "lp-3as-math-01",
    cycle: "secondary",
    cycleNameAr: "التعليم الثانوي",
    gradeId: "3as",
    gradeNameAr: "السنة الثالثة ثانوي (3AS بكالوريا)",
    streamNameAr: "شعبة علوم تجريبية + رياضيات + تقني رياضي",
    subjectId: "mathematics",
    subjectNameAr: "الرياضيات",
    subjectNameEn: "Mathematics",
    unitSequence: "المحور الأول: الدوال الأسية واللوغاريتمية",
    unitSequenceEn: "Exponential & Logarithmic Functions",
    rubricRubrique: "دراسة التغيرات والنهايات وحساب المشتقات المركبة",
    lessonTitleAr: "دراسة تغيرات دالة أسية تحتوي على مستقيم مقارب مائل وتفسير بياني لنقطة الانعطاف",
    lessonTitleEn: "Study of Exponential Function Variations, Slanted Asymptotes, and Inflexion Point Interpretation",
    durationMinutes: 60,
    terminalCompetencyAr: "التحكم في حل مسألة شاملة حول الدوال الأسية وفق منهجية البكالوريا الرسمية، وحساب المساحات والتكاملات المرتبطة بها.",
    targetedCompetencyEn: "Learners will analytically investigate exponential behavior, identify indeterminate limits using standard forms, and sketch the curve with asymptotic precision.",
    didacticMaterials: ["GeoGebra Interactive Curve Simulation", "Casio Scientific Calculator", "Graph Paper Sheets"],
    stages: [
      {
        step: 1,
        stepNameAr: "الاسترجاع النشط للنهايات الشهيرة",
        stepNameEn: "Active Recall: Classic Limits",
        duration: 8,
        teacherRoleAr: "كتابة 4 نهايات شهيرة على السبورة: lim (e^x / x) عند +∞، و lim (x.e^x) عند -∞ وطلب إكمالها على الألواح.",
        learnerRoleAr: "رفع الألواح المتزامنة وتدوين القيم الصحيحة مع التعليل الرياضي للتزايد المقارن.",
        pedagogicalAimsAr: "تصفية حالات اللبس في النهايات قبل الشروع في المسألة.",
        formativeCheckpointAr: "التفطن لإشارة الناتج عند -∞."
      },
      {
        step: 2,
        stepNameAr: "طرح الدالة المساعدة وحساب المشتقة",
        stepNameEn: "Auxiliary Function & First Derivative",
        duration: 15,
        teacherRoleAr: "طرح دالة مساعدة g(x) = (x-1)e^x + 1 وتبيان دورها في استنتاج إشارة مشتقة الدالة الرئيسية f'(x).",
        learnerRoleAr: "حساب g'(x)، وضع جدول إشارة g(x)، وتطبيق مبرهنة القيم المتوسطة (TVI) لإثبات وجود حل وحيد α.",
        pedagogicalAimsAr: "التمكن من هيكلية مسائل البكالوريا ذات الدالة المساعدة.",
        formativeCheckpointAr: "الدقة في صياغة شروط مبرهنة القيم المتوسطة: الاستمرار والرتابة التامة."
      },
      {
        step: 3,
        stepNameAr: "إثبات المستقيم المقارب المائل ودراسة الوضع النسبي",
        stepNameEn: "Slanted Asymptote & Relative Position",
        duration: 15,
        teacherRoleAr: "توجيه التلاميذ لحساب: lim [f(x) - (ax + b)] عندما يؤول x إلى +∞.",
        learnerRoleAr: "إزالة حالة عدم التعيين، استنتاج معادلة المقارب، ثم دراسة إشارة الفرق f(x) - y لتحديد الوضع النسبي.",
        pedagogicalAimsAr: "الربط بين الحساب الجبري والرؤية الهندسية للمنحنى (Cf).",
        formativeCheckpointAr: "التفريق بين فوق وتحت ونقطة التقاطع."
      },
      {
        step: 4,
        stepNameAr: "الإنتاج التشاركي ورسم المنحنى البياني",
        stepNameEn: "Collaborative Curve Sketching",
        duration: 14,
        teacherRoleAr: "عرض المنحنى عبر برنامج GeoGebra ومقارنته برسم التلاميذ على الورق الميليمتري.",
        learnerRoleAr: "رسم المقاربات، المماسات الأفقية، نقطة الانعطاف، والقيم الحدية ثم رسم المنحنى البياني بدقة.",
        pedagogicalAimsAr: "اكتساب الدقة الهندسية وضمان العلامة الكاملة في رسم المنحنى.",
        formativeCheckpointAr: "احترام المعلم المتعامد والمتجانس وسلم الرسم الموصى به."
      },
      {
        step: 5,
        stepNameAr: "التقويم الفردي وواجب التثبيت",
        stepNameEn: "Formative Wrap-up & BAC Homework",
        duration: 8,
        teacherRoleAr: "إعطاء سؤال المناقشة البيانية حسب قيم الوسيط الحقيقي m: f(x) = m.",
        learnerRoleAr: "تدوين استراتيجية المناقشة الأفقية والواجب المنزلي من حوليات البكالوريا السابقة.",
        pedagogicalAimsAr: "التحضير لأسئلة التميز في شهادة البكالوريا.",
        formativeCheckpointAr: "فهم كيفية الاستناد لجدول التغيرات."
      }
    ],
    googleDocTemplateTitle: "جذاذة بيداغوجية رياضيات — 3AS: دراسة الدوال الأسية والمنحنيات المقاربة",
    googleSlidePresentationTitle: "محاكاة جيوجبرا التفاعلية — Exponential Functions & Asymptotes",
    googleSheetRubricTitle: "سلم تنقيط حل مسألة الدوال في البكالوريا الجزائري"
  },

  // ==========================================
  // PHYSICS - SECONDARY 3AS (BAC)
  // ==========================================
  {
    id: "lp-3as-phys-01",
    cycle: "secondary",
    cycleNameAr: "التعليم الثانوي",
    gradeId: "3as",
    gradeNameAr: "السنة الثالثة ثانوي (3AS بكالوريا)",
    streamNameAr: "علوم تجريبية + تقني رياضي + رياضيات",
    subjectId: "physics",
    subjectNameAr: "العلوم الفيزيائية",
    subjectNameEn: "Physics",
    unitSequence: "الوحدة 1: المتابعة الزمنية لتحول كيميائي في وسط مائي",
    unitSequenceEn: "Kinetics & Chemical Monitoring in Aqueous Solutions",
    rubricRubrique: "النشاط المخبري والتحليل النظري",
    lessonTitleAr: "المتابعة الزمنية عن طريق قياس الناقلية وحساب سرعة التفاعل الابتدائية وزمن نصف التفاعل t1/2",
    lessonTitleEn: "Time Evolution via Conductometry: Reaction Rate & Half-Life Time Determination",
    durationMinutes: 60,
    terminalCompetencyAr: "توظيف طرائق المتابعة الزمنية (قياس الناقلية، المعايرة اللونية) واستغلال المنحنيات البيانية لتقدير السرعة وزمن نصف التفاعل.",
    targetedCompetencyEn: "Learners will calibrate conductivity probes, plot temporal concentration evolutions, determine instantaneous reaction rates, and deduce half-life parameters.",
    didacticMaterials: ["Conductivity Meter & Cell Probe", "Stock Solution of Ethyl Acetate & NaOH", "Magnetic Stirrer", "Chronometer"],
    stages: [
      {
        step: 1,
        stepNameAr: "الوضعية المشكلة والتحسيس المخبري",
        stepNameEn: "Experimental Context & Safety Warm-up",
        duration: 10,
        teacherRoleAr: "تذكير التلاميذ بقواعد السلامة الكيميائية في المخبر، ومراجعة علاقة كولروش: σ = Σ λi . [Xi].",
        learnerRoleAr: "تسمية الشوارد الحركية المتدخلة في تفاعل التصبن: Na+, OH-, CH3COO- ومقارنة الناقليات المولية الشاردية λ.",
        pedagogicalAimsAr: "تفسير سبب تناقص الناقلية النوعية للمزيج بمرور الزمن.",
        formativeCheckpointAr: "التفطن إلى أن الشاردة المتفاعلة OH- تستبدل بشاردة أقل ناقلية CH3COO-."
      },
      {
        step: 2,
        stepNameAr: "الإنجاز المخبري وتدوين القياسات",
        stepNameEn: "Hands-on Experimentation & Data Logging",
        duration: 20,
        teacherRoleAr: "الإشراف على الأفواج المخبرية (4 تلاميذ في كل فوج) أثناء مزج المحلولين وتشغيل المؤقت.",
        learnerRoleAr: "قراءة قيمة الناقلية النوعية σ(t) كل 30 ثانية وتدوين النتائج في جدول القياسات.",
        pedagogicalAimsAr: "اكتساب المهارات التجريبية الحركية وتفادي أخطاء القراءة المخبرية.",
        formativeCheckpointAr: "التأكد من الغمر الكامل للمسرى في الوسط التفاعلي دون ملامسة القضيب المغناطيسي."
      },
      {
        step: 3,
        stepNameAr: "الرسم البياني وتطبيق المماس لحساب السرعة",
        stepNameEn: "Graphical Analysis & Reaction Rate Computation",
        duration: 18,
        teacherRoleAr: "توجيه التلاميذ لرسم المنحنى σ(t) وحساب معامل توجيه المماس عند اللحظة t = 0 وعند t = 4 min.",
        learnerRoleAr: "رسم المماس، اختيار نقطتين متباعدتين، وحساب السرعة الحجمية للتفاعل: v = - (1 / V.λ_diff) . (dσ/dt).",
        pedagogicalAimsAr: "الربط الرياضي الفيزيائي بين المشتق وميل المماس.",
        formativeCheckpointAr: "استنتاج العوامل الحركية المؤثرة في تناقص السرعة (تناقص التراكيز المولية للمتفاعلات)."
      },
      {
        step: 4,
        stepNameAr: "تحديد زمن نصف التفاعل والاستنتاج الختامي",
        stepNameEn: "Half-life t1/2 & Evaluation",
        duration: 12,
        teacherRoleAr: "طرح السؤال النظري لتعريف t1/2: 'ما هي أهميته البيداغوجية في المقارنة بين التفاعلات؟'",
        learnerRoleAr: "حساب σ(t1/2) = (σ0 + σf) / 2، وإسقاطها بيانياً على محور الأزمنة لاستخراج قيمة t1/2 التجريبية.",
        pedagogicalAimsAr: "إتقان الطريقة الرسمية المعتمدة في تصحيح البكالوريا.",
        formativeCheckpointAr: "سلامة الوحدات الفيزيائية (S.m-1, mol.L-1.s-1)."
      }
    ],
    googleDocTemplateTitle: "تقرير العمل المخبري الرسمي — 3AS فيزياء: قياس الناقلية وسرعة التفاعل",
    googleSlidePresentationTitle: "عرض توثيقي — خطوات المتابعة الزمنية عن طريق الناقلية",
    googleSheetRubricTitle: "شبكة تقييم الأعمال التطبيقية المخبرية المعتمدة في الجزائر"
  },

  // ==========================================
  // ARABIC - MIDDLE 4AM / 1AS
  // ==========================================
  {
    id: "lp-4am-ara-01",
    cycle: "middle",
    cycleNameAr: "التعليم المتوسط",
    gradeId: "4am",
    gradeNameAr: "السنة الرابعة متوسط (4AM)",
    streamNameAr: "التعليم العام",
    subjectId: "arabic",
    subjectNameAr: "اللغة العربية وآدابها",
    subjectNameEn: "Arabic",
    unitSequence: "المقطع الأول: قضايا اجتماعية",
    unitSequenceEn: "Social Issues & Solidarity in Algerian Society",
    rubricRubrique: "فهم المنطوق وتذوق النص / النحو والصرف",
    lessonTitleAr: "التوكيد اللفظي والمعنوي وعطف النسق في النص الحجاجي",
    lessonTitleEn: "Verbal and Semantic Emphasis & Coordination in Argumentative Texts",
    durationMinutes: 60,
    terminalCompetencyAr: "إنتاج نص حجاجي مبرهن يدعو إلى التكافل الاجتماعي ونبذ الآفات الاجتماعية مدعماً بروابط الحجاج وأساليب التوكيد.",
    targetedCompetencyEn: "Learners will construct coherent persuasive argumentative discourses addressing community solidarity using rhetorical and coordinating emphasis.",
    didacticMaterials: ["نص معتمد من الكتاب المدرسي", "قصاصات نصية لأمثلة شواهد التوكيد", "السبورة المنسقة"],
    stages: [
      {
        step: 1,
        stepNameAr: "وضعية الانطلاق واستحضار التوابع",
        stepNameEn: "Hook & Grammar Recall",
        duration: 8,
        teacherRoleAr: "كتابة جملة مشوقة: 'حضر المديرُ، بل حضر المديرُ نفسُه'. ومطالبة التلاميذ بتبيان أثر اللفظ الزائد.",
        learnerRoleAr: "استنتاج أن 'نفسه' أزالت الشك ورفعت احتمال المجاز أو السهو.",
        pedagogicalAimsAr: "تنشيط مفهوم التوابع في اللسان العربي.",
        formativeCheckpointAr: "ضبط حركة الإعراب للتابع والمتبوع."
      },
      {
        step: 2,
        stepNameAr: "الملاحظة والتحليل الاستقرائي",
        stepNameEn: "Discovery & Structural Analysis",
        duration: 18,
        teacherRoleAr: "استخراج الشواهد من النص الحجاجي وتصنيفها في جدول: توكيد لفظي (تكرار الكلمة/الجملة) وتوكيد معنوي (نفس، عين، كل، جميع، كلا، كلتا).",
        learnerRoleAr: "تحديد المؤكد، لفظ التوكيد، والضمير العائد على المؤكد المطابق له جنساً وعدداً.",
        pedagogicalAimsAr: "استنباط القاعدة الصرفية النحوية بأمانة لغوية.",
        formativeCheckpointAr: "الانتباه لشروط إعراب 'كلا وكلتا' إعراب المثنى عند اتصالهما بالضمير."
      },
      {
        step: 3,
        stepNameAr: "التدريب والتطبيق التمييزي",
        stepNameEn: "Guided Drills & Sentence Transformation",
        duration: 20,
        teacherRoleAr: "عرض تمرين يحاكي أسئلة شهادة التعليم المتوسط (BEM): 'أعرب ما تحته خط، وحول التوكيد اللفظي إلى معنوي'.",
        learnerRoleAr: "الإعراب التام المفصل في الكراس والتدرب على الحالات الخاصة.",
        pedagogicalAimsAr: "التمكن من الإعراب الصحيح الخالي من الخلط مع البدل أو النعت.",
        formativeCheckpointAr: "تصحيح عينات التلاميذ الفردية فورياً."
      },
      {
        step: 4,
        stepNameAr: "الإنتاج الكتابي التواصلي",
        stepNameEn: "Expressive Integration & Argumentation",
        duration: 14,
        teacherRoleAr: "مطالبة الأفواج بصياغة 3 جمل حجاجية في التوعية بمساعدة الأسر المعوزة موظفين توكيداً معنوياً وعطف نسق.",
        learnerRoleAr: "كتابة الفقرة وإلقاؤها جهرياً بمراعاة مخارج الحروف والوقف المناسب.",
        pedagogicalAimsAr: "استثمار القاعدة النحوية لخدمة المقصد البلاغي والتواصلي.",
        formativeCheckpointAr: "تقييم جودة الصياغة وسلامة الربط."
      }
    ],
    googleDocTemplateTitle: "جذاذة تربوية رسمية لغة عربية — 4AM: التوكيد وأساليب الحجاج",
    googleSlidePresentationTitle: "لوحات توضيحية — التوكيد اللفظي والمعنوي وشواهد البلاغة",
    googleSheetRubricTitle: "شبكة تقويم الإنتاج الكتابي لامتحان شهادة التعليم المتوسط BEM"
  },

  // ==========================================
  // PHILOSOPHY - SECONDARY 3AS (BAC)
  // ==========================================
  {
    id: "lp-3as-phil-01",
    cycle: "secondary",
    cycleNameAr: "التعليم الثانوي",
    gradeId: "3as",
    gradeNameAr: "السنة الثالثة ثانوي (3AS بكالوريا)",
    streamNameAr: "شعبة آداب وفلسفة + لغات أجنبية",
    subjectId: "philosophy",
    subjectNameAr: "الفلسفة",
    subjectNameEn: "Philosophy",
    unitSequence: "الإشكالية الأولى: في إدراك العالم الخارجي",
    unitSequenceEn: "Perception & Conception in External World Awareness",
    rubricRubrique: "بناء مقالة فلسفية بالمقارنة أو الجدل",
    lessonTitleAr: "الإحساس والإدراك: هل الإدراك نابع من العقل أم من معطيات الحواس والتجربة الحسية؟",
    lessonTitleEn: "Sensation & Perception: Rationalist vs. Empiricist & Gestalt Perspectives",
    durationMinutes: 60,
    terminalCompetencyAr: "التحكم المنهجي في تحرير مقالة فلسفية جدلية متكاملة (طرح المشكلة، محاولة حل المشكلة، حل المشكلة) وفق المعايير الرسمية للبكالوريا.",
    targetedCompetencyEn: "Learners will construct a dialectical philosophical essay evaluating the rationalist, empiricist, and gestalt approaches to sensory perception.",
    didacticMaterials: ["Gestalt Illusion Diagrams (Rubin Vase, Kanizsa Triangle)", "Selected Excerpts of Descartes & Hume", "Methodological BAC Matrix"],
    stages: [
      {
        step: 1,
        stepNameAr: "الوضعية المشكلة الفلسفية",
        stepNameEn: "Philosophical Paradox & Hook",
        duration: 10,
        teacherRoleAr: "عرض خدعة بصرية مشهورة (العصا المغمورة في الماء تبدو مكسورة رغم استقامتها): 'إذا كانت الحواس تخدعنا، فكيف نثق في إدراكنا للعالم؟'",
        learnerRoleAr: "المناقشة الحرة وتحديد التناقض بين الانطباع الحسي الخام والحكم العقلي المنظم.",
        pedagogicalAimsAr: "القدرة على نقل المشاهدة العادية إلى إشكال فلسفي جوهري.",
        formativeCheckpointAr: "ضبط المفاهيم بدقة: التمييز الفلسفي بين الإحساس (Sensation) والإدراك (Perception)."
      },
      {
        step: 2,
        stepNameAr: "عرض الأطروحة الأولى (المذهب العقلي)",
        stepNameEn: "Thesis 1: Rationalist Argumentation (Descartes, Alain)",
        duration: 15,
        teacherRoleAr: "تحليل موقف ديكارت وألان: 'الإدراك حكم عقلي ناتج عن تأويل المعطيات الحسية المنفصلة' والاستشهاد بمثال قطعة الشمع.",
        learnerRoleAr: "استخراج الحجج والبراهين العقلية وتدوين أقوال الفلاسفة ونقد الأطروحة (إهمال دور الحواس والجسد).",
        pedagogicalAimsAr: "التدرب على الاستدلال الفلسفي المؤسس وبناء الحجج.",
        formativeCheckpointAr: "سلامة صياغة النقد المنهجي دون تجريح."
      },
      {
        step: 3,
        stepNameAr: "عرض نقيض الأطروحة (المذهب الحسي والجشتالتي)",
        stepNameEn: "Antithesis: Empiricist & Gestalt Theories",
        duration: 15,
        teacherRoleAr: "عرض موقف جون لوك ودافيد هيوم والمدرسة الجشتالتية (الشكل والأرضية، قوانين الانتظام).",
        learnerRoleAr: "توضيح فكرة أن 'العقل صفحة بيضاء والتجربة هي التي تخط عليها المعارف' وتدعيمها بأمثلة ونقدها.",
        pedagogicalAimsAr: "التوازن الفكري ومقارعة الحجة بالحجة المقابلة.",
        formativeCheckpointAr: "التحقق من فهم قانون الصيغة الكلية في الجشتالت."
      },
      {
        step: 4,
        stepNameAr: "التركيب والتجاوز وحل المشكلة",
        stepNameEn: "Synthesis & Resolution",
        duration: 12,
        teacherRoleAr: "بناء الموقف التركيبي التكاملي (النزعة النقدية عند كانط أو الظاهراتية عند ميرلوبونتي).",
        learnerRoleAr: "استخلاص أن 'الحدوس الحسية بدون مفاهيم عقلية عمياء، والمفاهيم العقلية بدون حدوس حسية جوفاء' وتدوين الخاتمة الإجماعية.",
        pedagogicalAimsAr: "الخروج من مأزق الجدل الثنائي إلى رؤية فلسفية جامعة ناضجة.",
        formativeCheckpointAr: "الانسجام المنطقي بين طرح الإشكال والخاتمة."
      },
      {
        step: 5,
        stepNameAr: "التطبيق المنهجي وتصحيح سلم التنقيط",
        stepNameEn: "BAC Rubric Calibration",
        duration: 8,
        teacherRoleAr: "عرض شبكة تنقيط المقالة في البكالوريا (4 نقاط للمقدمة، 12 نقطة للعرض، 4 نقاط للخاتمة).",
        learnerRoleAr: "التلاميذ يراجعون مقدمات زملائهم وفق المؤشرات: التمهيد، الإشارة للعناد الفلسفي، وإعادة صياغة السؤال.",
        pedagogicalAimsAr: "الوعي بمعايير التصحيح الوزاري المعتمد.",
        formativeCheckpointAr: "تجنب المقدمات الجاهزة المبتذلة."
      }
    ],
    googleDocTemplateTitle: "مخطط مقالة فلسفية معتمدة — 3AS: الإحساس والإدراك وفق منهجية البكالوريا",
    googleSlidePresentationTitle: "شرائح فلسفية تفاعلية — مناظرة العقلانيين والتجريبيين في الإدراك",
    googleSheetRubricTitle: "شبكة تنقيط وتقويم المقالة الفلسفية في شهادة البكالوريا"
  },
  // ==========================================
  // NATURAL SCIENCES - SECONDARY 3AS (BAC PREP)
  // ==========================================
  {
    id: "lp-3as-sci-01",
    cycle: "secondary",
    cycleNameAr: "التعليم الثانوي",
    gradeId: "3as",
    gradeNameAr: "السنة الثالثة ثانوي (3AS بكالوريا)",
    streamNameAr: "شعبة علوم تجريبية + رياضيات",
    subjectId: "natural_sciences",
    subjectNameAr: "علوم الطبيعة والحياة",
    subjectNameEn: "Natural Sciences",
    unitSequence: "الوحدة 02: التخصص الوظيفي للبروتينات في الدفاع عن الذات",
    unitSequenceEn: "Unit 2: Functional Protein Specificity in Immunity",
    rubricRubrique: "المناعة الخلطية والخلوية / الذات واللاذات",
    lessonTitleAr: "آلية الانتقاء النسيلي للخلايا اللمفاوية LB وإنتاج الأجسام المضادة النوعية",
    lessonTitleEn: "Clonal Selection of B Lymphocytes & Specific Antibody Synthesis",
    durationMinutes: 60,
    terminalCompetencyAr: "تفسير آليات الاستجابة المناعية النوعية الخلطية بالاعتماد على معطيات تجريبية ووثائق مجهرية وربط بنية الأجسام المضادة بتخصصها الوظيفي.",
    targetedCompetencyEn: "Learners analyze experimental curves of primary vs. secondary immune responses and elucidate the role of antigen-presenting cells and helper T-cells in B-cell proliferation.",
    didacticMaterials: ["المنهاج الرسمي والوثيقة المرافقة", "جهاز العرض الرقمي (Data Show)", "منحنيات تطور تركيز الغلوبولينات المناعية في المصل", "مجسم بنية الجسم المضاد IgG (سلاسل ثقيلة وخفيفة ومواقع التثبيت)"],
    stages: [
      {
        step: 1,
        stepNameAr: "وضعية الانطلاق واسترجاع المكتسبات",
        stepNameEn: "Engagement & Retrieval",
        duration: 8,
        teacherRoleAr: "طرح تساؤل إشكالي: كيف يميز الجهاز المناعي بين آلاف المولدات الغريبة المختلفة وينتج استجابة موجهة لكل منها بدقة متناهية؟",
        learnerRoleAr: "استرجاع مفهوم الخطوط الدفاعية ومفهوم محددات مولد الضد (Antigenic Determinants).",
        pedagogicalAimsAr: "حصر التساؤل حول سر التخصص النوعي المزدوج للأجسام المضادة.",
        formativeCheckpointAr: "القدرة على تعريف المستضد والتمييز بين المناعة اللانوعية والنوعية."
      },
      {
        step: 2,
        stepNameAr: "التحليل التجريبي والاستدلال العلمي",
        stepNameEn: "Experimental Analysis",
        duration: 18,
        teacherRoleAr: "توزيع نتائج تجارب معقدة: حقن فأر بمستضد Z ثم تعريضه للإشعاع وقياس تشكل معقدات مناعية (Antigen-Antibody Complexes).",
        learnerRoleAr: "تحليل المنحنيات خطوة بخطوة واستنتاج أن لكل نسيلة من LB مستقبلاً غشائياً نوعياً (BCR) يتطابق تكاملياً مع محدد المستضد.",
        pedagogicalAimsAr: "بناء مسار الاستدلال العلمي المؤطر وفق شبكة تقويم البكالوريا الجديدة.",
        formativeCheckpointAr: "الدقة في تفسير مراحل الاستجابة الأولية والثانوية من حيث السرعة والكمية."
      },
      {
        step: 3,
        stepNameAr: "التركيب الحركي والبيولوجي",
        stepNameEn: "Biological Synthesis",
        duration: 16,
        teacherRoleAr: "توجيه التلاميذ لرسم مخطط تحصيلي يوضح: الانتقاء، التكاثر، التمايز إلى بلازموسيت وخلايا ذات ذاكرة (LBm).",
        learnerRoleAr: "رسم المخطط البيداغوجي المعتمد مع تحديد دور الإنترلوكين 2 (IL-2) المفرز من الخلايا LT4.",
        pedagogicalAimsAr: "إدماج المعارف الجزئية في نموذج تفسيري كلي متناسق.",
        formativeCheckpointAr: "وضوح البيانات والأسهم الاتجاهية في المخطط التحصيلي."
      },
      {
        step: 4,
        stepNameAr: "التقويم التكويني والوضعية الإدماجية",
        stepNameEn: "Formative BAC Assessment",
        duration: 18,
        teacherRoleAr: "تقديم تمرين بكالوريا تجريبي (تمرين النمط الثاني 5 نقاط) حول عجز مناعي ناجم عن طفرة في الجين المشفر لموقع ارتباط المستضد.",
        learnerRoleAr: "صياغة نص علمي مهيكل (مقدمة، عرض، خاتمة) يربط الطفرة بتعطل تشكل المعقد المناعي وبلعمة المستضد.",
        pedagogicalAimsAr: "التحكم في معايير صياغة النص العلمي الدقيق والمفردات الاصطلاحية.",
        formativeCheckpointAr: "احترام منهجية الاستدلال العلمي والربط السببي المباشر."
      }
    ],
    googleDocTemplateTitle: "جذاذة ديداكتيكية رسمية — علوم الطبيعة والحياة 3AS: الانتقاء النسيلي والمناعة الخلطية",
    googleSlidePresentationTitle: "عرض تفاعلي عالي الدقة — حركية الاستجابة المناعية وبنية الجسم المضاد",
    googleSheetRubricTitle: "شبكة تقييم معايير الاستدلال العلمي وحل المشكلات البيداغوجية"
  },
  // ==========================================
  // ISLAMIC EDUCATION - SECONDARY 3AS (BAC PREP)
  // ==========================================
  {
    id: "lp-3as-isl-01",
    cycle: "secondary",
    cycleNameAr: "التعليم الثانوي",
    gradeId: "3as",
    gradeNameAr: "السنة الثالثة ثانوي (3AS بكالوريا)",
    streamNameAr: "جميع الشعب العلمية والأدبية والتقنية",
    subjectId: "islamic_education",
    subjectNameAr: "العلوم الإسلامية",
    subjectNameEn: "Islamic Education",
    unitSequence: "الوحدة 03: مقاصد الشريعة الإسلامية وحفظ الكليات الخمس",
    unitSequenceEn: "Unit 3: Objectives of Islamic Sharia (Maqasid)",
    rubricRubrique: "الفكر الإسلامي والتشريع الأخلاقي والقيمي",
    lessonTitleAr: "مقاصد الشريعة الإسلامية: الضروريات، الحاجيات، والتحسينيات وطرق حفظ الكليات الخمس",
    lessonTitleEn: "Objectives of Sharia: Necessities, Needs, Embellishments & Preserving Essentials",
    durationMinutes: 60,
    terminalCompetencyAr: "إدراك الغايات التشريعية للأحكام الشرعية والقدرة على تصنيف الأحكام الواقعية المعاصرة وفق سلم المقاصد وترتيب الكليات الخمس.",
    targetedCompetencyEn: "Learners classify contemporary scenarios into the three tiers of Maqasid and articulate how Sharia protects the five universals from existence and non-existence angles.",
    didacticMaterials: ["الكتاب المدرسي المعتمد للعلوم الإسلامية 3AS", "جدول مقارن للكليات الخمس (الدين، النفس، العقل، النسل، المال)", "أمثلة ونوازل فقهية معاصرة (التبرع بالأعضاء، الرقمنة المالية)"],
    stages: [
      {
        step: 1,
        stepNameAr: "مدخل إشكالي واستثارة فكرية",
        stepNameEn: "Problematic Introduction",
        duration: 8,
        teacherRoleAr: "طرح التساؤل: هل شرعت الأحكام والواجبات والمحرمات عبثاً أم لتحقيق مصالح معتبرة للعباد في المعاش والمعاد؟",
        learnerRoleAr: "استنتاج تعريف المقاصد لغة واصطلاحاً (الغايات والأهداف والحكم التي قصدها الشارع الحكيم).",
        pedagogicalAimsAr: "غرس الفهم العميق لرحمة التشريع وتوازن مقاصده.",
        formativeCheckpointAr: "التمييز بين المقصد العام والعلة الجزئية للحكم."
      },
      {
        step: 2,
        stepNameAr: "بناء المفاهيم: مراتب المقاصد وترتيب الكليات",
        stepNameEn: "Conceptual Hierarchy",
        duration: 22,
        teacherRoleAr: "شرح المراتب الثلاث: الضروريات (فقدها يسبب اختلال نظام الحياة)، الحاجيات (رفع الحرج والمشقة)، والتحسينيات (محاسن العادات ومكارم الأخلاق).",
        learnerRoleAr: "ملء الجدول المقارن بأمثلة دقيقة: حفظ النفس (تحريم القتل قصاصاً / الرخص عند المشقة / آداب الأكل والشرب).",
        pedagogicalAimsAr: "التمكن من تحديد طرق الحفظ: من جانب الوجود (الإيجاد والتثبيت) ومن جانب العدم (الدرء والدفاع).",
        formativeCheckpointAr: "الترتيب الدقيق للكليات عند التعارض: تقديم الدين ثم النفس ثم العقل ثم النسل ثم المال."
      },
      {
        step: 3,
        stepNameAr: "التحليل الاستدلالي وحل الإشكاليات الواقعية",
        stepNameEn: "Practical Dilemma Analysis",
        duration: 15,
        teacherRoleAr: "تقديم حالات واقعية: مسألة التداوي بالمحرم عند الضرورة القصوى لإنقاذ حياة مريض، أين يقع في سلم المقاصد؟",
        learnerRoleAr: "تطبيق قاعدة الضرورات تبيح المحظورات وترتيب حفظ النفس عند الهلاك الحتمي.",
        pedagogicalAimsAr: "ربط الفكر المقاصدي بالمسؤولية الأخلاقية والاجتماعية في المجتمع الجزائري.",
        formativeCheckpointAr: "الاستدلال السليم بالآيات الكريمة والأحاديث النبوية المقررة."
      },
      {
        step: 4,
        stepNameAr: "التقويم الختامي وتثبيت المؤشرات",
        stepNameEn: "Consolidation & BAC Rubric",
        duration: 15,
        teacherRoleAr: "إعطاء سند من أسئلة البكالوريا: تصنيف 6 أحكام شرعية واستخراج الكلية ومستوى الحفظ.",
        learnerRoleAr: "الحل الفردي والتصحيح الذاتي وفق دليل التصحيح النموذجي.",
        pedagogicalAimsAr: "ضمان علامة كاملة في جزئية المقاصد في اختبار البكالوريا.",
        formativeCheckpointAr: "تجنب الخلط الشائع بين الحاجيات والتحسينيات."
      }
    ],
    googleDocTemplateTitle: "جذاذة تربوية رسمية — العلوم الإسلامية 3AS: مقاصد الشريعة الإسلامية وتطبيقاتها",
    googleSlidePresentationTitle: "عرض بيداغوجي تفاعلي — خريطة ذهنية شاملة للكليات الخمس وسلم المقاصد",
    googleSheetRubricTitle: "سلم تنقيط إجابات العلوم الإسلامية وفق معايير التفتيش الوزاري"
  },
  // ==========================================
  // HISTORY & GEOGRAPHY - SECONDARY 3AS (BAC PREP)
  // ==========================================
  {
    id: "lp-3as-hg-01",
    cycle: "secondary",
    cycleNameAr: "التعليم الثانوي",
    gradeId: "3as",
    gradeNameAr: "السنة الثالثة ثانوي (3AS بكالوريا)",
    streamNameAr: "جميع الشعب (مع التركيز لشعبة آداب وفلسفة وتسيير واقتصاد)",
    subjectId: "history_geo",
    subjectNameAr: "التاريخ والجغرافيا",
    subjectNameEn: "History & Geography",
    unitSequence: "الوحدة 02: العمل المسلح ورد فعل الاستعمار (1954-1962)",
    unitSequenceEn: "Unit 2: The Algerian Armed Revolution & Colonial Responses",
    rubricRubrique: "استراتيجية الثورة داخلياً وخارجياً ومؤتمر الصومام 1956",
    lessonTitleAr: "استراتيجية الثورة التحريرية الجزائرية على المستوى الداخلي والخارجي ومخططات الاستعمار الفاشلة",
    lessonTitleEn: "Algerian War of Independence: Internal & External Strategies and Colonial Counter-Measures",
    durationMinutes: 60,
    terminalCompetencyAr: "التحكم في معالم الثورة التحريرية وقراءة الخرائط التاريخية واستخلاص البعد الدبلوماسي والعسكري لمؤتمر الصومام وهجمات الشمال القسنطيني.",
    targetedCompetencyEn: "Learners evaluate the multidimensional strategies of the FLN/ALN, the impact of the Soummam Congress (1956), and colonial containment projects like Challe and Morice lines.",
    didacticMaterials: ["خريطة الجزائر التاريخية وتقسيم الولايات العسكرية الست", "وثيقة ميثاق الصومام 20 أوت 1956", "أطلس التاريخ الوطني للجزائر", "وثائق صور لخط موريس وخط شال المكهربين"],
    stages: [
      {
        step: 1,
        stepNameAr: "الربط التاريخي والتمهيد الزمني",
        stepNameEn: "Historical Anchoring",
        duration: 8,
        teacherRoleAr: "تحديد السياق التاريخي: كيف انتقلت الثورة من مرحلة الانطلاق والانتشار الصعب إلى مرحلة التنظيم والشمولية؟",
        learnerRoleAr: "تذكر محطات: نداء أول نوفمبر 1954، هجمات الشمال القسنطيني 20 أوت 1955 بقيادة زيغود يوسف وفك الحصار عن الأوراس.",
        pedagogicalAimsAr: "ترسيخ التسلسل الكرونولوجي الدقيق للأحداث المصيرية.",
        formativeCheckpointAr: "تحديد نتائج هجمات الشمال القسنطيني داخلياً وخارجياً."
      },
      {
        step: 2,
        stepNameAr: "تحليل استراتيجية الثورة داخلياً وخارجياً",
        stepNameEn: "Document & Strategy Analysis",
        duration: 22,
        teacherRoleAr: "تقسيم القسم إلى أفواج عمل: فوج 1 (التنظيم العسكري وتأسيس جيش التحرير)، فوج 2 (التنظيم السياسي ومؤسسات الثورة CNRA / CCE)، فوج 3 (العمل الدبلوماسي وتدويل القضية في الأمم المتحدة وباندونغ).",
        learnerRoleAr: "استقراء نصوص ميثاق الصومام واستخراج قرارات: أولوية الداخل على الخارج، وأولوية السياسي على العسكري، وتقسيم التراب الوطني إلى 6 ولايات عسكرية.",
        pedagogicalAimsAr: "التمكن من توظيف المصطلحات والشخصيات والمفاهيم الجوهرية للبكالوريا.",
        formativeCheckpointAr: "الربط بين إضراب الثمانية أيام (1957) والاعتراف الدولي بحق الشعب الجزائري في تقرير المصير."
      },
      {
        step: 3,
        stepNameAr: "استراتيجية الاستعمار للقضاء على الثورة وإخفاقها",
        stepNameEn: "Colonial Counter-Strategies Failure",
        duration: 15,
        teacherRoleAr: "عرض وتحليل المخططات الاستعمارية: عسكرياً (خطا شال وموريس، المحتشدات، المناطق المحرمة) وسياسياً/اقتصادياً (مشروع قسنطينة الإغرائي 1958، سلم الشجعان المزعوم).",
        learnerRoleAr: "استنتاج أسباب فشل كل المخططات الاستعمارية بفضل الالتفاف الشعبي العارم ومظاهرات 11 ديسمبر 1960 ومظاهرات 17 أكتوبر 1961 بباريس.",
        pedagogicalAimsAr: "إبراز عبقرية الثورة الجزائرية كنموذج رائد لحركات التحرر العالمية.",
        formativeCheckpointAr: "القدرة على نقد مشاريع ديغول التضليلية بالأدلة التاريخية القطعية."
      },
      {
        step: 4,
        stepNameAr: "التدريب على مقال تاريخي وفق معايير البكالوريا",
        stepNameEn: "BAC History Essay Training",
        duration: 15,
        teacherRoleAr: "طرح إشكالية المقال: 'بينما راهنت فرنسا الاستعمارية على عزل الثورة بالأسلاك المكهربة والمشاريع الإغرائية، ردت قيادة الثورة بتنظيم مؤسساتي واختراق دبلوماسي حاسم'. اكتب مقالاً من مقدمة وعرض وخاتمة.",
        learnerRoleAr: "كتابة عناصر العرض بنقاط واضحة ومعللة ومؤرخة بدقة.",
        pedagogicalAimsAr: "ضمان المنهجية الصارمة للمقال التاريخي وتجنب السرد العشوائي.",
        formativeCheckpointAr: "تطابق المقدمة مع التساؤلين، وعدم الخروج عن الموضوع."
      }
    ],
    googleDocTemplateTitle: "مذكرة بيداغوجية معتمدة — تاريخ 3AS: استراتيجية الثورة التحريرية وردود فعل الاستعمار",
    googleSlidePresentationTitle: "أطلس رقمي وخرائط تاريخية — مسار الثورة الجزائرية ومؤتمر الصومام 1956",
    googleSheetRubricTitle: "شبكة تصحيح المقال وتواريخ وشخصيات التاريخ والجغرافيا في البكالوريا"
  },
  // ==========================================
  // FRENCH LANGUAGE - SECONDARY 3AS (BAC PREP)
  // ==========================================
  {
    id: "lp-3as-fra-01",
    cycle: "secondary",
    cycleNameAr: "التعليم الثانوي",
    gradeId: "3as",
    gradeNameAr: "السنة الثالثة ثانوي (3AS بكالوريا)",
    streamNameAr: "جميع الشعب (آداب ولغات وعلمي)",
    subjectId: "french",
    subjectNameAr: "اللغة الفرنسية",
    subjectNameEn: "French",
    unitSequence: "Projet 1: Le texte d'histoire / Le fait d'histoire",
    unitSequenceEn: "Project 1: Historical Text & War of Liberation Testimonies",
    rubricRubrique: "La visée communicative et la modalisation dans le témoignage historique",
    lessonTitleAr: "النص التاريخي والشهادة: المؤشرات اللغوية للذاتية والهدف التواصلي (La visée informative et testimoniale)",
    lessonTitleEn: "Historical Text: Subjectivity Markers, Modalisation & Communicative Aim",
    durationMinutes: 60,
    terminalCompetencyAr: "تحليل نص تاريخي يوثق مرحلة من كفاح التحرير الوطني الجزائري واستخراج مؤشرات الحضور الذاتي للشاهد، وتلخيص النص بتقنية Compte rendu critique.",
    targetedCompetencyEn: "Learners identify modalities, lexical evaluation, and chronological connectors in a historical document, distinguishing between objective historiography and passionate personal testimony.",
    didacticMaterials: ["Texte support extrait de témoignages sur la Guerre d'Algérie (Mahfoud Kaddache ou Henri Alleg)", "Grille d'analyse du compte rendu objectif / critique", "Tableau blanc interactif"],
    stages: [
      {
        step: 1,
        stepNameAr: "Éveil de l'intérêt et mise en situation",
        stepNameEn: "Pre-reading & Context",
        duration: 8,
        teacherRoleAr: "Présentation du paratexte (Titre, auteur, source, date de publication). Questionnement sur le contexte de la Guerre d'Algérie.",
        learnerRoleAr: "Formulation d'hypothèses de sens à partir des indices périphériques et typographiques.",
        pedagogicalAimsAr: "Mobiliser les prérequis historiques pour anticiper le contenu lexical du document.",
        formativeCheckpointAr: "Identification correcte du statut de l'auteur (historien ou témoin oculaire)."
      },
      {
        step: 2,
        stepNameAr: "Lecture silencieuse et repérage sélectif",
        stepNameEn: "Guided Silent Reading",
        duration: 18,
        teacherRoleAr: "Consignes de repérage: relever les modalisateurs (lexique mélioratif/dépréciatif), les verbes de parole, et les repères spatio-temporels.",
        learnerRoleAr: "Lecture active, surlignage des passages de discours direct et des adverbes d'opinion exprimant la prise de position de l'énonciateur.",
        pedagogicalAimsAr: "Distinguer entre faits historiques avérés et commentaires subjectifs du narrateur.",
        formativeCheckpointAr: "Capacité à classer les indices d'énonciation dans le tableau proposé."
      },
      {
        step: 3,
        stepNameAr: "Analyse textuelle et visée communicative",
        stepNameEn: "Linguistic & Communicative Analysis",
        duration: 18,
        teacherRoleAr: "Animation du débat guidé sur la visée de l'auteur: informe-t-il simplement, ou rend-il hommage / dénonce-t-il les atrocités coloniales?",
        learnerRoleAr: "Démontrer que la visée est à la fois testimoniale et dénonciatrice en citant les arguments linguistiques clés du texte.",
        pedagogicalAimsAr: "Acquérir la rigueur d'argumentation exigée à l'épreuve de français du BAC.",
        formativeCheckpointAr: "Justification précise de la visée sans paraphrase superficielle."
      },
      {
        step: 4,
        stepNameAr: "Production écrite: Initiation au compte rendu objectif",
        stepNameEn: "Objective Summary Production",
        duration: 16,
        teacherRoleAr: "Rappel du canevas officiel du compte rendu objectif (accroche / présentation du document, puis résumé condensé des idées maîtresses à la 3ème personne).",
        learnerRoleAr: "Rédaction autonome du premier paragraphe d'introduction en respectant les verbes introducteurs (l'auteur relate, témoigne, dénonce...).",
        pedagogicalAimsAr: "Éliminer l'emploi du 'je' et maîtriser les règles de reformulation sans recopier les phrases intégrales du texte.",
        formativeCheckpointAr: "Respect du tiers de la longueur du texte initial et clarté de la syntaxe."
      }
    ],
    googleDocTemplateTitle: "Fiche pédagogique officielle — Français 3AS: Le texte d'histoire et la visée communicative",
    googleSlidePresentationTitle: "Support diaporama — Techniques du compte rendu objectif et critique au BAC",
    googleSheetRubricTitle: "Grille d'évaluation sommative de la compréhension de l'écrit et de la production écrite"
  },
  // ==========================================
  // PHYSICAL SCIENCES - MIDDLE 4AM (BEM PREP)
  // ==========================================
  {
    id: "lp-4am-phys-01",
    cycle: "middle",
    cycleNameAr: "التعليم المتوسط",
    gradeId: "4am",
    gradeNameAr: "السنة الرابعة متوسط (4AM شهادة التعليم المتوسط BEM)",
    subjectId: "physics",
    subjectNameAr: "العلوم الفيزيائية والتكنولوجيا",
    subjectNameEn: "Physics & Chemistry",
    unitSequence: "الميدان 01: المادة وتحولاتها",
    unitSequenceEn: "Field 1: Matter & Its Transformations",
    rubricRubrique: "المحاليل الشاردية والتحليل الكهربائي البسيط",
    lessonTitleAr: "التحليل الكهربائي البسيط لمحلول كلور القصدير (SnCl2) وانحفاظ المادة والشحنة",
    lessonTitleEn: "Simple Electrolysis of Tin Chloride Solution: Matter & Charge Conservation",
    durationMinutes: 60,
    terminalCompetencyAr: "تفسير هجرة الشوارد نحو المسريين (المصعد والمهبط) وكتابة المعادلات النصفية والإجمالية بالصيغتين الشاردية والإحصائية.",
    targetedCompetencyEn: "Learners operate an experimental electrolysis cell, deduce chemical reactions at anode/cathode, and formulate balanced ionic and molecular equations.",
    didacticMaterials: ["وعاء فولد ومسريان من الفحم الغرافيتي", "مولد تيار كهربائي مستمر (DC 6V-12V)", "مصباح وأسلاك توصيل وقاطعة", "محلول مائي لكلور القصدير (Sn2+ + 2Cl-)", "أوراق كاشف النيلة أو قلم رصاص للتجريب"],
    stages: [
      {
        step: 1,
        stepNameAr: "وضعية الانطلاق والمشاهدة العيانية",
        stepNameEn: "Experimental Engagement",
        duration: 10,
        teacherRoleAr: "غلق الدارة الكهربائية ومطالبة التلاميذ بتسجيل الملاحظات المباشرة بجوار كل مسرى (المهبط والمصعد).",
        learnerRoleAr: "ملاحظة توهج المصباح، تصاعد فقاعات غازية مخضرة عند المصعد (غاز الكلور Cl2)، وترسب شعيرات معدنية فضية عند المهبط (معدن القصدير Sn).",
        pedagogicalAimsAr: "ربط الظاهرة الميكروسكوبية غير المرئية بالمؤشرات الماكروسكوبية المحسوسة.",
        formativeCheckpointAr: "التمييز الدقيق بين المسرى الموصول بالقطب الموجب (المصعد) والمسرى الموصول بالقطب السالب (المهبط)."
      },
      {
        step: 2,
        stepNameAr: "التفسير المجهري لحركة الشوارد",
        stepNameEn: "Microscopic Ionic Interpretation",
        duration: 20,
        teacherRoleAr: "توجيه التفكير العلمي: إلى أين تتجه الشوارد الموجبة Sn2+؟ وإلى أين تتجه الشوارد السالبة Cl-؟ وماذا يحدث على سطح كل مسرى؟",
        learnerRoleAr: "استنتاج أن شوارد القصدير Sn2+ تنجذب نحو المهبط السالب لتكتسب إلكترونين وتتحول إلى ذرات قصدير، بينما شوارد الكلور Cl- تتجه نحو المصعد الموجب لتفقد إلكتروناتها وتتحول إلى جزيئات غاز الكلور.",
        pedagogicalAimsAr: "بناء الفهم الفيزيائي لانحفاظ الشحنة الكهربائية وانتقال الإلكترونات في السلك والشوارد في المحلول.",
        formativeCheckpointAr: "الاستيعاب الكامل لأن المسريين من الغرافيت لا يشاركان في التفاعل (تحليل كهربائي بسيط)."
      },
      {
        step: 3,
        stepNameAr: "النمذجة الرياضية والمعادلات الكيميائية",
        stepNameEn: "Chemical Equation Modeling",
        duration: 15,
        teacherRoleAr: "كتابة المعادلة النصفية عند المهبط: Sn2+ + 2e- -> Sn(s)، والمعادلة النصفية عند المصعد: 2Cl- -> Cl2(g) + 2e-.",
        learnerRoleAr: "جمع المعادلتين لاستخراج المعادلة الإجمالية بالصيغة الشاردية ثم بالصيغة الإحصائية: SnCl2(aq) -> Sn(s) + Cl2(g).",
        pedagogicalAimsAr: "إتقان موازنة الشحنات والكتل وتحديد الحالة الفيزيائية للمتفاعلات والنواتج.",
        formativeCheckpointAr: "تجنب نسيان رمز الحالة الفيزيائية (s, g, aq) في شهادة التعليم المتوسط."
      },
      {
        step: 4,
        stepNameAr: "التطبيق والتقويم التكويني لشهادة BEM",
        stepNameEn: "BEM Exam Drill",
        duration: 15,
        teacherRoleAr: "عرض تمرين نمطي من شهادات BEM السابقة: استبدال كلور القصدير بكلور الزنك (ZnCl2) أو كلور النحاس (CuCl2).",
        learnerRoleAr: "الحل المستقل وكتابة المعادلات التنبؤية والتأكد من تطابق الملاحظات التجريبية.",
        pedagogicalAimsAr: "تعميم المبدأ على كافة الأملاح والكلوريدات الشاردية المقررة في منهاج الجيل الثاني.",
        formativeCheckpointAr: "السرعة والدقة في توظيف كاشف غاز الكلور (زوال لون ماء جافيل أو النيلة)."
      }
    ],
    googleDocTemplateTitle: "جذاذة مخبرية ودرس نموذجي — فيزياء 4AM: التحليل الكهربائي البسيط وفق منهاج الجيل الثاني",
    googleSlidePresentationTitle: "محاكاة ثلاثية الأبعاد متحركة — هجرة الشوارد والتحليل الكهربائي البسيط",
    googleSheetRubricTitle: "شبكة تقييم التجارب المخبرية وحل التمارين لشهادة التعليم المتوسط BEM"
  },
  // ==========================================
  // MATHEMATICS - PRIMARY 5AP
  // ==========================================
  {
    id: "lp-5ap-math-01",
    cycle: "primary",
    cycleNameAr: "التعليم الابتدائي",
    gradeId: "5ap",
    gradeNameAr: "السنة الخامسة ابتدائي (5AP مرحلة التعليم الابتدائي)",
    subjectId: "mathematics",
    subjectNameAr: "الرياضيات",
    subjectNameEn: "Mathematics",
    unitSequence: "الميدان: الأعداد والحساب وتنظيم المعطيات",
    unitSequenceEn: "Numbers, Calculations & Data Organization",
    rubricRubrique: "التناسبية والجداول وحساب النسبة المئوية",
    lessonTitleAr: "التناسبية (1): التعرف على جدول تناسبية وحساب معامل التناسبية في حل وضعيات معيشية",
    lessonTitleEn: "Proportionality: Identifying Proportional Tables & Unit Rate Multipliers",
    durationMinutes: 45,
    terminalCompetencyAr: "القدرة على تمييز وضعية تناسبية من وضعية لا تناسبية، واستخراج معامل التناسبية لملء جداول عددية وحل مشكلات الحياة اليومية.",
    targetedCompetencyEn: "Primary pupils discern proportional relationships in daily shopping scenarios, calculate the constant multiplier, and complete missing tabular values accurately.",
    didacticMaterials: ["ألواح التلاميذ الفردية", "بطاقات مشكلات من واقع التلميذ (شراء كراريس، أسعار الفواكه، كميات الطبخ)", "جدول كبير مرسوم على السبورة"],
    stages: [
      {
        step: 1,
        stepNameAr: "الحساب الذهني ووضعية الانطلاق",
        stepNameEn: "Mental Math & Starter Scenario",
        duration: 8,
        teacherRoleAr: "حساب ذهني سريع (جداول الضرب في 4 و6 و8). ثم عرض المشكلة: 'ثمن 3 كراريس هو 120 دج، ما هو ثمن 6 كراريس؟ وثمن 9 كراريس؟'.",
        learnerRoleAr: "الإجابة الفورية على الألواح وتفسير طريقة الوصول إلى النتيجة (المضاعفة أو القسمة).",
        pedagogicalAimsAr: "تنشيط التفكير الحسابي وإثارة الرغبة في اكتشاف القاعدة العامة.",
        formativeCheckpointAr: "سلامة الحساب الذهني وتجنب أخطاء جدول الضرب البسيطة."
      },
      {
        step: 2,
        stepNameAr: "البحث والاستكشاف الجماعي",
        stepNameEn: "Collaborative Discovery",
        duration: 15,
        teacherRoleAr: "رسم الجدول وتنظيمه: السطر الأول (عدد الكراريس: 1، 3، 6، 9)، السطر الثاني (الثمن بالدينار الجزائري). التوجيه لاكتشاف ثمن الكراس الواحد (معامل التناسبية).",
        learnerRoleAr: "إجراء عملية القسمة: 120 ÷ 3 = 40 دج. استنتاج أن الانتقال من السطر الأول للثاني يتم بالضرب في 40، والعكس بالقسمة على 40.",
        pedagogicalAimsAr: "بناء المفهوم الرياضي لمعامل التناسبية كقيمة ثابتة لا تتغير.",
        formativeCheckpointAr: "التحقق من أن حاصل قسمة كل عدد من السطر الثاني على مقابله يعطي نفس النتيجة 40."
      },
      {
        step: 3,
        stepNameAr: "الاستخلاص والتعميم (أتعلم وأتدرب)",
        stepNameEn: "Concept Consolidation",
        duration: 12,
        teacherRoleAr: "صياغة خلاصة واضحة وبسيطة في دفتر الدروس وتحديد خصائص جدول التناسبية وخواص الخطية (الجمع والمضاعفة).",
        learnerRoleAr: "كتابة الخلاصة الملونة والمثال النموذجي، واكتشاف طرق بديلة للملء (جمع عمودين للحصول على الثالث).",
        pedagogicalAimsAr: "تثبيت المفاهيم بلغة رياضية مبسطة تتناسب مع سن تلميذ الابتدائي.",
        formativeCheckpointAr: "القدرة على كشف الجداول غير التناسبية (مثل العمر والوزن)."
      },
      {
        step: 4,
        stepNameAr: "الاستثمار وحل المشكلات الفردية",
        stepNameEn: "Independent Practice",
        duration: 10,
        teacherRoleAr: "تقديم نشاطين من كتاب الرياضيات: ملء جدول وصفة تحضير حلوى لـ 4 أفراد ثم لـ 8 و12 فرداً.",
        learnerRoleAr: "الإنجاز الفردي في كراس المحاولات مع المتابعة الفورية والتصحيح على السبورة بالتعزيز اللفظي الإيجابي.",
        pedagogicalAimsAr: "ترسيخ الثقة بالنفس والقدرة على تطبيق الرياضيات في الحياة الأسرية والمدرسية.",
        formativeCheckpointAr: "السرعة في إيجاد الأعداد الناقصة دون أخطاء حسابية."
      }
    ],
    googleDocTemplateTitle: "مذكرة بيداغوجية نموذجية — رياضيات 5AP: التناسبية وفق المقاربة بالكفاءات",
    googleSlidePresentationTitle: "عرض بصري ممتع بالرسوم المتحركة — كيف نحل وضعية تناسبية بسهولة؟",
    googleSheetRubricTitle: "شبكة تقييم المكتسبات الرياضية لشهادة تقييم المكتسبات في الابتدائي"
  }
];

export const ALGERIAN_CYCLES = [
  { id: "all", nameAr: "جميع الأطوار التعليمية", nameEn: "All Cycles" },
  { id: "primary", nameAr: "التعليم الابتدائي (1AP - 5AP)", nameEn: "Primary (1AP - 5AP)" },
  { id: "middle", nameAr: "التعليم المتوسط (1AM - 4AM / BEM)", nameEn: "Middle (1AM - 4AM / BEM)" },
  { id: "secondary", nameAr: "التعليم الثانوي (1AS - 3AS / BAC)", nameEn: "Secondary (1AS - 3AS / BAC)" },
];

export const ALGERIAN_SUBJECTS_FILTER = [
  { id: "all", nameAr: "جميع المواد الدراسية", nameEn: "All Subjects" },
  { id: "english", nameAr: "اللغة الإنجليزية (أولوية المنهاج)", nameEn: "English (Priority)" },
  { id: "mathematics", nameAr: "الرياضيات", nameEn: "Mathematics" },
  { id: "physics", nameAr: "العلوم الفيزيائية والتكنولوجيا", nameEn: "Physics & Chemistry" },
  { id: "natural_sciences", nameAr: "علوم الطبيعة والحياة", nameEn: "Natural Sciences" },
  { id: "islamic_education", nameAr: "العلوم الإسلامية", nameEn: "Islamic Education" },
  { id: "history_geo", nameAr: "التاريخ والجغرافيا", nameEn: "History & Geography" },
  { id: "arabic", nameAr: "اللغة العربية وآدابها", nameEn: "Arabic" },
  { id: "philosophy", nameAr: "الفلسفة", nameEn: "Philosophy" },
  { id: "french", nameAr: "اللغة الفرنسية", nameEn: "French" },
];
