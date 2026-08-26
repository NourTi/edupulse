import EduPulseApp from "@/components/EduPulseApp";
import { FloatingAIWidget } from "@/components/FloatingAIWidget";

/**
 * EduPulse design reminder: routes directly to the Arabic-first local education
 * console, preserving the supplied video, type system, and liquid-glass style.
 */
export default function Home() {
  return <><EduPulseApp /><FloatingAIWidget /></>;
}
