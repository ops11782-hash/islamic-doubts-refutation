/**
 * Daily AI Task - المهام اليومية التلقائية لتوليد الشبهات والردود
 */

import { generateDoubt, searchForDoubts, enhanceRefutation } from "./ai-orchestrator";
import { generatePDF, generateFileName, getPDFPath } from "./pdf-generator";
import { createDoubt } from "./db";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import fs from "fs";

export interface DailyTaskResult {
  success: boolean;
  doubtId?: number;
  pdfUrl?: string;
  error?: string;
  timestamp: Date;
}

/**
 * تنفيذ المهمة اليومية الكاملة
 */
export async function executeDailyAITask(): Promise<DailyTaskResult> {
  const startTime = Date.now();

  try {
    console.log("[Daily Task] بدء المهمة اليومية...");

    // 1. البحث عن شبهات منتشرة
    console.log("[Daily Task] البحث عن شبهات منتشرة...");
    const searchResults = await searchForDoubts();
    console.log(`[Daily Task] تم العثور على ${searchResults.length} شبهات محتملة`);

    // 2. توليد شبهة جديدة مع ردود شاملة
    console.log("[Daily Task] توليد شبهة جديدة مع ردود شاملة...");
    const doubt = await generateDoubt();

    if (!doubt) {
      throw new Error("فشل توليد الشبهة");
    }

    console.log("[Daily Task] تم توليد الشبهة بنجاح");

    // 3. تحسين الرد
    console.log("[Daily Task] تحسين الرد...");
    const enhancedRefutation = await enhanceRefutation(doubt.doubt, doubt.refutation);
    doubt.refutation = enhancedRefutation;

    // 4. توليد ملف PDF
    console.log("[Daily Task] توليد ملف PDF...");
    const fileName = generateFileName(doubt.doubt);
    const pdfPath = getPDFPath(fileName);

    await generatePDF({
      title: "الحجة والبرهان على الشبهات",
      doubt,
      date: new Date(),
      outputPath: pdfPath,
    });

    console.log("[Daily Task] تم توليد ملف PDF بنجاح");

    // 5. رفع ملف PDF إلى التخزين
    console.log("[Daily Task] رفع ملف PDF...");
    const pdfBuffer = fs.readFileSync(pdfPath);
    const { url: pdfUrl } = await storagePut(
      `ai-generated-doubts/${fileName}`,
      pdfBuffer,
      "application/pdf"
    );

    console.log(`[Daily Task] تم رفع PDF: ${pdfUrl}`);

    // 6. حفظ الشبهة في قاعدة البيانات
    console.log("[Daily Task] حفظ الشبهة في قاعدة البيانات...");
    
    // إنشاء slug من الشبهة
    const slug = doubt.doubt
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "")
      .trim()
      .substring(0, 100)
      .replace(/\s+/g, "-")
      .toLowerCase();

    await createDoubt({
      title: doubt.doubt.substring(0, 200),
      slug: `${slug}-${Date.now()}`,
      content: doubt.doubt,
      categoryId: 1,
      refutation: doubt.refutation,
      status: "published",
      createdBy: 0,
      isAIGenerated: 1,
    });

    console.log("[Daily Task] تم حفظ الشبهة بنجاح");

    // 7. إرسال إشعار للمدير
    console.log("[Daily Task] إرسال إشعار للمدير...");
    await notifyOwner({
      title: "تم توليد شبهة جديدة بواسطة الذكاء الاصطناعي ✨",
      content: `تم توليد شبهة جديدة: "${doubt.doubt.substring(0, 100)}..."\n\nملف PDF: ${pdfUrl}\n\nيرجى مراجعة الشبهة والرد قبل النشر النهائي.`,
    });

    const duration = (Date.now() - startTime) / 1000;
    console.log(`[Daily Task] اكتملت المهمة بنجاح في ${duration} ثانية`);

    return {
      success: true,
      pdfUrl,
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
    console.error("[Daily Task] خطأ في المهمة اليومية:", errorMessage);

    // إرسال إشعار بالخطأ
    try {
      await notifyOwner({
        title: "⚠️ خطأ في المهمة اليومية",
        content: `حدث خطأ في المهمة اليومية: ${errorMessage}`,
      });
    } catch (notifyError) {
      console.error("[Daily Task] فشل إرسال إشعار الخطأ:", notifyError);
    }

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * جدولة المهمة اليومية (يتم استدعاؤها من endpoint مجدول)
 */
export async function scheduleDailyTask(): Promise<void> {
  console.log("[Scheduler] بدء المهمة اليومية المجدولة");
  const result = await executeDailyAITask();

  if (result.success) {
    console.log("[Scheduler] اكتملت المهمة بنجاح");
  } else {
    console.error("[Scheduler] فشلت المهمة:", result.error);
  }
}
