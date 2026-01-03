import { PDFDocument } from 'pdf-lib';

interface GenerateOptions {
  reviewerName: string;
  manuscriptTitle: string;
  manuscriptId?: string;
}

async function loadArrayBuffer(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ' + url);
  return await res.arrayBuffer();
}

export async function generateCertificatePdf(opts: GenerateOptions) {
  const { reviewerName, manuscriptTitle } = opts;

  // Load background image from /certificate.jpg
  const bgBlob = await fetch('/certificate.jpg');
  if (!bgBlob.ok) throw new Error('Failed to load certificate background');
  const bgArrayBuffer = await bgBlob.arrayBuffer();
  const img = await createImageBitmap(new Blob([bgArrayBuffer]));

  // Try to load Cairo font from public/fonts if present (optional)
  let fontLoaded = false;
  try {
    const fontBuffer = await loadArrayBuffer('/fonts/Cairo-Regular.ttf');
    const fontFace = new FontFace('CairoGen', fontBuffer as any);
    await (fontFace as any).load();
    (document as any).fonts.add(fontFace);
    fontLoaded = true;
  } catch (e) {
    // ignore - we'll fallback to system font
    console.warn('Could not load Cairo font, using default font', e);
  }

  // Create canvas matching background size
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Draw background
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Prepare text
  const centerX = canvas.width / 2;
  let y = canvas.height * 0.32;
  ctx.fillStyle = '#111';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';

  const titleFont = fontLoaded ? 'bold 48px CairoGen' : 'bold 48px serif';
  const nameFont = fontLoaded ? '700 40px CairoGen' : '700 40px serif';
  const bodyFont = fontLoaded ? '28px CairoGen' : '28px serif';

  ctx.font = titleFont;
  ctx.fillText('شهادة شكر وتقدير', centerX, y);
  y += 60;

  ctx.font = bodyFont;
  const line1 = 'يسر المجلة العربية للبحث العلمي (أجسر) أن تتقدم بالشكر والتقدير إلى:';
  ctx.fillText(line1, centerX, y);
  y += 45;

  ctx.font = nameFont;
  ctx.fillText(reviewerName || '—', centerX, y);
  y += 60;

  ctx.font = bodyFont;
  ctx.fillText('للقيام بتحكيم الورقة البحثية بعنوان', centerX, y);
  y += 45;

  ctx.font = 'italic 30px ' + (fontLoaded ? 'CairoGen' : 'serif');
  ctx.fillText(`" ${manuscriptTitle || '—'} "`, centerX, y);
  y += 60;

  ctx.font = bodyFont;
  ctx.fillText('نقدّر وقتكم وجهدكم المهني في الارتقاء بجودة النشر العلمي', centerX, y);

  // Convert canvas to PNG
  const dataUrl = canvas.toDataURL('image/png');

  // Create PDF with pdf-lib embedding the PNG
  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(dataUrl);
  const pngDims = pngImage.scale(1);
  const page = pdfDoc.addPage([pngDims.width, pngDims.height]);
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: pngDims.width,
    height: pngDims.height,
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return blob;
}

export async function openCertificateInNewTab(opts: GenerateOptions) {
  const blob = await generateCertificatePdf(opts);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export async function downloadCertificate(opts: GenerateOptions, fileName?: string) {
  const blob = await generateCertificatePdf(opts);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName || `${opts.reviewerName || 'certificate'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
