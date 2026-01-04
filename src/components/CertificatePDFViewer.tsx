import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateCertificate } from '@/server/generateCertificate.server';
import { IconDownload, IconEye, IconLoader2 } from '@tabler/icons-react';
import { useState, useTransition } from 'react';

interface CertificatePDFViewerProps {
  reviewerName: string;
  manuscriptTitle: string;
  manuscriptId?: string;
}

export function CertificatePDFViewer({
  reviewerName,
  manuscriptTitle,
  manuscriptId,
}: CertificatePDFViewerProps) {
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerateAndView = () => {
    startGenerateTransition(async () => {
      try {
        const result = await generateCertificate({
            data:{
            reviewerName,
            manuscriptTitle,
            manuscriptId,
            }
        });
        if (result && result.success && result.pdfDataUri) {
          setPdfDataUri(result.pdfDataUri);
        } else {
          console.log(result.error)
        }
      } catch (err) {
        console.log('Error generating certificate:', err);
      }
    });
  };

  const handleDownload = () => {
    if (pdfDataUri) {
      const link = document.createElement('a');
      link.href = pdfDataUri;
      link.download = `${manuscriptId}-${reviewerName}-certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewClick = () => {
    if (!pdfDataUri) {
      handleGenerateAndView();
    }
    setIsDialogOpen(true);
  };

  const handleDownloadClick = () => {
    if (!pdfDataUri) {
      startGenerateTransition(async () => {
        try {
          const result = await generateCertificate({
            data:{
                reviewerName,
                manuscriptTitle,
                manuscriptId,
                }
            });
          if (result && result.success && result.pdfDataUri) {
            setPdfDataUri(result.pdfDataUri);
            // Download after generation
            setTimeout(() => {
              const link = document.createElement('a');
              link.href = result.pdfDataUri!;
              link.download = `${manuscriptId}-${reviewerName}-certificate.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }, 100);
          }
        } catch (err) {
          console.log('Error downloading certificate:', err);
        }
      });
    } else {
      handleDownload();
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewClick}
          disabled={isGenerating}
          title="عرض الشهادة"
        >
          {isGenerating ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconEye className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadClick}
          disabled={isGenerating}
          title="تحميل الشهادة"
        >
          {isGenerating ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconDownload className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>شهادة شكر وتقدير</DialogTitle>
            <DialogDescription>
              عرض شهادة تقدير للمراجع {reviewerName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-[70vh] flex-col items-center justify-center">
            {isGenerating ? (
              <div className="flex h-full flex-col items-center justify-center">
                <IconLoader2 className="mb-4 h-8 w-8 animate-spin" />
                <p>جاري إنشاء الشهادة...</p>
              </div>
            ) : pdfDataUri ? (
              <iframe
                src={pdfDataUri}
                className="h-full w-full rounded-md border-0"
                title="شهادة شكر وتقدير"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center">
                <p>فشل في تحميل الشهادة</p>
                <Button
                  onClick={handleGenerateAndView}
                  className="mt-4"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  إعادة المحاولة
                </Button>
              </div>
            )}
          </div>
          {pdfDataUri && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleDownload}>
                <IconDownload className="mr-2 h-4 w-4" />
                تحميل الشهادة
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
