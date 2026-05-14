/**
 * PDF Generator - توليد ملفات PDF احترافية ومنظمة
 */

import { PDFDocument, rgb } from "pdf-lib";
import { DoubtResponse } from "./ai-orchestrator";
import fs from "fs";
import path from "path";

export interface PDFOptions {
  title: string;
  doubt: DoubtResponse;
  date: Date;
  outputPath: string;
}

/**
 * توليد ملف PDF احترافي
 * ملاحظة: pdf-lib لا يدعم النصوص العربية مباشرة، لذا نستخدم نصوص بسيطة
 */
export async function generatePDF(options: PDFOptions): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    // الألوان
    const colors = {
      primary: rgb(0.0, 0.4, 0.8), // أزرق
      dark: rgb(0.1, 0.1, 0.1), // أسود
      light: rgb(0.95, 0.95, 0.95), // رمادي فاتح
      text: rgb(0.2, 0.2, 0.2), // نص داكن
    };

    let yPosition = height - 50;

    // Header - استخدام نص بسيط بدون عربية
    page.drawText("Islamic Refutation System", {
      x: 50,
      y: yPosition,
      size: 28,
      color: colors.primary,
    });

    yPosition -= 40;

    // التاريخ
    const dateStr = options.date.toLocaleDateString("en-US");
    page.drawText(`Date: ${dateStr}`, {
      x: 50,
      y: yPosition,
      size: 9,
      color: colors.dark,
    });

    yPosition -= 30;

    // خط فاصل
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 2,
      color: colors.primary,
    });

    yPosition -= 30;

    // الشبهة
    page.drawText("Doubt:", {
      x: 50,
      y: yPosition,
      size: 18,
      color: colors.primary,
    });

    yPosition -= 25;

    // نص الشبهة
    const doubtLines = wrapText(options.doubt.doubt, width - 100, 11);
    for (const line of doubtLines) {
      if (yPosition < 100) {
        break;
      }
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        color: colors.text,
      });
      yPosition -= 20;
    }

    yPosition -= 20;

    // الرد القاطع
    page.drawText("Refutation:", {
      x: 50,
      y: yPosition,
      size: 18,
      color: colors.primary,
    });

    yPosition -= 25;

    const refutationLines = wrapText(options.doubt.refutation, width - 100, 11);
    for (const line of refutationLines) {
      if (yPosition < 100) {
        break;
      }
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        color: colors.text,
      });
      yPosition -= 20;
    }

    yPosition -= 20;

    // الأدلة القرآنية
    if (options.doubt.quranicEvidences.length > 0) {
      page.drawText("Quranic Evidences:", {
        x: 50,
        y: yPosition,
        size: 14,
        color: colors.primary,
      });

      yPosition -= 20;

      for (const evidence of options.doubt.quranicEvidences.slice(0, 3)) {
        if (yPosition < 100) break;
        const evidenceLines = wrapText(`• ${evidence}`, width - 100, 11);
        for (const line of evidenceLines) {
          if (yPosition < 100) break;
          page.drawText(line, {
            x: 60,
            y: yPosition,
            size: 11,
            color: colors.text,
          });
          yPosition -= 18;
        }
      }

      yPosition -= 15;
    }

    // الأحاديث النبوية
    if (options.doubt.hadithEvidences.length > 0) {
      page.drawText("Hadith Evidences:", {
        x: 50,
        y: yPosition,
        size: 14,
        color: colors.primary,
      });

      yPosition -= 20;

      for (const hadith of options.doubt.hadithEvidences.slice(0, 3)) {
        if (yPosition < 100) break;
        const hadithLines = wrapText(`• ${hadith}`, width - 100, 11);
        for (const line of hadithLines) {
          if (yPosition < 100) break;
          page.drawText(line, {
            x: 60,
            y: yPosition,
            size: 11,
            color: colors.text,
          });
          yPosition -= 18;
        }
      }

      yPosition -= 15;
    }

    // أقوال العلماء
    if (options.doubt.scholarStatements.length > 0) {
      page.drawText("Scholars Statements:", {
        x: 50,
        y: yPosition,
        size: 14,
        color: colors.primary,
      });

      yPosition -= 20;

      for (const statement of options.doubt.scholarStatements.slice(0, 2)) {
        if (yPosition < 100) break;
        const statementLines = wrapText(`• ${statement}`, width - 100, 11);
        for (const line of statementLines) {
          if (yPosition < 100) break;
          page.drawText(line, {
            x: 60,
            y: yPosition,
            size: 11,
            color: colors.text,
          });
          yPosition -= 18;
        }
      }
    }

    // Footer
    page.drawText("Islamic Refutation System - Professional Response to Doubts", {
      x: 50,
      y: 30,
      size: 9,
      color: colors.dark,
    });

    // حفظ الملف
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(options.outputPath, pdfBytes);

    console.log(`[PDF] تم إنشاء ملف PDF: ${options.outputPath}`);
    return options.outputPath;
  } catch (error) {
    console.error("[PDF] خطأ في توليد PDF:", error);
    throw error;
  }
}

/**
 * دالة مساعدة لتفاف النص
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // تقدير تقريبي لعرض النص
    const estimatedWidth = testLine.length * (fontSize * 0.5);

    if (estimatedWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * توليد اسم ملف فريد
 */
export function generateFileName(doubt: string): string {
  const sanitized = doubt
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .substring(0, 50)
    .replace(/\s+/g, "_");

  const timestamp = Date.now();
  return `doubt_${sanitized}_${timestamp}.pdf`;
}

/**
 * الحصول على مسار الملف الكامل
 */
export function getPDFPath(fileName: string): string {
  const uploadsDir = path.join(process.cwd(), "uploads", "pdfs");
  
  // إنشاء المجلد إذا لم يكن موجوداً
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return path.join(uploadsDir, fileName);
}
