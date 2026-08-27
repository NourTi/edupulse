export type WeeklyProgressInput = {
  studentName: string;
  grade: string;
  attendance: number;
  level: string;
  speaking: number;
  listening: number;
  reading: number;
  writing: number;
  note: string;
};

export function buildWeeklyProgressMessage(input: WeeklyProgressInput) {
  const average = Math.round((input.speaking + input.listening + input.reading + input.writing) / 4);
  return `ولي الأمر الكريم،\n\nنشارككم ملخص تقدم ${input.studentName} هذا الأسبوع (${input.grade}):\n• الحضور: ${input.attendance}%\n• مستوى اللغة: ${input.level}\n• متوسط المهارات: ${average}%\n  التحدث ${input.speaking}% · الاستماع ${input.listening}% · القراءة ${input.reading}% · الكتابة ${input.writing}%\n\nملاحظة المعلم: ${input.note}\n\nيمكنكم التواصل مع المؤسسة عبر القناة المعتمدة لأي استفسار.`;
}
