import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRow, useTable } from '@/lib/tinybase';
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
  const manuscript = useRow('manuscripts', manuscriptId)
  const historyTable = useTable('history')
  const [copied, setCopied] = useState(false);

  const historyRows = useMemo(() => {
    return Object.values(historyTable)
      .filter((r: any) => r.manuscriptId === manuscriptId)
      .sort((a: any, b: any) => (a.agreeDate || 0) - (b.agreeDate || 0));
  }, [historyTable, manuscriptId]);

  const copy = async () => {
    try {
      const text = [
        `${manuscript.author || ''} (${manuscriptId})`,
        `العنوان: ${manuscript.title || ''}`,
        `النوع: ${manuscript.type || ''}`,
        `المحرر: ${manuscript.editor || 'لم يحدد بعد'}`,
        '',
        'سجل المراجعة:',
        ...historyRows.map((r: any) => {
          const agreeDate = r.agreeDate ? new Date(r.agreeDate) : null;
          const inviteDate = r.dateInvited ? new Date(r.dateInvited) : null;
          const completedStatus = r.reviewComplete === 'True' ? '✓' : r.reviewComplete === 'False' ? '✗' : '';
          return `• ${r.reviewerName} - دعوة: ${formatDateArabic(inviteDate)} - موافقة: ${formatDateArabic(agreeDate)} - ${completedStatus} - ${r.recommendation}`;
        })
      ].join('\n');
      
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('فشل النسخ');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{manuscript.author || 'بدون مؤلف'}</h2>
            <p className="text-sm text-muted-foreground mt-1">{manuscript.title || ''}</p>
          </div>
          <div className="text-right mr-4">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-md font-mono text-sm font-semibold">
              {manuscriptId}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">النوع</p>
            <p className="font-medium text-foreground">{manuscript.type || 'غير محدد'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">المحرر</p>
            <p className="font-medium text-foreground">{manuscript.editor || 'لم يحدد بعد'}</p>
          </div>
        </div>

        {/* History/Timeline */}
        {historyRows.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground mb-4">سجل المراجعة</p>
            <div className="space-y-3">
              {historyRows.map((r: any, idx: number) => {
                const agreeDate = r.agreeDate ? new Date(r.agreeDate) : null;
                const inviteDate = r.dateInvited ? new Date(r.dateInvited) : null;
                const completedStatus = r.reviewComplete === 'True' ? '✓' : r.reviewComplete === 'False' ? '✗' : '';
                const revisionNum = r.revision && r.revision !== '0' ? `(R${r.revision})` : '';

                return (
                  <div key={idx} className="flex items-start gap-3 text-sm pb-3 border-b last:border-b-0">
                    <div className="flex-1 text-right space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{r.reviewerName}</span>
                        <span className="text-xs text-muted-foreground">{completedStatus}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>دعوة: {formatDateArabic(inviteDate)}</p>
                        <p>موافقة: {formatDateArabic(agreeDate)}</p>
                      </div>
                      <p className="text-sm">{r.recommendation}</p>
                      {revisionNum && <p className="text-xs text-muted-foreground">{revisionNum}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Copy Button */}
        <div className="mt-6 pt-4 border-t flex justify-end">
          <Button
            onClick={copy}
            variant="outline"
            size="sm"
            className="gap-2"
          >
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
        </div>
      </CardContent>
    </Card>
  );
}
