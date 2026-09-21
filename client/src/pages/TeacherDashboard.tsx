import { DocumentImporter } from '@/components/teacher/DocumentImporter';

export default function TeacherDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teacher Resources</h1>
      <DocumentImporter />
    </div>
  );
}
