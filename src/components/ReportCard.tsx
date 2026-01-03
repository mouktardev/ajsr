import { CertificatePDFViewer } from '@/components/CertificatePDFViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ResultCellProps, ResultRowView, useResultCell, useTable } from '@/lib/tinybase';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function formatDateArabic(d: Date | null) {
  if (!d) return '';
  const day = d.getDate();
  const month = AR_MONTHS[d.getMonth()] || (d.getMonth() + 1).toString();
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function ReportCard({ manuscriptId }: { manuscriptId: string }) {
  return (
    <ResultRowView
      queryId="manuscriptsQuery"
      rowId={manuscriptId}
      resultCellComponent={ReportCardResultCell}
    />
  );
}

// A ResultCell-compatible card for use with `ResultRowView`.
export function ReportCardResultCell(props: typeof ResultCellProps) {
  const manuscriptId = useResultCell(props.queryId, props.rowId, 'manuscriptId') as string
  const author = useResultCell(props.queryId, props.rowId, 'author') as string
  const title = useResultCell(props.queryId, props.rowId, 'title') as string
  const type = useResultCell(props.queryId, props.rowId, 'type') as string
  const editor = useResultCell(props.queryId, props.rowId, 'editor') as string
  const daysWithEditor = useResultCell(props.queryId, props.rowId, 'daysWithEditor') as number
  const initialSubmissionDate = useResultCell(props.queryId, props.rowId, 'initialSubmissionDate') as number
  const editorialStatus = useResultCell(props.queryId, props.rowId, 'editorialStatus') as string
  const historyTable = useTable('history');

  const historyRows = useMemo(() => {
    return Object.values(historyTable)
      .filter((r: any) => r.manuscriptId === manuscriptId)
      .sort((a: any, b: any) => (a.agreeDate || 0) - (b.agreeDate || 0));
  }, [historyTable, manuscriptId]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      // Build a clearer, multiline history block and use CRLF for better paste behavior
      const historyText = historyRows
        .map((r: any) => {
          const agreeDate = r.agreeDate ? new Date(r.agreeDate) : null;
          const inviteDate = r.dateInvited ? new Date(r.dateInvited) : null;
          const completed = r.reviewComplete === 'True';
          const revisionLabel = r.revision == null
            ? ''
            : r.revision === '0'
            ? 'original submission'
            : `revision ${r.revision}`;

          const lines = [
            `• ${r.reviewerName}${revisionLabel ? ` - ${revisionLabel}` : ''}`,
            `  دعوة: ${formatDateArabic(inviteDate)}`,
            `  موافقة: ${formatDateArabic(agreeDate)}`,
            completed ? `  توصية المراجع: ${r.recommendation || ''}` : `  الحالة: لم تكتمل`,
          ].filter(Boolean);

          return lines.join('\r\n');
        })
        .join('\r\n\r\n'); // blank line between entries

      const text = [
        `${author || ''} (${manuscriptId})`,
        `العنوان: ${title || ''}`,
        `النوع: ${type || ''}`,
        `المحرر: ${editor || 'لم يحدد بعد'}`,
        '',
        'سجل المراجعة:',
        historyText,
      ].join('\r\n');

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('فشل النسخ');
    }
  };

  return props.cellId === "title" ? (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex">
          <Button onClick={copy} variant="outline" size="sm" className="gap-2">
            {copied ? (
              <>
                <IconCheck className="size-4" />
                تم النسخ
              </>
            ) : (
              <>
                <IconCopy className="size-4" />
                نسخ
              </>
            )}
          </Button>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-md font-mono text-sm font-semibold">
            {manuscriptId}
          </span>
        </div>
        <div className=" border-b mb-6 pb-4">
          <h2 className="text-2xl font-bold text-foreground">{author || 'بدون مؤلف'}</h2>
          <p className="text-sm text-muted-foreground mt-1">{title || ''}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">النوع</p>
            <p className="font-medium text-foreground">{type || 'غير محدد'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">المحرر</p>
            <p className="font-medium text-foreground">{editor || 'لم يحدد بعد'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">الحالة</p>
            <p className="font-medium text-foreground">{editorialStatus || 'غير محدد'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">الأيام مع المحرر</p>
            <p className="font-medium text-foreground">{daysWithEditor || 0} أيام</p>
          </div>
          <div className="text-right col-span-2">
            <p className="text-xs text-muted-foreground mb-1">تاريخ التقديم الأولي</p>
            <p className="font-medium text-foreground">
              {initialSubmissionDate ? formatDateArabic(new Date(initialSubmissionDate)) : 'غير محدد'}
            </p>
          </div>
        </div>

        {historyRows.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-semibold text-foreground mb-2">Manuscript: {manuscriptId}</p>
              <p className="text-xs text-muted-foreground">{author || 'بدون مؤلف'}</p>
            </div>
            
            <p className="text-sm font-semibold text-foreground">سجل المراجعة</p>
            <div className="space-y-4">
              {historyRows.map((r: any, idx: number) => {
                const agreeDate = r.agreeDate ? new Date(r.agreeDate) : null;
                const inviteDate = r.dateInvited ? new Date(r.dateInvited) : null;
                const completed = r.reviewComplete === 'True';
                const revisionLabel = r.revision == null
                  ? ''
                  : r.revision === '0'
                  ? 'original submission'
                  : `revision ${r.revision}`;

                return (
                  <div key={idx} className="p-4 border rounded-lg space-y-2">
                    <div>
                      <p className="font-semibold text-foreground">{r.reviewerName}</p>
                      {revisionLabel && <p className="text-sm text-muted-foreground">{revisionLabel}</p>}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>دعوة: {formatDateArabic(inviteDate)}</p>
                      <p>موافقة: {formatDateArabic(agreeDate)}</p>
                    </div>
                    
                    {completed ? (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">قرار المراجع : {r.recommendation || '—'}</p>
                        <div className="mt-3">
                          <CertificatePDFViewer
                            reviewerName={r.reviewerName}
                            manuscriptTitle={title}
                            manuscriptId={manuscriptId}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">قرار المراجع : قيد الانتظار </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  ):null;
}
