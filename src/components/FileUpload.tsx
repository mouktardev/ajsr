import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseTab } from '@/lib/parseTab';
import { useStore } from '@/lib/tinybase';
import React, { useCallback, useState } from 'react';

export default function FileUpload() {
  const store = useStore();
  const [status, setStatus] = useState<string>('');

  const handleFile = useCallback(async (file: File, kind: 'A' | 'B') => {
    setStatus(`قراءة الملف ${file.name} ...`);
    const text = await file.text();
    const rows = parseTab(text);

    if (kind === 'A') {
      // Metadata - batch in a transaction
      store?.transaction(() => {
        for (const r of rows) {
          const manuscriptId = (r['Manuscript Number'] || r['ManuscriptNumber'] || r['manuscript number'] || r['Manuscript_Number'] || '').toString().trim();
          if (!manuscriptId) continue;
          const author = (r['Corresponding Author First Name'] || r['Author'] || r['Corresponding Author'] || r['author'] || r['Corresponding Author First Name'] || '').toString().trim();
          const title = (r['Article Title'] || r['Title'] || '').toString().trim();
          const type = (r['Article Type'] || r['ArticleType'] || r['type'] || '').toString().trim();
          const editor = (r['Editor First Name'] || r['Editor'] || '').toString().trim();
          const daysWithEditorRaw = (r['Days with Editor'] || '').toString().trim();
          const daysWithEditor = parseInt(daysWithEditorRaw, 10) || 0;
          const initialSubmissionDateRaw = (r['Initial Submission Date'] || '').toString().trim();
          const initialSubmissionDateParsed = parsePossibleDate(initialSubmissionDateRaw);
          const editorialStatus = (r['Editorial Status'] || '').toString().trim();

          store.setRow('manuscripts', manuscriptId, { 
            manuscriptId, 
            author, 
            title, 
            type, 
            editor: editor || 'لم يحدد بعد',
            daysWithEditor,
            initialSubmissionDate: initialSubmissionDateParsed?.getTime() || 0,
            initialSubmissionDateRaw,
            editorialStatus: editorialStatus || 'غير محدد',
          });
        }
      });
      setStatus('تم استيراد بيانات الميتاداتا (A).');
    } else {
      // History - batch in a transaction
      store?.transaction(() => {
        for (const r of rows) {
          const mid = (r['Manuscript Number'] || r['ManuscriptNumber'] || r['manuscript number'] || '').toString().trim();
          if (!mid) continue;
          
          const reviewerName = (r['Reviewer First Name'] || r['Reviewer'] || '').toString().trim();
          const dateInvitedRaw = (r['Date Reviewer Invited'] || '').toString().trim();
          const agreeDateRaw = (r['Agree Date'] || '').toString().trim();
          const reviewComplete = (r['Review Complete'] || '').toString().trim();
          const recommendation = (r['Reviewer Recommendation'] || '').toString().trim();
          const revision = (r['Revision Number'] || r['Revision'] || '').toString().trim();
          
          const dateInvitedParsed = parsePossibleDate(dateInvitedRaw);
          const agreeDateParsed = parsePossibleDate(agreeDateRaw);
          
          const rowId = `${mid}-${revision}-${reviewerName}-${dateInvitedRaw}`;
          
          store.setRow('history', rowId, {
            manuscriptId: mid,
            reviewerName: reviewerName || 'بدون اسم',
            dateInvited: dateInvitedParsed?.getTime() || 0,
            dateInvitedRaw,
            agreeDate: agreeDateParsed?.getTime() || 0,
            agreeDateRaw,
            reviewComplete,
            recommendation: recommendation || 'لم يحدد بعد',
            revision: revision || '0',
          });
        }
      });
      setStatus('تم استيراد سجلات الحالة (B).');
    }
  }, [store]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    for (const f of files) {
      // simple heuristic: name contains "History" or "History" -> B else A
      const kind: 'A' | 'B' = /history|status|status history|manuscript status/i.test(f.name) ? 'B' : 'A';
      handleFile(f, kind);
    }
  }, [handleFile]);

  const onInput = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'A' | 'B') => {
    const f = e.target.files?.[0];
    if (f) await handleFile(f, kind);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>استيراد الملفات</CardTitle>
        <CardDescription>قم برفع ملفات .tab الخاصة بك (A: البيانات الوصفية، B: السجل التاريخي اختياري)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <p className="font-semibold mb-1">ملف A (Metadata)</p>
            <p className="text-sm text-muted-foreground mb-3">Editors and Submissions View (.tab)</p>
            <input
              className="hidden"
              id="fileA"
              type="file"
              accept=".tab,.txt"
              onChange={(e) => onInput(e, 'A')}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('fileA')?.click()}
            >
              اختر الملف
            </Button>
          </div>
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <p className="font-semibold mb-1">ملف B (History) - اختياري</p>
            <p className="text-sm text-muted-foreground mb-3">Manuscript Status History View (.tab)</p>
            <input
              className="hidden"
              id="fileB"
              type="file"
              accept=".tab,.txt"
              onChange={(e) => onInput(e, 'B')}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('fileB')?.click()}
            >
              اختر الملف
            </Button>
          </div>
        </div>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </CardContent>
    </Card>
  );
}

function parsePossibleDate(raw: string): Date | null {
  if (!raw) return null;
  // try ISO-like first
  const iso = new Date(raw);
  if (!isNaN(iso.getTime())) return iso;

  // try dd/MM/yyyy or dd/MM/yyyy hh:mm:ss
  const parts = raw.split(' ')[0].split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts.map((p) => parseInt(p, 10));
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m - 1, d);
    }
  }

  // fallback: try mm-dd-yyyy or yyyy-mm-dd
  const parts2 = raw.split(' ')[0].split('-');
  if (parts2.length === 3) {
    const [a, b, c] = parts2.map((p) => parseInt(p, 10));
    // yyyy-mm-dd
    if (a > 31) return new Date(a, b - 1, c);
    // mm-dd-yyyy
    if (c > 31) return new Date(c, a - 1, b);
  }

  return null;
}
