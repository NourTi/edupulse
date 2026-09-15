import { useState, useEffect } from "react";
import { Sparkles, Laptop, Coffee, BookOpen, GraduationCap, Lightbulb, Code2 } from "lucide-react";

export function AnimatedDeskIllustration({ isArabic = false }: { isArabic?: boolean }) {
  const [lampOn, setLampOn] = useState(true);
  const [coffeeClicks, setCoffeeClicks] = useState(0);
  const [activeSubject, setActiveSubject] = useState<"math" | "physics" | "code">("math");

  // Cycle subjects automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSubject((prev) => (prev === "math" ? "physics" : prev === "physics" ? "code" : "math"));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden p-2 sm:p-6">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-64 h-64 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

      {/* Floating Interactive Academic Badges */}
      <div className="absolute top-8 left-6 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-purple-200 backdrop-blur-md shadow-lg shadow-black/20">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{isArabic ? "جلسة دراسة نشطة · بكالوريا 2026" : "Focus Session · BAC 2026"}</span>
      </div>

      <div className="absolute top-8 right-6 z-20 flex items-center gap-1.5 rounded-full border border-purple-400/20 bg-purple-950/40 px-3 py-1 text-[11px] font-bold text-purple-300 backdrop-blur-md">
        <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-spin" style={{ animationDuration: "8s" }} />
        <span>{activeSubject === "math" ? "Math (الرياضيات)" : activeSubject === "physics" ? "Physics (الفيزياء)" : "Code (الخوارزميات)"}</span>
      </div>

      {/* Main Interactive Animated SVG Scene */}
      <div className="relative w-full max-w-[460px] aspect-[4/3] flex items-center justify-center">
        <svg
          viewBox="0 0 500 380"
          className="w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Lamp Light Gradient */}
            <linearGradient id="lampGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#facc15" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </linearGradient>

            {/* Laptop Screen Glow */}
            <linearGradient id="screenGlow" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </linearGradient>

            {/* Desk Gradient */}
            <linearGradient id="deskGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#252033" />
              <stop offset="50%" stopColor="#352e47" />
              <stop offset="100%" stopColor="#252033" />
            </linearGradient>

            {/* Steam Animation */}
            <style>
              {`
                @keyframes typingHands {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-2px); }
                }
                @keyframes characterBreathe {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-1.5px) rotate(0.2deg); }
                }
                @keyframes steamRise {
                  0% { opacity: 0; transform: translateY(0) scaleX(0.8); }
                  50% { opacity: 0.6; transform: translateY(-8px) scaleX(1.2); }
                  100% { opacity: 0; transform: translateY(-18px) scaleX(1.5); }
                }
                @keyframes screenFlicker {
                  0%, 100% { opacity: 0.95; }
                  50% { opacity: 1; }
                }
                @keyframes floatParticle {
                  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                  50% { transform: translateY(-10px) translateX(4px); opacity: 0.8; }
                }
                .anim-typing { animation: typingHands 0.6s infinite ease-in-out; }
                .anim-breathe { animation: characterBreathe 3.5s infinite ease-in-out; }
                .anim-steam { animation: steamRise 2s infinite ease-out; }
                .anim-screen { animation: screenFlicker 2s infinite alternate; }
                .anim-float-1 { animation: floatParticle 4s infinite ease-in-out; }
                .anim-float-2 { animation: floatParticle 5s infinite ease-in-out 1s; }
                .anim-float-3 { animation: floatParticle 3.8s infinite ease-in-out 2s; }
              `}
            </style>
          </defs>

          {/* Floating Academic Icons in Background */}
          <g className="anim-float-1">
            <text x="70" y="110" fill="#a78bfa" fontSize="16" fontFamily="monospace" opacity="0.6">∫ f(x)dx</text>
          </g>
          <g className="anim-float-2">
            <text x="390" y="120" fill="#67e8f9" fontSize="18" fontFamily="sans-serif" opacity="0.5">∑</text>
          </g>
          <g className="anim-float-3">
            <text x="410" y="70" fill="#f472b6" fontSize="14" fontFamily="monospace" opacity="0.5">E = mc²</text>
          </g>
          <g className="anim-float-1">
            <circle cx="100" cy="60" r="1.5" fill="#ffffff" opacity="0.7" />
            <circle cx="160" cy="40" r="2" fill="#c084fc" opacity="0.6" />
            <circle cx="340" cy="50" r="1.5" fill="#38bdf8" opacity="0.5" />
          </g>

          {/* Room / Window Arch Outline (Atmospheric) */}
          <path
            d="M 60 270 L 60 80 Q 250 20 440 80 L 440 270"
            stroke="#4338ca"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            opacity="0.25"
          />

          {/* Chair Backrest */}
          <rect x="200" y="140" width="100" height="120" rx="20" fill="#1e1b2e" stroke="#3b3353" strokeWidth="2" />
          <rect x="210" y="150" width="80" height="90" rx="14" fill="#2a243d" />

          {/* Character Group with Subtle Breathing */}
          <g className="anim-breathe">
            {/* Character Torso (Sweater / Hoodie) */}
            <path
              d="M 195 270 Q 250 240 305 270 L 295 300 L 205 300 Z"
              fill="#6366f1"
            />
            {/* Hoodie / Collar details */}
            <path d="M 230 248 Q 250 262 270 248" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
            <path d="M 242 258 L 242 276" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" />
            <path d="M 258 258 L 258 276" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" />

            {/* Neck */}
            <rect x="240" y="226" width="20" height="24" rx="4" fill="#fbcfe8" />

            {/* Head */}
            <ellipse cx="250" cy="195" rx="26" ry="32" fill="#fed7aa" />

            {/* Modern Stylish Hair */}
            <path
              d="M 222 195 C 220 160 245 150 265 155 C 280 159 285 175 278 190 C 274 165 240 165 228 185 Z"
              fill="#312e81"
            />
            <path
              d="M 224 180 C 228 160 250 156 270 160 C 276 168 274 182 272 192"
              fill="#1e1b4b"
            />

            {/* Headphones (Curved Band & Ear Cups) */}
            <path
              d="M 220 195 C 218 155 282 155 280 195"
              stroke="#a855f7"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <rect x="216" y="185" width="8" height="20" rx="4" fill="#7e22ce" />
            <rect x="276" y="185" width="8" height="20" rx="4" fill="#7e22ce" />

            {/* Eyes & Glasses (Looking Down toward laptop screen) */}
            <rect x="232" y="188" width="14" height="10" rx="3" fill="#ffffff" stroke="#4338ca" strokeWidth="1.5" opacity="0.9" />
            <rect x="254" y="188" width="14" height="10" rx="3" fill="#ffffff" stroke="#4338ca" strokeWidth="1.5" opacity="0.9" />
            <line x1="246" y1="193" x2="254" y2="193" stroke="#4338ca" strokeWidth="1.5" />
            <circle cx="239" cy="194" r="2" fill="#1e1b4b" />
            <circle cx="261" cy="194" r="2" fill="#1e1b4b" />

            {/* Gentle Smile */}
            <path d="M 245 212 Q 250 216 255 212" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Desk Lamp (Interactive click toggles light) */}
          <g
            className="cursor-pointer group"
            onClick={() => setLampOn(!lampOn)}
          >
            {/* Lamp Base */}
            <ellipse cx="90" cy="275" rx="20" ry="7" fill="#312e81" stroke="#4f46e5" strokeWidth="1.5" />
            {/* Lamp Angled Arm */}
            <path
              d="M 90 275 L 85 200 L 125 150"
              stroke="#6366f1"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="85" cy="200" r="4" fill="#818cf8" />
            <circle cx="125" cy="150" r="5" fill="#818cf8" />
            {/* Lamp Shade */}
            <path
              d="M 115 140 L 145 160 L 132 172 L 102 152 Z"
              fill="#4f46e5"
              stroke="#a5b4fc"
              strokeWidth="1.5"
            />
            {/* Light Bulb */}
            <circle cx="122" cy="164" r="5" fill={lampOn ? "#fef08a" : "#64748b"} />

            {/* Lamp Light Cone cast onto the desk */}
            {lampOn && (
              <polygon
                points="120,166 60,300 230,300"
                fill="url(#lampGlow)"
                className="transition-opacity duration-300"
              />
            )}
          </g>

          {/* Modern Desk Surface */}
          <rect x="40" y="270" width="420" height="14" rx="4" fill="url(#deskGrad)" stroke="#4c4263" strokeWidth="1" />
          {/* Desk Edge Bevel */}
          <rect x="42" y="284" width="416" height="6" fill="#1a1626" />
          {/* Desk Legs */}
          <rect x="70" y="290" width="10" height="70" rx="3" fill="#2e283d" />
          <rect x="420" y="290" width="10" height="70" rx="3" fill="#2e283d" />
          <line x1="75" y1="330" x2="425" y2="330" stroke="#3b3350" strokeWidth="3" />

          {/* Books Stack on Left of Desk */}
          <g>
            {/* Book 1 (Bottom - Blue) */}
            <rect x="130" y="260" width="45" height="10" rx="2" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
            <line x1="133" y1="265" x2="170" y2="265" stroke="#93c5fd" strokeWidth="1" />
            {/* Book 2 (Middle - Emerald) */}
            <rect x="133" y="250" width="40" height="10" rx="2" fill="#059669" stroke="#047857" strokeWidth="1" />
            <line x1="136" y1="255" x2="168" y2="255" stroke="#6ee7b7" strokeWidth="1" />
            {/* Book 3 (Top - Purple) */}
            <rect x="135" y="241" width="36" height="9" rx="2" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
          </g>

          {/* Plant / Succulent in Minimalist Pot */}
          <g>
            <polygon points="395,270 415,270 412,254 398,254" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="405" cy="248" r="7" fill="#10b981" />
            <circle cx="400" cy="245" r="5" fill="#34d399" />
            <circle cx="410" cy="245" r="5" fill="#059669" />
          </g>

          {/* Coffee Mug with Steaming Vapor (Interactive click adds steam) */}
          <g
            className="cursor-pointer group"
            onClick={() => setCoffeeClicks((c) => c + 1)}
          >
            {/* Mug Body */}
            <rect x="360" y="254" width="18" height="16" rx="3" fill="#f43f5e" stroke="#fda4af" strokeWidth="1" />
            {/* Mug Handle */}
            <path d="M 378 258 C 383 258 383 266 378 266" stroke="#fda4af" strokeWidth="2" fill="none" />
            {/* Steam Wisps */}
            <g className="anim-steam">
              <path d="M 365 250 Q 363 242 367 236 Q 371 230 368 224" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
              <path d="M 372 251 Q 375 244 371 238 Q 367 232 371 226" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
            </g>
          </g>

          {/* Laptop and Screen */}
          <g className="anim-screen">
            {/* Screen Glow cast upward */}
            <polygon points="210,270 290,270 315,190 185,190" fill="url(#screenGlow)" />

            {/* Laptop Base / Keyboard */}
            <polygon points="205,270 295,270 305,276 195,276" fill="#475569" stroke="#64748b" strokeWidth="1" />
            {/* Trackpad */}
            <rect x="238" y="272" width="24" height="3" rx="1" fill="#334155" />

            {/* Laptop Display Screen (Tilted Back) */}
            <polygon points="208,268 292,268 300,195 200,195" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            {/* Inner Glowing Screen */}
            <polygon points="212,265 288,265 296,199 204,199" fill="#1e1b4b" />

            {/* Animated Code / Equations on Laptop Screen */}
            <g>
              {activeSubject === "math" && (
                <>
                  <rect x="212" y="205" width="40" height="3" rx="1" fill="#38bdf8" />
                  <rect x="212" y="212" width="55" height="3" rx="1" fill="#a855f7" />
                  <rect x="212" y="219" width="30" height="3" rx="1" fill="#4ade80" />
                  <rect x="212" y="226" width="65" height="3" rx="1" fill="#f43f5e" />
                  <rect x="212" y="233" width="45" height="3" rx="1" fill="#facc15" />
                  {/* Miniature Graph */}
                  <path d="M 265 255 Q 275 235 285 245" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                </>
              )}
              {activeSubject === "physics" && (
                <>
                  <rect x="212" y="205" width="50" height="3" rx="1" fill="#ec4899" />
                  <rect x="212" y="212" width="35" height="3" rx="1" fill="#38bdf8" />
                  <circle cx="260" cy="230" r="10" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                  <circle cx="260" cy="230" r="3" fill="#facc15" />
                  <rect x="212" y="242" width="60" height="3" rx="1" fill="#4ade80" />
                </>
              )}
              {activeSubject === "code" && (
                <>
                  <rect x="212" y="205" width="30" height="3" rx="1" fill="#4ade80" />
                  <rect x="220" y="212" width="50" height="3" rx="1" fill="#38bdf8" />
                  <rect x="228" y="219" width="45" height="3" rx="1" fill="#c084fc" />
                  <rect x="220" y="226" width="35" height="3" rx="1" fill="#facc15" />
                  <rect x="212" y="233" width="20" height="3" rx="1" fill="#4ade80" />
                </>
              )}
            </g>
          </g>

          {/* Hands & Arms in Typing Gesture */}
          <g className="anim-typing">
            {/* Left Arm & Hand */}
            <path d="M 215 270 Q 225 264 235 268" stroke="#6366f1" strokeWidth="9" strokeLinecap="round" />
            <circle cx="236" cy="268" r="4.5" fill="#fed7aa" />

            {/* Right Arm & Hand */}
            <path d="M 285 270 Q 275 264 265 268" stroke="#6366f1" strokeWidth="9" strokeLinecap="round" />
            <circle cx="264" cy="268" r="4.5" fill="#fed7aa" />
          </g>
        </svg>
      </div>

      {/* Interactive Controls Bar underneath illustration */}
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-purple-200/80">
        <button
          type="button"
          onClick={() => setLampOn(!lampOn)}
          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10 transition text-[11px]"
        >
          <Lightbulb className={`h-3 w-3 ${lampOn ? "text-yellow-300" : "text-slate-400"}`} />
          <span>{lampOn ? (isArabic ? "مصباح المكتب: مضاء" : "Desk Lamp: On") : (isArabic ? "مصباح المكتب: مطفأ" : "Desk Lamp: Off")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubject((prev) => (prev === "math" ? "physics" : prev === "physics" ? "code" : "math"))}
          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10 transition text-[11px]"
        >
          <Laptop className="h-3 w-3 text-cyan-300" />
          <span>{isArabic ? "تبديل المادة" : "Switch Subject"}</span>
        </button>
      </div>
    </div>
  );
}
