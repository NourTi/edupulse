import EduPulseApp from "@/components/EduPulseApp";
import { DocumentImporter } from '@/components/teacher/DocumentImporter';

// In your return:
<div>
  <h1>Welcome</h1>
  <DocumentImporter />
</div>

// import { FloatingAIWidget } from "@/components/FloatingAIWidget";

/**
 * EduPulse design reminder: routes directly to the Arabic-first local education
 * console, preserving the supplied video, type system, and liquid-glass style.
 */
export default function Home() {
  return <><EduPulseApp /></>;
}
