import { createServerFn } from '@tanstack/react-start'
import * as fontkitPkg from 'fontkit'
import { PDFDocument, rgb } from 'pdf-lib'

// 1. Remove the static import and fs
// import cairoFontPath from '@/assets/fonts/Cairo-Regular.ttf' <-- REMOVE THIS
// import fs from 'fs/promises' <-- REMOVE THIS

const fontkit = (fontkitPkg as any).default ?? fontkitPkg

interface Opts {
  reviewerName: string
  manuscriptTitle: string
  manuscriptId?: string
}

// Helper to determine the correct base URL
function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000' // Fallback for local dev
}

export const generateCertificate = createServerFn({ method: 'POST' })
  .inputValidator((data: Opts) => data)
  .handler(async ({ data: opts }) => {
    try {
      const baseUrl = getBaseUrl()

      // 2. Fetch assets via HTTP instead of fs.readFile
      const [fontResponse, bgResponse] = await Promise.all([
        fetch(`${baseUrl}/fonts/Cairo-Regular.ttf`),
        fetch(`${baseUrl}/certificate.jpg`)
      ])

      if (!fontResponse.ok) throw new Error(`Failed to load font: ${fontResponse.statusText}`)
      
      const fontBytes = await fontResponse.arrayBuffer()
      const bgBytes = bgResponse.ok ? await bgResponse.arrayBuffer() : null

      const pdfDoc = await PDFDocument.create()

      // Register fontkit
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