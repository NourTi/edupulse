import { useMemo, useState } from "react";
import { Check, Copy, Mail, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type TeamRole = "admin" | "registrar" | "finance_admin" | "teacher" | "counsellor" | "student" | "guardian";

type Props = {
  isArabic: boolean;
  institutionId?: string;
};

const roleOptions: Array<{ value: TeamRole; ar: string; en: string }> = [
  { value: "admin", ar: "مدير مساعد", en: "Administrator" },
  { value: "registrar", ar: "مسجل المؤسسة", en: "Registrar" },
  { value: "finance_admin", ar: "مسؤول المالية", en: "Finance administrator" },
  { value: "teacher", ar: "معلم", en: "Teacher" },
  { value: "counsellor", ar: "مستشار", en: "Counsellor" },
  { value: "student", ar: "طالب", en: "Student" },
  { value: "guardian", ar: "ولي أمر", en: "Guardian" },
];

const roleLabel = (role: string, isArabic: boolean) => roleOptions.find(option => option.value === role)?.[isArabic ? "ar" : "en"] ?? role;

export function InstitutionTeamPanel({ isArabic, institutionId }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<TeamRole>("teacher");
  const [inviteToken, setInviteToken] = useState("");
  const membersQuery = trpc.institution.members.useQuery({ institutionId: institutionId ?? "" }, { enabled: Boolean(institutionId), retry: false });
  const invite = trpc.auth.invite.useMutation({
    onSuccess: result => {
      setInviteToken(result.inviteToken);
      setEmail("");
      setName("");
      membersQuery.refetch();
      toast.success(isArabic ? "تم إنشاء الدعوة. شارك الرمز مع المستخدم." : "Invitation created. Share the code with the user.");
    },
    onError: error => toast.error(error.message),
  });
  const activeCount = useMemo(() => (membersQuery.data ?? []).filter(item => item.membership.status === "active").length, [membersQuery.data]);

  const copyToken = async () => {
    if (!inviteToken) return;
    await navigator.clipboard?.writeText(inviteToken);
    toast.success(isArabic ? "تم نسخ رمز الدعوة." : "Invitation code copied.");
  };

  if (!institutionId) return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">{isArabic ? "لا توجد مؤسسة مرتبطة بهذا الحساب بعد." : "No institution is linked to this account yet."}</section>;

  return <div className="space-y-5" dir={isArabic ? "rtl" : "ltr"}>
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(35,49,82,0.06)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><div className="flex items-center gap-2 text-indigo-600"><ShieldCheck className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.16em]">{isArabic ? "صلاحيات المؤسسة" : "Institution access"}</span></div><h2 className="mt-3 text-2xl font-black text-slate-900">{isArabic ? "أضف فريقك بأدوار واضحة" : "Add your team with clear roles"}</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">{isArabic ? "كل دعوة تنتمي إلى هذه المؤسسة، وتحدد ما يستطيع المستخدم فتحه بعد تفعيل كلمة المرور." : "Every invitation belongs to this institution and defines what the user can open after setting a password."}</p></div>
        <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-center"><p className="text-2xl font-black text-indigo-700">{activeCount}</p><p className="text-xs font-semibold text-indigo-600">{isArabic ? "أعضاء نشطون" : "Active members"}</p></div>
      </div>
      <form onSubmit={event => { event.preventDefault(); invite.mutate({ institutionId, email, name: name || undefined, role }); }} className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_190px_auto]">
        <label className="block"><span className="mb-2 block text-xs font-bold text-slate-500">{isArabic ? "البريد الإلكتروني" : "Email address"}</span><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white" /></div></label>
        <label className="block"><span className="mb-2 block text-xs font-bold text-slate-500">{isArabic ? "اسم المستخدم (اختياري)" : "User name (optional)"}</span><input value={name} onChange={event => setName(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white" /></label>
        <label className="block"><span className="mb-2 block text-xs font-bold text-slate-500">{isArabic ? "الدور" : "Role"}</span><select value={role} onChange={event => setRole(event.target.value as TeamRole)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white">{roleOptions.map(option => <option key={option.value} value={option.value}>{isArabic ? option.ar : option.en}</option>)}</select></label>
        <button disabled={invite.isPending} className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(79,70,229,0.2)] transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">{invite.isPending ? "…" : <><Mail className="h-4 w-4" />{isArabic ? "إنشاء الدعوة" : "Create invite"}</>}</button>
      </form>
      {inviteToken && <div className="mt-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-black text-emerald-900"><Check className="h-4 w-4" />{isArabic ? "رمز الدعوة جاهز" : "Invitation code ready"}</p><p className="mt-1 text-xs leading-6 text-emerald-800">{isArabic ? "يرجى إرساله عبر قناة المؤسسة المعتمدة. الرمز صالح لمدة سبعة أيام." : "Send it through your approved school channel. The code is valid for seven days."}</p><code className="mt-2 block break-all rounded-lg bg-white px-3 py-2 text-xs text-emerald-950">{inviteToken}</code></div><button type="button" onClick={copyToken} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-white"><Copy className="h-3.5 w-3.5" />{isArabic ? "نسخ" : "Copy"}</button></div>}
    </section>
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(35,49,82,0.06)]">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-indigo-600" /><h3 className="font-black text-slate-800">{isArabic ? "أعضاء المؤسسة" : "Institution members"}</h3></div><span className="text-xs text-slate-400">{membersQuery.isLoading ? "…" : (membersQuery.data ?? []).length}</span></header>
      {membersQuery.error && <p className="px-5 py-4 text-sm leading-7 text-rose-600">{membersQuery.error.message}</p>}
      {!membersQuery.error && !membersQuery.isLoading && !(membersQuery.data ?? []).length && <p className="px-5 py-8 text-center text-sm text-slate-400">{isArabic ? "لا يوجد أعضاء بعد." : "No members yet."}</p>}
      <div className="divide-y divide-slate-100">{(membersQuery.data ?? []).map(item => <div key={item.membership.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-800">{item.user.name || item.user.email || "—"}</p><p className="mt-1 text-xs text-slate-400">{item.user.email || "—"}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{roleLabel(item.membership.role, isArabic)}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.membership.status === "active" ? "bg-emerald-50 text-emerald-700" : item.membership.status === "invited" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{item.membership.status === "active" ? (isArabic ? "نشط" : "Active") : item.membership.status === "invited" ? (isArabic ? "بانتظار التفعيل" : "Invited") : (isArabic ? "موقوف" : "Suspended")}</span></div></div>)}</div>
    </section>
  </div>;
}
