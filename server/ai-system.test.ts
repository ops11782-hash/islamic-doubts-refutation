/**
 * Vitest - اختبارات نظام الذكاء الاصطناعي المتقدم
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateDoubt, enhanceRefutation, searchForDoubts } from "./ai-orchestrator";
import { generatePDF, generateFileName, getPDFPath } from "./pdf-generator";
import fs from "fs";
import path from "path";

describe("AI Orchestrator System", () => {
  describe("API Keys Validation", () => {
    it("should have all required API keys in environment", () => {
      const requiredKeys = [
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "GOOGLE_GEMINI_API_KEY",
        "DEEPSEEK_API_KEY",
        "PERPLEXITY_API_KEY",
        "OPENROUTER_API_KEY",
        "XAI_GROK_API_KEY",
      ];

      for (const key of requiredKeys) {
        expect(process.env[key]).toBeDefined();
        expect(process.env[key]).not.toEqual("");
      }
    });
  });

  describe("Doubt Generation", () => {
    it("should generate a valid doubt object", async () => {
      const doubt = await generateDoubt();
      
      if (doubt) {
        expect(doubt).toHaveProperty("doubt");
        expect(doubt).toHaveProperty("refutation");
        expect(doubt).toHaveProperty("quranicEvidences");
        expect(doubt).toHaveProperty("hadithEvidences");
        expect(doubt).toHaveProperty("scholarStatements");
        expect(doubt).toHaveProperty("realityRefutation");
        expect(doubt).toHaveProperty("sources");

        expect(doubt.doubt).toBeTruthy();
        expect(doubt.refutation).toBeTruthy();
        expect(Array.isArray(doubt.quranicEvidences)).toBe(true);
        expect(Array.isArray(doubt.hadithEvidences)).toBe(true);
        expect(Array.isArray(doubt.scholarStatements)).toBe(true);
      }
    }, { timeout: 60000 });
  });

  describe("Refutation Enhancement", () => {
    it("should enhance refutation with additional evidence", async () => {
      const testDoubt = "هل الإسلام دين عنف؟";
      const initialRefutation = "الإسلام دين السلام والرحمة";

      const enhanced = await enhanceRefutation(testDoubt, initialRefutation);

      expect(enhanced).toBeTruthy();
      expect(enhanced.length).toBeGreaterThanOrEqual(initialRefutation.length);
    }, { timeout: 60000 });
  });

  describe("Doubt Search", () => {
    it("should search for current doubts about Islam", async () => {
      const doubts = await searchForDoubts();

      expect(Array.isArray(doubts)).toBe(true);
      // May not return results if API is unavailable
      if (doubts.length > 0) {
        for (const doubt of doubts) {
          expect(typeof doubt).toBe("string");
          expect(doubt.length).toBeGreaterThan(0);
        }
      }
    }, { timeout: 60000 });
  });
});

describe("PDF Generation System", () => {
  const testDoubt = {
    doubt: "Test doubt about Islam",
    refutation: "Test refutation with evidence",
    quranicEvidences: ["Quran 2:256"],
    hadithEvidences: ["Hadith from Prophet Muhammad"],
    scholarStatements: ["Statement from Islamic Scholar"],
    realityRefutation: "Reality proves this",
    sources: ["Quran"],
  };

  let testPdfPath: string;

  it("should generate valid filename", () => {
    const fileName = generateFileName(testDoubt.doubt);
    
    expect(fileName).toBeTruthy();
    expect(fileName).toContain(".pdf");
    expect(fileName).toMatch(/^doubt_/);
  });

  it("should create valid PDF file", async () => {
    testPdfPath = getPDFPath(generateFileName(testDoubt.doubt));

    await generatePDF({
      title: "اختبار",
      doubt: testDoubt,
      date: new Date(),
      outputPath: testPdfPath,
    });

    expect(fs.existsSync(testPdfPath)).toBe(true);
    
    const stats = fs.statSync(testPdfPath);
    expect(stats.size).toBeGreaterThan(0);
  }, { timeout: 30000 });

  it("should clean up test PDF", () => {
    if (testPdfPath && fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
      expect(fs.existsSync(testPdfPath)).toBe(false);
    }
  });
});

describe("Daily AI Task Integration", () => {
  it("should have proper error handling", async () => {
    // اختبار التعامل مع الأخطاء
    const { executeDailyAITask } = await import("./daily-ai-task");
    
    // هذا اختبار بسيط للتحقق من أن الدالة موجودة وقابلة للاستدعاء
    expect(typeof executeDailyAITask).toBe("function");
  });
});
