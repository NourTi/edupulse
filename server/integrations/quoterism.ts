/**
 * Quoterism API Integration & Pedagogical Quote Generator
 * https://www.quoterism.com/developer
 * Automatically enriches lesson plans, exam headers, worksheets, and study cards
 * with tailored philosophical, scientific, and literary quotes.
 */

export interface PedagogicalQuote {
  id: string;
  quoteAr: string;
  quoteEn: string;
  authorAr: string;
  authorEn: string;
  subjectCategory: "math" | "physics" | "philosophy" | "arabic_literature" | "history" | "general_pedagogy";
  pedagogicalApplicationAr: string;
}

export async function fetchLessonQuote(
  subjectCategory: string = "general_pedagogy",
  topicKeyword?: string
): Promise<PedagogicalQuote> {
  const apiKey = process.env.QUOTERISM_API_KEY;

  if (apiKey) {
    try {
      const url = `https://api.quoterism.com/api/v1/quotes/random?category=${encodeURIComponent(subjectCategory)}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "User-Agent": "EduPulse/1.0",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.text) {
          return {
            id: String(json.id || Math.random()),
            quoteAr: json.text_ar || json.text,
            quoteEn: json.text,
            authorAr: json.author_ar || json.author || "مفكر معتمد",
            authorEn: json.author || "Scholar",
            subjectCategory: (subjectCategory as any) || "general_pedagogy",
            pedagogicalApplicationAr: "توطئة تحفيزية في مستهل المذكرة البيداغوجية والنشاط التعلمي.",
          };
        }
      }
    } catch (err: any) {
      console.warn("[Quoterism] API fallback used:", err.message);
    }
  }

  // Curated sovereign quote library for Algerian educators and researchers
  const curatedQuotes: PedagogicalQuote[] = [
    {
      id: "q-math-1",
      quoteAr: "الرياضيات ليست مجرد أرقام وقوانين جامدة، بل هي الموسيقى الخفية التي يفهم بها العقل بنية الكون.",
      quoteEn: "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding.",
      authorAr: "ويليام بول ثورستون / الخوارزمي",
      authorEn: "William Paul Thurston / Al-Khwarizmi",
      subjectCategory: "math",
      pedagogicalApplicationAr: "مناسبة لمقدمة دروس المتتاليات العددية، الدوال، والهندسة الفضائية.",
    },
    {
      id: "q-physics-1",
      quoteAr: "أعظم ما في العلم ليس جمع الحقائق، بل إيقاظ الدهشة أمام تناغم القوانين الطبيعية.",
      quoteEn: "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science.",
      authorAr: "ألبرت أينشتاين / ابن الهيثم",
      authorEn: "Albert Einstein / Ibn al-Haytham",
      subjectCategory: "physics",
      pedagogicalApplicationAr: "مناسبة لدروس الميكانيك، الظواهر الضوئية والنووية، وحركية التفاعلات.",
    },
    {
      id: "q-philosophy-1",
      quoteAr: "غاية المعرفة ليست الامتلاء بالمعلومات، بل القدرة على مساءلة البديهيات وتأسيس الفكر الحر.",
      quoteEn: "Education is not the learning of facts, but the training of the mind to think.",
      authorAr: "ابن رشد / سقراط",
      authorEn: "Ibn Rushd / Socrates",
      subjectCategory: "philosophy",
      pedagogicalApplicationAr: "مثالية لمقالات الفلسفة حول المنطق، الإشكالية الفلسفية والمشكلة العلمية.",
    },
    {
      id: "q-pedagogy-1",
      quoteAr: "المعلم الحقيقي لا يصب المعرفة في عقل التلميذ، بل يوقد فيه شعلة الاستكشاف والبحث الذاتي.",
      quoteEn: "The mind is not a vessel to be filled, but a fire to be kindled.",
      authorAr: "عبد الحميد بن باديس / بلوتارخ",
      authorEn: "Abdelhamid Ben Badis / Plutarch",
      subjectCategory: "general_pedagogy",
      pedagogicalApplicationAr: "شعار بيداغوجي لبطاقات التقييم والملاحظات التوجيهية للأساتذة.",
    },
  ];

  const matched = curatedQuotes.filter(q => q.subjectCategory === subjectCategory);
  return matched.length > 0 ? matched[Math.floor(Math.random() * matched.length)] : curatedQuotes[0];
}
