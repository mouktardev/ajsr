import { createServerFn } from '@tanstack/react-start';
import * as fontkit from 'fontkit';
import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';

interface Opts {
  reviewerName: string;
  manuscriptTitle: string;
  manuscriptId?: string;
}

export const generateCertificate = createServerFn({ method: 'POST' })
  .inputValidator((data: Opts) => data)
  .handler(async ({ data: opts }) => {
    try {
      const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Cairo-Regular.ttf');
      const bgPath = path.join(process.cwd(), 'public', 'certificate.jpg');

      const [fontBytes, bgBytes] = await Promise.all([
        fs.readFile(fontPath).catch(() => null),
        fs.readFile(bgPath).catch(() => null),
      ]);

    const pdfDoc = await PDFDocument.create();
      // Register fontkit if available
      try {
        pdfDoc.registerFontkit(fontkit as any);
      } catch (e) {
        // ignore if fontkit not available at runtime
      }

      // Embed background image (jpg or png)
      let embeddedImg: any;
      if (bgBytes) {
        // try jpg first
        try {
          embeddedImg = await pdfDoc.embedJpg(bgBytes);
        } catch (e) {
          embeddedImg = await pdfDoc.embedPng(bgBytes);
        }
      }

      const page = pdfDoc.addPage();

      if (embeddedImg) {
        const { width, height } = embeddedImg.scale(1);
        page.setSize(width, height);
        page.drawImage(embeddedImg, { x: 0, y: 0, width, height });
      } else {
        page.setSize(842, 595);
      }

      const customFont = fontBytes ? await pdfDoc.embedFont(fontBytes) : undefined;
      const textColor = rgb(0.1, 0.1, 0.1);

      const { width, height } = page.getSize();
      let y = height - height * 0.32;

      const drawCenteredRtl = async (text: string, size: number) => {
        const fixed = `\u202B${text}\u202C`;
        const fontToUse = customFont
        const textWidth = (fontToUse as any).widthOfTextAtSize(fixed, size);
        const x = (width - textWidth) / 2;
        page.drawText(fixed, {
          x,
          y,
          size,
          font: fontToUse,
          color: textColor,
        });
        y -= size * 1.6;
      };

      await drawCenteredRtl('شهادة شكر وتقدير', 48);
      await drawCenteredRtl('يسر المجلة العربية للبحث العلمي (أجسر) أن تتقدم بالشكر والتقدير إلى:', 28);
      await drawCenteredRtl(opts.reviewerName || '—', 40);
      await drawCenteredRtl('للقيام بتحكيم الورقة البحثية بعنوان', 28);
      await drawCenteredRtl(`" ${opts.manuscriptTitle || '—'} "`, 30);
      await drawCenteredRtl('نقدّر وقتكم وجهدكم المهني في الارتقاء بجودة النشر العلمي', 28);
      const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
      return { success: true as const, pdfDataUri };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { success: false as const, error: message };
    }
  });
