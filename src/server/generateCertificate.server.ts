import { createServerFn } from '@tanstack/react-start'
import * as fontkitPkg from 'fontkit'
import fs from 'fs/promises'
import path from 'node:path'; // Essential for server paths
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
      // 1. Resolve path relative to the PROJECT ROOT
      // Vercel sets process.cwd() to the task root
      const assetsPath = path.join(process.cwd(), 'server-assets')
      
      const fontPath = path.join(assetsPath, 'Cairo-Regular.ttf')
      const bgPath = path.join(assetsPath, 'certificate.jpg')

      // 2. Read from filesystem (This works because of vercel.json)
      const [fontBytes, bgBytes] = await Promise.all([
        fs.readFile(fontPath),
        fs.readFile(bgPath).catch((e) => {
            console.warn(`Bg missing at ${bgPath}`, e); 
            return null;
        })
      ])

      const pdfDoc = await PDFDocument.create()
      pdfDoc.registerFontkit(fontkit as any)

      // Embed Background
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

      // Embed Font
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
      console.error('Certificate Error:', err)
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false as const, error: message }
    }
  })