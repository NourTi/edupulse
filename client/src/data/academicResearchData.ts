export interface ResearchFieldOption {
  id: string;
  nameAr: string;
  nameEn: string;
  isPriorityEnglish?: boolean;
  subfields: { id: string; nameAr: string; nameEn: string }[];
}

export const ACADEMIC_RESEARCH_FIELDS: ResearchFieldOption[] = [
  {
    id: "english_linguistics",
    nameAr: "دراسات اللغة الإنجليزية واللسانيات التطبيقية (ELT / SLA)",
    nameEn: "English Studies, TEFL & Applied Linguistics",
    isPriorityEnglish: true,
    subfields: [
      { id: "elt_pedagogy", nameAr: "طرائق تدريس اللغة الإنجليزية والديداكتيك (ELT & Didactics)", nameEn: "ELT & Didactics" },
      { id: "sla_acquisition", nameAr: "اكتساب اللغة الثانية والعلوم المعرفية (SLA & Cognition)", nameEn: "Second Language Acquisition (SLA)" },
      { id: "corpus_linguistics", nameAr: "لسانيات المدونة الحاسوبية وتحليل الخطاب (Corpus & Discourse Analysis)", nameEn: "Corpus Linguistics" },
      { id: "esp_academic", nameAr: "الإنجليزية للأغراض الخاصة والأكاديمية (ESP & EAP in Algerian Higher Ed)", nameEn: "ESP & Academic Writing" },
      { id: "phonetics_phonology", nameAr: "الصوتيات والمقارنة الفونولوجية (Phonetics & Phonology)", nameEn: "Phonetics & Phonology" },
      { id: "sociolinguistics", nameAr: "اللسانيات الاجتماعية وتعدد اللغات في الجزائر (Sociolinguistics & Multilingualism)", nameEn: "Sociolinguistics & Language Policy" },
    ],
  },
  {
    id: "computer_science_ai",
    nameAr: "الإعلام الآلي والذكاء الاصطناعي ومعالجة اللغات (AI & NLP)",
    nameEn: "Computer Science, AI & NLP",
    subfields: [
      { id: "arabic_nlp", nameAr: "معالجة اللغة الطبيعية واللسانيات الحاسوبية (Arabic & English NLP)", nameEn: "Natural Language Processing" },
      { id: "machine_learning", nameAr: "تعلم الآلة والنماذج اللغوية الضخمة (LLMs & Deep Learning)", nameEn: "Machine Learning & LLMs" },
      { id: "edtech_systems", nameAr: "أنظمة التعليم الذكية والمنصات التفاعلية (Intelligent Tutoring Systems)", nameEn: "EdTech Systems" },
    ],
  },
  {
    id: "sciences_technology",
    nameAr: "العلوم الدقيقة والتكنولوجيا والهندسة (STEM)",
    nameEn: "Exact Sciences & Engineering",
    subfields: [
      { id: "math_modelling", nameAr: "النمذجة الرياضية والتحليل العددي (Mathematical Modelling)", nameEn: "Mathematical Modelling" },
      { id: "applied_physics", nameAr: "الفيزياء التطبيقية وهندسة المواد (Applied Physics & Materials)", nameEn: "Applied Physics" },
      { id: "renewable_energy", nameAr: "الطاقات المتجددة والبيئة في الجزائر (Renewable Energy)", nameEn: "Renewable Energy" },
    ],
  },
  {
    id: "medical_health",
    nameAr: "العلوم الطبية والصيدلانية والبيولوجية",
    nameEn: "Medical & Health Sciences",
    subfields: [
      { id: "clinical_epidemiology", nameAr: "الوبائيات والصحة العامة (Clinical Epidemiology)", nameEn: "Public Health" },
      { id: "neuroscience_cognition", nameAr: "العلوم العصبية والذاكرة العاملة (Cognitive Neuroscience)", nameEn: "Neuroscience" },
    ],
  },
  {
    id: "humanities_social",
    nameAr: "العلوم الإنسانية والاجتماعية والتربوية (MESRS)",
    nameEn: "Humanities & Educational Sciences",
    subfields: [
      { id: "educational_psych", nameAr: "علم النفس التربوي والقياس المعرفي (Psychopedagogy)", nameEn: "Educational Psychology" },
      { id: "higher_ed_policy", nameAr: "سياسات التعليم العالي وإدارة الجامعات (Higher Ed Policy)", nameEn: "Higher Education Policy" },
    ],
  },
];

export interface GoogleSlidesAcademicTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  category: "defense" | "conference" | "seminar" | "proposal" | "lecture";
  slideCount: number;
  descriptionAr: string;
  descriptionEn: string;
  colorTheme: string;
  readyCards: { title: string; subtitle: string; bullets: string[] }[];
}

export const READY_GOOGLE_SLIDES_TEMPLATES: GoogleSlidesAcademicTemplate[] = [
  {
    id: "thesis_defense_elt",
    titleAr: "قالب مناقشة أطروحة الدكتوراه / الماستر في تعليمية الإنجليزية (Thesis Defense Deck)",
    titleEn: "Master / PhD Defense in ELT & Applied Linguistics",
    category: "defense",
    slideCount: 18,
    colorTheme: "from-blue-900 via-indigo-900 to-slate-900",
    descriptionAr: "هيكل أكاديمي معتمد وفق التقاليد الجامعية الجزائرية (MESRS): الإشكالية، الفرضيات، العينة، أدوات جمع البيانات، النتائج الإحصائية، والتوصيات البيداغوجية.",
    descriptionEn: "Complete university thesis defense structure with problem statement, methodology, corpus sampling, quantitative & qualitative results, and pedagogical implications.",
    readyCards: [
      {
        title: "Slide 1: Title & Candidacy",
        subtitle: "عنوان الأطروحة واللجنة المناقشة",
        bullets: ["Research Title in English & Arabic", "Candidate: Full Name & Affiliation", "Supervisor & Co-Supervisor", "Jury President & Examiners Committee"],
      },
      {
        title: "Slide 2: Background & Problem Statement",
        subtitle: "سياق الإشكالية وأسئلة البحث",
        bullets: ["Research Gap in Algerian Secondary/Higher Education", "Main Research Question (MRQ)", "Three Sub-Research Questions (SRQs)", "Working Hypotheses (Null vs. Alternative)"],
      },
      {
        title: "Slide 3: Theoretical & Empirical Framework",
        subtitle: "الإطار النظري والدراسات السابقة",
        bullets: ["Cognitive Load & Dual Coding Theories", "Communicative Competence (Canale & Swain)", "Recent Empirical Studies in the MENA Region", "Synthesized Literature Conceptual Model"],
      },
      {
        title: "Slide 4: Methodology & Sampling",
        subtitle: "المنهجية وعينة الدراسة الميدانية",
        bullets: ["Mixed-Methods Research Design (QUAN-QUAL)", "Sample Size: N = 240 Students + 25 Teachers", "Sampling Technique: Stratified Random Sampling", "Data Collection Tools: Pre/Post-tests, Likert-Scale Questionnaire, Semi-structured Interviews"],
      },
      {
        title: "Slide 5: Key Findings & Statistical Significance",
        subtitle: "النتائج التجريبية والدلالة الإحصائية",
        bullets: ["Paired Samples t-test (p < .001, Cohen's d = 0.82)", "Analysis of Covariance (ANCOVA) for Treatment vs Control", "Thematic Content Analysis of Interview Transcripts", "Visual Pie Charts & Bar Graphs of Proficiency Shifts"],
      },
      {
        title: "Slide 6: Pedagogical Recommendations & Limitations",
        subtitle: "التوصيات والآفاق البحثية المستقبلية",
        bullets: ["Curriculum Revision Suggestions for Algerian Inspectorate", "Teacher Professional Training Modules", "Methodological Limitations & External Validity", "Open Questions for Future Doctoral Studies"],
      },
    ],
  },
  {
    id: "conf_presentation_15min",
    titleAr: "عرض المؤتمرات الدولية (15 دقيقة — International Conference Presentation)",
    titleEn: "15-Minute International Conference Presentation Deck",
    category: "conference",
    slideCount: 12,
    colorTheme: "from-teal-900 via-slate-900 to-cyan-950",
    descriptionAr: "مصمم بدقة للإلقاء في 15 دقيقة مع تركيز بصري عالي وتفادي ازدحام النصوص: 3 شرائح للمشكلة، 4 للمنهجية والنتائج، 2 للنقاش والتوصيات.",
    descriptionEn: "Strictly calibrated for 15-minute conference talks with high visual impact, concise evidence bullets, and clean charts.",
    readyCards: [
      {
        title: "Slide 1: Conference Title & Institutional Affiliation",
        subtitle: "ورقة المؤتمر والجامعة",
        bullets: ["Paper Title (max 12 words)", "Author(s) & University Laboratory", "Conference Name & Year", "QR Code linking to Preprint or GitHub Repository"],
      },
      {
        title: "Slide 2: The Core Dilemma (The 'So What?' Question)",
        subtitle: "لب الإشكالية",
        bullets: ["Current Reality vs Desired Pedagogical Outcome", "Why Traditional Approaches Failed in Algerian Classrooms", "Our Innovative Intervention Paradigm"],
      },
      {
        title: "Slide 3: Experimental Setup in 60 Seconds",
        subtitle: "التجربة في دقيقة واحدة",
        bullets: ["Timeline: 12-Week Classroom Intervention", "Control Group vs Experimental Group", "Pre-test / Post-test Delta"],
      },
      {
        title: "Slide 4: The Hero Finding (Data Visualization)",
        subtitle: "النتيجة الجوهرية",
        bullets: ["Key Effect Size: +34% Retention", "Confidence Interval [95% CI]", "Quotations from Student Focus Groups"],
      },
    ],
  },
  {
    id: "systematic_lit_review_deck",
    titleAr: "قالب استعراض الأدبيات النظامي (PRISMA Systematic Review Deck)",
    titleEn: "Systematic Literature Review & Meta-Analysis Deck",
    category: "seminar",
    slideCount: 14,
    colorTheme: "from-purple-950 via-indigo-950 to-slate-950",
    descriptionAr: "مخطط انسيابي PRISMA كامل للغربلة والتصفية والاستخلاص من قواعد البيانات العلمية مع شبكة المقارنة المنهجية.",
    descriptionEn: "Complete PRISMA 2020 flow chart, database identification, screening criteria, risk-of-bias assessment, and synthesis matrix.",
    readyCards: [
      {
        title: "Slide 1: PRISMA 2020 Flow Diagram",
        subtitle: "مخطط تدفق بريزما المعتمد",
        bullets: ["Records identified from Databases (N = 1,840)", "Duplicates removed automatically (N = 320)", "Records screened by Title & Abstract (N = 1,520)", "Full-text articles assessed for eligibility (N = 84)", "Studies included in final qualitative synthesis (N = 28)"],
      },
      {
        title: "Slide 2: Inclusion & Exclusion Criteria Matrix",
        subtitle: "معايير الإدراج والاستبعاد",
        bullets: ["Population: Secondary & Tertiary EFL Learners", "Intervention: Digital Scaffolded Retrieval Practice", "Comparator: Passive Re-reading or Traditional Lecture", "Outcomes: Reading Comprehension & Lexical Retention"],
      },
    ],
  },
  {
    id: "university_lecture_deck",
    titleAr: "قالب المحاضرة الجامعية والمدرج (University Lecture & Seminar)",
    titleEn: "Interactive University Lecture & Amphitheater Deck",
    category: "lecture",
    slideCount: 22,
    colorTheme: "from-emerald-950 via-slate-900 to-teal-950",
    descriptionAr: "مخصص للأساتذة الباحثين في الجامعات الجزائرية: أهداف المحاضرة، أمثلة توضيحية، أسئلة تفاعلية (Think-Pair-Share)، وملخص ختامي.",
    descriptionEn: "Designed for Algerian university amphitheatres: clear cognitive milestones, interactive discussion prompts, worked linguistic models, and lecture wrap-up.",
    readyCards: [
      {
        title: "Slide 1: Lecture Objectives & Key Terms",
        subtitle: "أهداف المحاضرة والمفردات التخصصية",
        bullets: ["Course: Applied Linguistics / TEFL Methodology", "Module 4: Designing Formative Assessment in Second Language Classrooms", "Core Competency: Constructing Valid Rubrics"],
      },
      {
        title: "Slide 2: Interactive Checkpoint (Mentimeter / Hand-raising)",
        subtitle: "سؤال تفاعلي للمدرج",
        bullets: ["Which test format yields higher washback effect in Algerian secondary schools?", "A) Multiple Choice Questions", "B) Guided Performance Tasks", "C) Translation Drills"],
      },
    ],
  },
];

export interface GoogleSheetsAcademicTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  columns: string[];
  sampleRow: string[];
  purposeAr: string;
}

export const READY_GOOGLE_SHEETS_TEMPLATES: GoogleSheetsAcademicTemplate[] = [
  {
    id: "research_participants_matrix",
    titleAr: "مصفوفة عينة البحث والمشاركين التجريبية (Participants Sample Matrix)",
    titleEn: "Experimental Participants & Cohort Matrix",
    descriptionAr: "جدول بيانات جاهز للمشاركين في الأبحاث: المعرف المجهول، الجنس، السن، المستوى الدراسي، الفوج التجريبي أو الضابط، ومعدل الحضور.",
    columns: ["ID_المشارك", "الفوج", "المرحلة_التعليمية", "السن", "الجنس", "المستوى_القبلي_CEFR", "العلامة_القبلية_PreTest", "العلامة_البعدية_PostTest", "الفارق_Delta", "نسبة_الحضور_%"],
    sampleRow: ["P-101", "تجريبي (Experimental)", "3AS لغات أجنبية", "17", "أنثى", "B1", "11.5", "16.0", "+4.5", "96%"],
    purposeAr: "جاهز للتصدير المباشر لبرامج التحليل الإحصائي SPSS و R و JASP وحساب t-test ودلالة الفروق.",
  },
  {
    id: "survey_likert_coder",
    titleAr: "ورقة تفريغ استبيانات ليكرت الخماسية (Likert-Scale Survey Coder)",
    titleEn: "5-Point Likert Survey Response Coder",
    descriptionAr: "تفريغ ردود الأساتذة والتلاميذ في الدراسات الميدانية وفق مقياس ليكرت (موافق بشدة إلى غير موافق بشدة) مع حساب المتوسط الحسابي والانحراف المعياري آلياً.",
    columns: ["رقم_الاستمارة", "صفة_المستجوب", "البعد_1_الدافعية", "البعد_2_العبء_المعرفي", "البعد_3_كفاءة_الأستاذ", "المتوسط_العام_Mean", "الانحراف_StdDev", "الاتجاه_العام"],
    sampleRow: ["RESP-042", "أستاذ تعليم ثانوي (الإنجليزية)", "4.6", "2.1", "4.8", "4.42", "0.58", "موافق بشدة (Highly Agree)"],
    purposeAr: "تحويل البيانات الكيفية إلى بيانات كمية قابلة للتمثيل البياني في أطروحة الماستر أو الدكتوراه.",
  },
  {
    id: "lit_review_screening_sheet",
    titleAr: "جدول غربلة واستخلاص الأدبيات السابقة (Literature Screening & Synthesis Matrix)",
    titleEn: "Literature Review Synthesis Matrix",
    descriptionAr: "مصفوفة استخلاص متكاملة للمراجع الأكاديمية: المؤلف، السنة، بلد الدراسة، المنهجية، حجم العينة، النتيجة الجوهرية، وتطبيقها في السياق الجزائري.",
    columns: ["المؤلف_والسنة", "عنوان_الورقة_العلمية", "المجلة_والمعامل", "بلد_الدراسة", "المنهجية", "العينة_N", "النتيجة_الرئيسية", "الربط_بالسياق_الجزائري"],
    sampleRow: ["Smith & Benali (2023)", "Scaffolded Writing in North African EFL", "TESOL Quarterly (Q1)", "الجزائر / تونس", "شبه تجريبي", "320 طالب", "تحسن دال في بنية المقال (p<.01)", "ضرورة تكييفها في منهاج 2AS و 3AS"],
    purposeAr: "تنظيم مئات المقالات العلمية وبناء فصل الدراسات السابقة دون إغفال أي متغير بحثي.",
  },
];

export interface FreeGithubResource {
  id: string;
  name: string;
  categoryAr: string;
  descriptionAr: string;
  license: string;
  tags: string[];
  url: string;
}

export const FREE_GITHUB_RESOURCES: FreeGithubResource[] = [
  {
    id: "dz_arabic_nlp",
    name: "Algerian-Arabic-NLP-Corpus",
    categoryAr: "معالجة اللغات واللهجات الجزائرية",
    descriptionAr: "مدونة نصية مفتوحة المصدر تضم نصوصاً جزائرية موازية (عربية فصحى، دارجة جزائرية، وإنجليزية) لتحليل المشاعر والترجمة الآلية للأبحاث اللغوية.",
    license: "MIT / Open Access",
    tags: ["NLP", "Corpus Linguistics", "Algerian Dialect", "Machine Translation"],
    url: "https://github.com/topics/algerian-dialect",
  },
  {
    id: "spacy_academic",
    name: "spaCy & Textacy for Corpus Analysis",
    categoryAr: "أدوات تحليل النصوص والمدونات الإنجليزية",
    descriptionAr: "مكتبة بيثون مفتوحة المصدر لتحليل تكرار المفردات، استخراج التراكيب النحوية، وتقدير معامل سهولة القراءة (Flesch-Kincaid Grade Level) للنصوص التعليمية.",
    license: "MIT License",
    tags: ["Corpus", "Readability", "Text Mining", "English Linguistics"],
    url: "https://github.com/explosion/spaCy",
  },
  {
    id: "zotero_csl_mesrs",
    name: "Zotero APA 7th & Arabic CSL Citation Styles",
    categoryAr: "التوثيق الأكاديمي وإدارة المراجع",
    descriptionAr: "أنماط التوثيق الرسمية المفتوحة المصدر لبرنامج Zotero لدعم التوثيق الثنائي (عربي - إنجليزي) وفق دليل وزارة التعليم العالي والبحث العلمي الجزائرية.",
    license: "Creative Commons / Open Source",
    tags: ["Zotero", "Bibliography", "APA 7th", "MESRS Standard"],
    url: "https://github.com/citation-style-language/styles",
  },
  {
    id: "huggingface_eap_models",
    name: "Open-EFL-Grammar-Evaluation",
    categoryAr: "تقييم الكتابة الأكاديمية والإنتاج اللغوي",
    descriptionAr: "نماذج مفتوحة المصدر ومجموعات بيانات لتصنيف الأخطاء اللغوية لمتعلمي اللغة الإنجليزية كلغة أجنبية (EFL Learner Corpus) وتوفير تغذية راجعة تلقائية.",
    license: "Apache 2.0",
    tags: ["EFL Corpus", "Grammar Error Correction", "Formative Feedback"],
    url: "https://github.com/topics/grammar-error-correction",
  },
];

export interface ResearchRoadmapTask {
  phaseAr: string;
  phaseEn: string;
  milestones: { titleAr: string; deadlineWeek: string; timeEstimateHours: number; status: "completed" | "in_progress" | "pending" }[];
}

export const DEFAULT_RESEARCH_ROADMAP: ResearchRoadmapTask[] = [
  {
    phaseAr: "المرحلة الأولى: بلورة الإشكالية ومسح الأدبيات (Literature Review)",
    phaseEn: "Problem Formulation & Literature Review",
    milestones: [
      { titleAr: "تحديد الفجوة البحثية في تعليمية الإنجليزية بالجزائر وصياغة الأسئلة المركزية", deadlineWeek: "الأسبوع 1 - 2", timeEstimateHours: 25, status: "completed" },
      { titleAr: "تجميع 40 ورقة علمية محكمة في مصفوفة بريزما وتوثيقها بـ APA 7th", deadlineWeek: "الأسبوع 3 - 5", timeEstimateHours: 40, status: "in_progress" },
      { titleAr: "كتابة مسودة استعراض الأدبيات وتوليد الخريطة المفاهيمية للمتغيرات", deadlineWeek: "الأسبوع 6 - 7", timeEstimateHours: 30, status: "pending" },
    ],
  },
  {
    phaseAr: "المرحلة الثانية: بناء أدوات البحث والتحكيم الميداني (Methodology & Tools)",
    phaseEn: "Instrument Design & Expert Validation",
    milestones: [
      { titleAr: "تصميم استبيان ليكرت الخماسي واختباري الفهم القبلي والبعدي", deadlineWeek: "الأسبوع 8 - 9", timeEstimateHours: 20, status: "pending" },
      { titleAr: "عرض الأدوات على لجنة من 5 أساتذة محكمين وحساب معامل الصدق الظاهري", deadlineWeek: "الأسبوع 10", timeEstimateHours: 15, status: "pending" },
      { titleAr: "إجراء التجربة الاستطلاعية (Pilot Study) وحساب معامل ألفا كرونباخ للثبات", deadlineWeek: "الأسبوع 11 - 12", timeEstimateHours: 25, status: "pending" },
    ],
  },
  {
    phaseAr: "المرحلة الثالثة: التطبيق الميداني والتحليل الإحصائي (Data Collection & Stats)",
    phaseEn: "Fieldwork & Statistical Computation",
    milestones: [
      { titleAr: "تنفيذ التدخل البيداغوجي في ثانويات العينة (10 أسابيع تدريس معتمد)", deadlineWeek: "الأسبوع 13 - 22", timeEstimateHours: 60, status: "pending" },
      { titleAr: "تفريغ البيانات في Google Sheets وتصدير مصفوفة SPSS / JASP لحساب t-test و ANOVA", deadlineWeek: "الأسبوع 23 - 24", timeEstimateHours: 25, status: "pending" },
    ],
  },
  {
    phaseAr: "المرحلة الرابعة: المناقشة والتوصيات والتحضير للمناقشة (Discussion & Defense)",
    phaseEn: "Discussion & Defense Preparation",
    milestones: [
      { titleAr: "مناقشة النتائج ومقارنتها بالدراسات السابقة وصياغة توصيات المنهاج", deadlineWeek: "الأسبوع 25 - 26", timeEstimateHours: 35, status: "pending" },
      { titleAr: "إعداد عرض الشرائح النهائي للمناقشة (Defense Slides) على Google Slides", deadlineWeek: "الأسبوع 27 - 28", timeEstimateHours: 20, status: "pending" },
    ],
  },
];
