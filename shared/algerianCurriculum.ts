/**
 * Algerian National Secondary Curriculum (المنهاج الوطني الجزائري للتعليم الثانوي)
 * Official Streams (الشعب), Tronc Commun (الجذوع المشتركة), Subjects, Coefficients,
 * and Competency Knowledge Graph nodes.
 */

export type AlgerianCycle = "1AS" | "2AS" | "3AS";

export type StreamOption = "mechanical" | "electrical" | "civil" | "process";

export interface AlgerianSubject {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  coefficient: number;
  weeklyHours: number;
  category: "core_science" | "core_humanities" | "languages" | "general" | "technology";
}

export interface AlgerianStream {
  id: string;
  cycle: AlgerianCycle;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  descriptionAr: string;
  option?: StreamOption;
  optionLabelAr?: string;
  subjects: AlgerianSubject[];
  totalCoefficients: number;
}

export interface CompetencyNode {
  id: string;
  subjectId: string;
  streamId: string;
  cycle: AlgerianCycle;
  titleAr: string;
  titleFr: string;
  unitAr: string;
  prerequisites: string[]; // IDs of prerequisite competencies
  commonMisconceptions: {
    misconceptionAr: string;
    explanationAr: string;
    suggestedIntervention: string;
    evidenceMethod: "worked_examples" | "retrieval_practice" | "dual_coding" | "interleaving" | "scaffolding";
  }[];
  baccalaureateExamWeight: "high" | "medium" | "standard";
}

// 1. Core Subjects Templates
const SUBJECT_ARABIC: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "arabic",
  nameAr: "اللغة العربية وآدابها",
  nameFr: "Langue et littérature arabes",
  nameEn: "Arabic Language & Literature",
  category: "languages",
};

const SUBJECT_MATH: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "mathematics",
  nameAr: "الرياضيات",
  nameFr: "Mathématiques",
  nameEn: "Mathematics",
  category: "core_science",
};

const SUBJECT_PHYSICS: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "physics_chemistry",
  nameAr: "العلوم الفيزيائية والتكنولوجية",
  nameFr: "Sciences Physiques et Technologie",
  nameEn: "Physical Sciences & Technology",
  category: "core_science",
};

const SUBJECT_NATURAL_SCIENCES: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "natural_sciences",
  nameAr: "علوم الطبيعة والحياة",
  nameFr: "Sciences de la Nature et de la Vie",
  nameEn: "Natural & Life Sciences",
  category: "core_science",
};

const SUBJECT_PHILOSOPHY: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "philosophy",
  nameAr: "الفلسفة",
  nameFr: "Philosophie",
  nameEn: "Philosophy",
  category: "core_humanities",
};

const SUBJECT_HISTORY_GEO: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "history_geography",
  nameAr: "التاريخ والجغرافيا",
  nameFr: "Histoire et Géographie",
  nameEn: "History & Geography",
  category: "core_humanities",
};

const SUBJECT_ISLAMIC: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "islamic_sciences",
  nameAr: "العلوم الإسلامية",
  nameFr: "Sciences Islamiques",
  nameEn: "Islamic Sciences",
  category: "general",
};

const SUBJECT_FRENCH: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "french",
  nameAr: "اللغة الفرنسية",
  nameFr: "Langue Française",
  nameEn: "French Language",
  category: "languages",
};

const SUBJECT_ENGLISH: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "english",
  nameAr: "اللغة الإنجليزية",
  nameFr: "Langue Anglaise",
  nameEn: "English Language",
  category: "languages",
};

const SUBJECT_PE: Omit<AlgerianSubject, "coefficient" | "weeklyHours"> = {
  id: "pe",
  nameAr: "التربية البدنية والرياضية",
  nameFr: "Éducation Physique et Sportive",
  nameEn: "Physical Education",
  category: "general",
};

// 2. Official Algerian Secondary Streams Catalog
export const ALGERIAN_STREAMS: AlgerianStream[] = [
  // --- 1AS: Tronc Commun ---
  {
    id: "1as-st",
    cycle: "1AS",
    nameAr: "جذع مشترك علوم وتكنولوجيا",
    nameFr: "Tronc Commun Sciences et Technologies",
    nameEn: "Common Core Sciences & Technology",
    descriptionAr: "المسار التأسيسي للتوجيه نحو العلوم التجريبية، الرياضيات، التقني رياضي، والتسيير والاقتصاد.",
    totalCoefficients: 25,
    subjects: [
      { ...SUBJECT_MATH, coefficient: 5, weeklyHours: 5 },
      { ...SUBJECT_PHYSICS, coefficient: 4, weeklyHours: 4 },
      { ...SUBJECT_NATURAL_SCIENCES, coefficient: 4, weeklyHours: 4 },
      { ...SUBJECT_ARABIC, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_FRENCH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ENGLISH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },
  {
    id: "1as-l",
    cycle: "1AS",
    nameAr: "جذع مشترك آداب",
    nameFr: "Tronc Commun Lettres",
    nameEn: "Common Core Letters & Humanities",
    descriptionAr: "المسار التأسيسي للتوجيه نحو شعبة الآداب والفلسفة وشعبة اللغات الأجنبية.",
    totalCoefficients: 23,
    subjects: [
      { ...SUBJECT_ARABIC, coefficient: 5, weeklyHours: 5 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_FRENCH, coefficient: 3, weeklyHours: 4 },
      { ...SUBJECT_ENGLISH, coefficient: 3, weeklyHours: 4 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_MATH, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_NATURAL_SCIENCES, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PHYSICS, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },

  // --- 2AS & 3AS Baccalaureate Streams ---
  // 1. Sciences Expérimentales
  {
    id: "3as-sci",
    cycle: "3AS",
    nameAr: "شعبة العلوم التجريبية",
    nameFr: "Sciences Expérimentales",
    nameEn: "Experimental Sciences",
    descriptionAr: "شعبة علمية تركز على العلوم الطبيعية (6)، الرياضيات (5)، والفيزياء (5). تفتح آفاق الطب، الصيدلة، والهندسات.",
    totalCoefficients: 30,
    subjects: [
      { ...SUBJECT_NATURAL_SCIENCES, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_PHYSICS, coefficient: 5, weeklyHours: 5 },
      { ...SUBJECT_MATH, coefficient: 5, weeklyHours: 5 },
      { ...SUBJECT_ARABIC, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_PHILOSOPHY, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_FRENCH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ENGLISH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },

  // 2. Mathématiques
  {
    id: "3as-math",
    cycle: "3AS",
    nameAr: "شعبة الرياضيات",
    nameFr: "Mathématiques",
    nameEn: "Mathematics Stream",
    descriptionAr: "الشعبة النخبوية الأكثر تركيزاً على التجريد الرياضي (7) والفيزياء (6) والمدارس الوطنية العليا.",
    totalCoefficients: 29,
    subjects: [
      { ...SUBJECT_MATH, coefficient: 7, weeklyHours: 7 },
      { ...SUBJECT_PHYSICS, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_ARABIC, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_NATURAL_SCIENCES, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PHILOSOPHY, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_FRENCH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ENGLISH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },

  // 3. Technique Mathématiques (4 options)
  {
    id: "3as-tm-meca",
    cycle: "3AS",
    nameAr: "تقني رياضي · هندسة ميكانيكية",
    nameFr: "Technique Mathématiques · Génie Mécanique",
    nameEn: "Technical Math · Mechanical Engineering",
    option: "mechanical",
    optionLabelAr: "هندسة ميكانيكية",
    descriptionAr: "دراسة الأنظمة الآلية، علم المواد، الرسم الصناعي والميكانيك التطبيقية مع الرياضيات والفيزياء.",
    totalCoefficients: 32,
    subjects: [
      { id: "tech_spec", nameAr: "التكنولوجيا (هندسة ميكانيكية)", nameFr: "Génie Mécanique", nameEn: "Mechanical Engineering", coefficient: 6, weeklyHours: 6, category: "technology" },
      { ...SUBJECT_MATH, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_PHYSICS, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_ARABIC, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_PHILOSOPHY, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_FRENCH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ENGLISH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },
  {
    id: "3as-tm-elec",
    cycle: "3AS",
    nameAr: "تقني رياضي · هندسة كهربائية",
    nameFr: "Technique Mathématiques · Génie Électrique",
    nameEn: "Technical Math · Electrical Engineering",
    option: "electrical",
    optionLabelAr: "هندسة كهربائية",
    descriptionAr: "دراسة الدارات الإلكترونية، المنطق التعاقبي، الميكروكنترولر، وشبكات التيار.",
    totalCoefficients: 32,
    subjects: [
      { id: "tech_spec", nameAr: "التكنولوجيا (هندسة كهربائية)", nameFr: "Génie Électrique", nameEn: "Electrical Engineering", coefficient: 6, weeklyHours: 6, category: "technology" },
      { ...SUBJECT_MATH, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_PHYSICS, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_ARABIC, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_PHILOSOPHY, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_FRENCH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ENGLISH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },
  {
    id: "3as-tm-civil",
    cycle: "3AS",
    nameAr: "تقني رياضي · هندسة مدنية",
    nameFr: "Technique Mathématiques · Génie Civil",
    nameEn: "Technical Math · Civil Engineering",
    option: "civil",
    optionLabelAr: "هندسة مدنية",
    descriptionAr: "دراسة المنشآت، مقاومة المواد، الطبوغرافيا وعلم الخرسانة والمباني.",
    totalCoefficients: 32,
    subjects: [
      { id: "tech_spec", nameAr: "التكنولوجيا (هندسة مدنية)", nameFr: "Génie Civil", nameEn: "Civil Engineering", coefficient: 6, weeklyHours: 6, category: "technology" },
      { ...SUBJECT_MATH, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_PHYSICS, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_ARABIC, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_PHILOSOPHY, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_FRENCH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ENGLISH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },
  {
    id: "3as-tm-proc",
    cycle: "3AS",
    nameAr: "تقني رياضي · هندسة الطرائق",
    nameFr: "Technique Mathématiques · Génie des Procédés",
    nameEn: "Technical Math · Process Engineering",
    option: "process",
    optionLabelAr: "هندسة الطرائق",
    descriptionAr: "دراسة الكيمياء الحيوية، الصناعات البتروكيماوية، ومعالجة المواد والتحويلات الكيميائية.",
    totalCoefficients: 32,
    subjects: [
      { id: "tech_spec", nameAr: "التكنولوجيا (هندسة الطرائق)", nameFr: "Génie des Procédés", nameEn: "Process Engineering", coefficient: 6, weeklyHours: 6, category: "technology" },
      { ...SUBJECT_MATH, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_PHYSICS, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_ARABIC, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_PHILOSOPHY, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_FRENCH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ENGLISH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },

  // 4. Gestion et Économie
  {
    id: "3as-gest",
    cycle: "3AS",
    nameAr: "شعبة تسيير واقتصاد",
    nameFr: "Gestion et Économie",
    nameEn: "Management & Economics",
    descriptionAr: "شعبة إدارة الأعمال، المحاسبة المالية (6)، الاقتصاد والمناجمنت (5)، والتاريخ والجغرافيا والرياضيات (4).",
    totalCoefficients: 33,
    subjects: [
      { id: "accounting", nameAr: "التسيير المحاسبي والمالي", nameFr: "Gestion Comptable et Financière", nameEn: "Accounting & Financial Management", coefficient: 6, weeklyHours: 5, category: "core_science" },
      { id: "economics", nameAr: "الاقتصاد والمناجمنت", nameFr: "Économie et Management", nameEn: "Economics & Management", coefficient: 5, weeklyHours: 4, category: "core_science" },
      { ...SUBJECT_MATH, coefficient: 4, weeklyHours: 4 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 4, weeklyHours: 3 },
      { ...SUBJECT_ARABIC, coefficient: 3, weeklyHours: 3 },
      { id: "law", nameAr: "القانون", nameFr: "Droit", nameEn: "Law", coefficient: 2, weeklyHours: 2, category: "core_humanities" },
      { ...SUBJECT_PHILOSOPHY, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_FRENCH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ENGLISH, coefficient: 2, weeklyHours: 3 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },

  // 5. Lettres et Philosophie
  {
    id: "3as-philo",
    cycle: "3AS",
    nameAr: "شعبة آداب وفلسفة",
    nameFr: "Lettres et Philosophie",
    nameEn: "Literature & Philosophy",
    descriptionAr: "شعبة الفكر الإنساني والتحليل الفلسفي المعمق (6)، الأدب العربي (6)، والتاريخ والجغرافيا (4).",
    totalCoefficients: 27,
    subjects: [
      { ...SUBJECT_PHILOSOPHY, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_ARABIC, coefficient: 6, weeklyHours: 6 },
      { ...SUBJECT_HISTORY_GEO, coefficient: 4, weeklyHours: 4 },
      { ...SUBJECT_FRENCH, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_ENGLISH, coefficient: 3, weeklyHours: 3 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_MATH, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },

  // 6. Langues Étrangères
  {
    id: "3as-lang",
    cycle: "3AS",
    nameAr: "شعبة لغات أجنبية",
    nameFr: "Langues Étrangères",
    nameEn: "Foreign Languages",
    descriptionAr: "شعبة التخصص في اللغات العالمية: العربية (5)، الفرنسية (5)، الإنجليزية (5)، واللغة الثالثة (4).",
    totalCoefficients: 28,
    subjects: [
      { ...SUBJECT_ARABIC, coefficient: 5, weeklyHours: 5 },
      { ...SUBJECT_FRENCH, coefficient: 5, weeklyHours: 5 },
      { ...SUBJECT_ENGLISH, coefficient: 5, weeklyHours: 5 },
      { id: "lang3", nameAr: "اللغة الأجنبية الثالثة (إسبانية/ألمانية/إيطالية)", nameFr: "3ème Langue Vivante", nameEn: "3rd Foreign Language", coefficient: 4, weeklyHours: 4, category: "languages" },
      { ...SUBJECT_HISTORY_GEO, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PHILOSOPHY, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_ISLAMIC, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_MATH, coefficient: 2, weeklyHours: 2 },
      { ...SUBJECT_PE, coefficient: 1, weeklyHours: 2 },
    ],
  },
];

// 3. Knowledge Graph Nodes: Competencies & Misconceptions
export const ALGERIAN_COMPETENCIES: CompetencyNode[] = [
  {
    id: "math-derivatives",
    subjectId: "mathematics",
    streamId: "3as-sci",
    cycle: "3AS",
    unitAr: "دوال عددية: الاشتقاقية والاستمرارية",
    titleAr: "حساب المشتقات، التقريب التآلفي، وجدول التغيرات والقيم الحدية",
    titleFr: "Dérivabilité, continuité et étude de variations",
    prerequisites: ["math-limits", "math-functions-basics"],
    baccalaureateExamWeight: "high",
    commonMisconceptions: [
      {
        misconceptionAr: "اعتقاد أن انعدام المشتقة يستلزم دائماً وجود قيمة حدية عظمى أو صغرى (مثل f(x)=x^3 عند x=0).",
        explanationAr: "انعدام المشتقة شرط لازم لكنه غير كافٍ ما لم تغيّر المشتقة إشارتها حول النقطة.",
        suggestedIntervention: "تمارين مقارنة الرسوم البيانية لنقاط الانعطاف الأفقية مقابل القمم والوديان باستخدام الترميز المزدوج (Dual Coding).",
        evidenceMethod: "dual_coding",
      },
      {
        misconceptionAr: "تطبيق قاعدة مشتقة الجداء (u.v)' = u'.v' مباشرة بدلاً من (u'v + uv').",
        explanationAr: "خطأ قياس شائع من قاعدة الجمع (u+v)' = u'+v'.",
        suggestedIntervention: "أمثلة محلولة مسبقاً (Worked Examples) مع تدرج التلاشي (Fading) لحساب مشتقات الجداء.",
        evidenceMethod: "worked_examples",
      },
    ],
  },
  {
    id: "math-sequences",
    subjectId: "mathematics",
    streamId: "3as-sci",
    cycle: "3AS",
    unitAr: "المتتاليات العددية والبرهان بالتراجع",
    titleAr: "البرهان بالتراجع، المتتاليات الحسابية والهندسية، والتقارب",
    titleFr: "Suites numériques et raisonnement par récurrence",
    prerequisites: ["math-derivatives"],
    baccalaureateExamWeight: "high",
    commonMisconceptions: [
      {
        misconceptionAr: "إغفال خطوة التحقق من الأساس n0 والقفز مباشرة لفرضية التراجع.",
        explanationAr: "الاستدلال بالتراجع يستند إلى مبدأ التتالي المنطقي، فبدون خطوة الابتداء تسقط السلسلة كاملة.",
        suggestedIntervention: "تمرين استرجاع سريع (Retrieval Checkpoint) من 3 دقائق للتحقق من سلامة صياغة المراحل الثلاث.",
        evidenceMethod: "retrieval_practice",
      },
    ],
  },
  {
    id: "phys-rc-rl",
    subjectId: "physics_chemistry",
    streamId: "3as-sci",
    cycle: "3AS",
    unitAr: "الظواهر الكهربائية (RC و RL)",
    titleAr: "شحن وتفريغ المكثفة، إقامة وانقطاع التيار في وشيعة، واستخراج ثابت الزمن τ",
    titleFr: "Circuits RC et RL, constante de temps tau",
    prerequisites: ["math-differential-eq"],
    baccalaureateExamWeight: "high",
    commonMisconceptions: [
      {
        misconceptionAr: "الخلط بين معادلة التوتر Uc(t) ومعادلة الشحنة q(t) أو شدة التيار i(t) عند بداية الشحن.",
        explanationAr: "عند اللحظة t=0 التوتر عبر المكثفة معدوم بينما شدة التيار تكون عظمى I0=E/R.",
        suggestedIntervention: "تمرين ممارسة متباعدة (Spaced Retrieval) يربط بين المنحنى البياني والمعادلة التفاضلية.",
        evidenceMethod: "retrieval_practice",
      },
    ],
  },
  {
    id: "sci-proteins",
    subjectId: "natural_sciences",
    streamId: "3as-sci",
    cycle: "3AS",
    unitAr: "التخصص الوظيفي للبروتينات",
    titleAr: "آليات تركيب البروتين (الاستنساخ والترجمة) وبنية البروتين وعلاقتها بوظيفته",
    titleFr: "Synthèse et spécialisation fonctionnelle des protéines",
    prerequisites: [],
    baccalaureateExamWeight: "high",
    commonMisconceptions: [
      {
        misconceptionAr: "الاعتقاد بأن كل طفرة في الـ ADN تؤدي حتماً إلى تغير الوظيفة البيولوجية للبروتين.",
        explanationAr: "الطفرات الصامتة لا تغير الحمض الأميني (ترادف الشفرات)، وبعض الطفرات تحدث في مناطق غير فاعلة من الموقع الفعال.",
        suggestedIntervention: "سقالات تحليل الوثائق العلمية وفق منهجية البكالوريا الجديدة (مهمة مركبة).",
        evidenceMethod: "scaffolding",
      },
    ],
  },
  {
    id: "philo-scientific-method",
    subjectId: "philosophy",
    streamId: "3as-philo",
    cycle: "3AS",
    unitAr: "فلسفة العلوم والرياضيات",
    titleAr: "قيمة المعرفة الرياضية، والتجريب في علوم المادة الحية",
    titleFr: "Épistémologie et philosophie des sciences",
    prerequisites: [],
    baccalaureateExamWeight: "high",
    commonMisconceptions: [
      {
        misconceptionAr: "سرد الآراء الفلسفية على شكل لائحة تاريخية دون بناء محاجة جدلية ونقد وموقف شخصي مبرر.",
        explanationAr: "سلم تنقيط مقالة البكالوريا يخصص النصيب الأكبر للمحاجة المنطقية وتجاوز الأطروحتين نحو التركيب.",
        suggestedIntervention: "نماذج مقالات محلولة ومفككة مع بطاقات نقد فورية.",
        evidenceMethod: "worked_examples",
      },
    ],
  },
];

/**
 * Calculates Algerian Baccalaureate predicted weighted average
 */
export function calculateAlgerianBacAverage(streamId: string, grades: Record<string, number>): {
  average: number;
  totalPoints: number;
  totalCoeff: number;
  mentionAr: string;
  mentionFr: string;
  passed: boolean;
} {
  const stream = ALGERIAN_STREAMS.find(s => s.id === streamId) ?? ALGERIAN_STREAMS[2]; // Default to 3AS Sciences Exp
  let totalPoints = 0;
  let totalCoeff = 0;

  for (const subject of stream.subjects) {
    const grade = grades[subject.id] ?? 10; // Default baseline 10/20
    totalPoints += grade * subject.coefficient;
    totalCoeff += subject.coefficient;
  }

  const average = Number((totalPoints / totalCoeff).toFixed(2));
  const passed = average >= 10.0;

  let mentionAr = "راسب";
  let mentionFr = "Ajourné";

  if (average >= 16) {
    mentionAr = "ممتاز / جيد جداً";
    mentionFr = "Très Bien";
  } else if (average >= 14) {
    mentionAr = "جيد";
    mentionFr = "Bien";
  } else if (average >= 12) {
    mentionAr = "قريب من الجيد";
    mentionFr = "Assez Bien";
  } else if (average >= 10) {
    mentionAr = "مقبول";
    mentionFr = "Passable";
  }

  return { average, totalPoints, totalCoeff, mentionAr, mentionFr, passed };
}
