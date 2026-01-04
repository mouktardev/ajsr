import cairoFontPath from '@/assets/fonts/Cairo-Regular.ttf'
import { createServerFn } from '@tanstack/react-start'
import * as fontkitPkg from 'fontkit'
import fs from 'fs/promises'
import { PDFDocument, rgb } from 'pdf-lib'

const fontkit = (fontkitPkg as any).default ?? fontkitPkg


interface Opts {
  reviewerName: string
  manuscriptTitle: string
  manuscriptId?: string
}

export const generateCertificate = createServerFn({ method: 'POST' })
  .inputValidator((data: Opts) => data)
  .handler(async ({ data: opts }) => {
    try {
      // read the font via static import
      const fontBytes = await fs.readFile(cairoFontPath)
      // still read background from public
      const bgBytes = await fs
        .readFile(new URL('../../public/certificate.jpg', import.meta.url).pathname)
        .catch(() => null)

      const pdfDoc = await PDFDocument.create()

      // must register fontkit so pdf-lib can embed the custom font :contentReference[oaicite:0]{index=0}
      pdfDoc.registerFontkit(fontkit as any)

      let embeddedImg: any
      if (bgBytes) {
        try {
          embeddedImg = await pdfDoc.embedJpg(bgBytes)
        } catch {
          embeddedImg = await pdfDoc.embedPng(bgBytes)
        }
      }

      const page = pdfDoc.addPage()

      if (embeddedImg) {
        const { width, height } = embeddedImg.scale(1)
        page.setSize(width, height)
        page.drawImage(embeddedImg, { x: 0, y: 0, width, height })
      } else {
        page.setSize(842, 595)
      }

      // embed the custom font now that it’s bundled
      const customFont = await pdfDoc.embedFont(fontBytes)

      const textColor = rgb(0.1, 0.1, 0.1)
      const { width, height } = page.getSize()
      let y = height - height * 0.32

      const drawCenteredRtl = (text: string, size: number) => {
        const fixed = `\u202B${text}\u202C`
        const textWidth = customFont.widthOfTextAtSize(fixed, size)
        const x = (width - textWidth) / 2
        page.drawText(fixed, {
          x,
          y,
          size,
          font: customFont,
          color: textColor,
        })
        y -= size * 1.6
      }

      drawCenteredRtl('شهادة شكر وتقدير', 48)
      drawCenteredRtl('يسر المجلة العربية للبحث العلمي (أجسر) أن تتقدم بالشكر والتقدير إلى:', 28)
      drawCenteredRtl(opts.reviewerName || '—', 40)
      drawCenteredRtl('للقيام بتحكيم الورقة البحثية بعنوان', 28)
      drawCenteredRtl(`" ${opts.manuscriptTitle || '—'} "`, 30)
      drawCenteredRtl('نقدّر وقتكم وجهدكم المهني في الارتقاء بجودة النشر العلمي', 28)

      const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true })
      return { success: true as const, pdfDataUri }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false as const, error: message }
    }
  })
