import FileUpload from '@/components/FileUpload';
import ReportCard from '@/components/ReportCard';
import { Search } from '@/components/Search';
import { SearchSchema, useResultSortedRowIds } from '@/lib/tinybase';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

export const Route = createFileRoute('/_home/report/')({
  component: RouteComponent,
  validateSearch: zodValidator(SearchSchema),
})

function RouteComponent() {
 return (
    <section className="container mx-auto flex flex-1 flex-col gap-5 p-3 md:p-5">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">مولد تقارير محرري AJSR</h1>
        <p className="text-muted-foreground text-lg">استيراد وإدارة بيانات المخطوطات والمراجعات</p>
      </div>
      <div className="space-y-8">
        <FileUpload />
        <Search/>
        <ManuscriptList />
      </div>
    </section>
    
  )
}

function ManuscriptList() {
  const manuscriptIds = useResultSortedRowIds('manuscriptsQuery', 'initialSubmissionDate', false)
  if (!manuscriptIds.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <p className="text-foreground text-lg">لا توجد مخطوطات حتى الآن</p>
        <p className="text-muted-foreground text-sm mt-2">قم بتحميل ملف .tab في الأعلى لعرض التقارير</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">التقارير ({manuscriptIds.length})</h2>
      <div className="grid gap-4">
        {manuscriptIds.map((id) => (
          <ReportCard key={id} manuscriptId={id} />
        ))}
      </div>
    </div>
  );
}