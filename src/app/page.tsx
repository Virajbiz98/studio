import ResumeForm from '@/components/resume-form';
import { Toaster } from '@/components/ui/toaster';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ResumeForm />
      <Toaster />
    </main>
  );
}
