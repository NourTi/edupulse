import React, { useState } from "react";
import {
  Phone,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Key,
  Copy,
  Check,
  Send,
  Sparkles,
} from "lucide-react";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (phoneNumber: string, carrier?: string) => void;
  isArabic?: boolean;
}

export function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerified,
  isArabic = true,
}: PhoneVerificationModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("0661234567");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"enter_phone" | "enter_otp">("enter_phone");
  const [carrierInfo, setCarrierInfo] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const defaultApiKey = "num_live_GtX4eOYWwoE1uoEa0c60IrKASHVraweeeIpOHRsu";

  const sendOtpMutation = trpc.integrations.sendPhoneOtp.useMutation();
  const verifyOtpMutation = trpc.integrations.verifyPhoneOtp.useMutation();

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    try {
      const res = await sendOtpMutation.mutateAsync({
        phoneNumber: phoneNumber.trim(),
      });

      if (res.valid) {
        setCarrierInfo(res);
        setStep("enter_otp");
        toast.success(res.messageAr);
        if (res.verificationCode) {
          setOtpCode(res.verificationCode); // Auto-fill for ultra-smooth user experience!
        }
      } else {
        toast.error(res.messageAr);
      }
    } catch (err: any) {
      toast.error(err.message || (isArabic ? "تعذر التحقق من الرقم" : "Verification failed"));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    try {
      const res = await verifyOtpMutation.mutateAsync({
        phoneNumber: phoneNumber.trim(),
        code: otpCode.trim(),
      });

      if (res.success) {
        toast.success(res.messageAr);
        onVerified?.(phoneNumber, carrierInfo?.carrier);
        onClose();
      } else {
        toast.error(res.messageAr);
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP code");
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(defaultApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    toast.success(isArabic ? "تم نسخ مفتاح API بنجاح" : "API key copied");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir={isArabic ? "rtl" : "ltr"}>
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isArabic ? "التحقق السريع عبر رقم الهاتف" : "Phone Verification (NumLookup)"}
            </h3>
            <p className="text-xs text-slate-500">
              {isArabic ? "تسجيل دخول آمن وفوري للأساتذة والطلبة" : "Fast passwordless sign-in for students & teachers"}
            </p>
          </div>
        </div>

        {/* NumLookup Live API Key Banner (from dashboard screenshot) */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-blue-600" />
              <span>NumLookupAPI Live Key</span>
            </span>
            <button
              onClick={copyApiKey}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
            >
              {copiedKey ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copiedKey ? (isArabic ? "تم النسخ" : "Copied") : isArabic ? "نسخ" : "Copy"}</span>
            </button>
          </div>
          <p className="font-mono text-[10px] text-slate-500 truncate">{defaultApiKey}</p>
        </div>

        {/* Step 1: Phone Input */}
        {step === "enter_phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isArabic ? "رقم الهاتف المحمول (موبيليس، جيزي، أوريدو)" : "Mobile Phone Number"}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0661234567 أو +213661234567"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-mono text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {isArabic ? "التحقق التلقائي من شبكة الاتصال والصلاحية الفورية" : "Automatic carrier detection and format verification"}
              </p>
            </div>

            <button
              type="submit"
              disabled={sendOtpMutation.isPending || !phoneNumber.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-600/30"
            >
              {sendOtpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{sendOtpMutation.isPending ? (isArabic ? "جاري التحقق..." : "Validating...") : isArabic ? "إرسال رمز التحقق" : "Send Code"}</span>
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {carrierInfo && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
                <div className="flex items-center justify-between font-semibold">
                  <span>{carrierInfo.carrier}</span>
                  <span>{carrierInfo.countryName}</span>
                </div>
                <p className="mt-1 text-[11px] text-blue-700">
                  {isArabic ? `تم إرسال رمز التحقق للرقم ${carrierInfo.number}` : `OTP sent to ${carrierInfo.number}`}
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isArabic ? "رمز التحقق السريع (OTP)" : "Enter Verification Code"}
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="4 أرقام"
                maxLength={6}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-xl font-bold font-mono tracking-widest text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <p className="mt-1 text-[11px] text-slate-400 text-center">
                {isArabic ? "تم توليد الرمز تلقائياً للمحاكاة السريعة" : "Code automatically pre-filled for rapid demo sign-in"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("enter_phone")}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                {isArabic ? "تغيير الرقم" : "Back"}
              </button>

              <button
                type="submit"
                disabled={verifyOtpMutation.isPending || !otpCode.trim()}
                className="flex-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-md shadow-emerald-600/30"
              >
                {verifyOtpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                <span>{verifyOtpMutation.isPending ? (isArabic ? "جاري التأكيد..." : "Verifying...") : isArabic ? "تأكيد الدخول" : "Confirm Sign-In"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
