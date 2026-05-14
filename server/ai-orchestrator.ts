/**
 * AI Orchestrator - يستخدم عدة نماذج ذكاء اصطناعي بالتوازي للحصول على أفضل النتائج
 */

import { invokeLLM } from "./_core/llm";

export interface AIResponse {
  model: string;
  content: string;
  quality: number; // 1-10
}

export interface DoubtResponse {
  doubt: string;
  refutation: string;
  quranicEvidences: string[];
  hadithEvidences: string[];
  scholarStatements: string[];
  realityRefutation: string;
  sources: string[];
}

/**
 * استدعاء OpenAI ChatGPT
 */
async function callOpenAI(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`);
    const data = await response.json();
    return {
      model: "ChatGPT-4",
      content: data.choices[0]?.message?.content || "",
      quality: 9,
    };
  } catch (error) {
    console.error("[AI] OpenAI error:", error);
    return { model: "ChatGPT-4", content: "", quality: 0 };
  }
}

/**
 * استدعاء Claude من Anthropic
 */
async function callClaude(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Claude error: ${response.statusText}`);
    const data = await response.json();
    return {
      model: "Claude-3-Opus",
      content: data.content[0]?.text || "",
      quality: 9,
    };
  } catch (error) {
    console.error("[AI] Claude error:", error);
    return { model: "Claude-3-Opus", content: "", quality: 0 };
  }
}

/**
 * استدعاء DeepSeek
 */
async function callDeepSeek(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error(`DeepSeek error: ${response.statusText}`);
    const data = await response.json();
    return {
      model: "DeepSeek",
      content: data.choices[0]?.message?.content || "",
      quality: 8,
    };
  } catch (error) {
    console.error("[AI] DeepSeek error:", error);
    return { model: "DeepSeek", content: "", quality: 0 };
  }
}

/**
 * استدعاء Grok من xAI
 */
async function callGrok(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.XAI_GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-2",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error(`Grok error: ${response.statusText}`);
    const data = await response.json();
    return {
      model: "Grok-2",
      content: data.choices[0]?.message?.content || "",
      quality: 8,
    };
  } catch (error) {
    console.error("[AI] Grok error:", error);
    return { model: "Grok-2", content: "", quality: 0 };
  }
}

/**
 * استدعاء OpenRouter (يدعم عدة نماذج)
 */
async function callOpenRouter(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter error: ${response.statusText}`);
    const data = await response.json();
    return {
      model: "OpenRouter-GPT4",
      content: data.choices[0]?.message?.content || "",
      quality: 8,
    };
  } catch (error) {
    console.error("[AI] OpenRouter error:", error);
    return { model: "OpenRouter-GPT4", content: "", quality: 0 };
  }
}

/**
 * استدعاء Perplexity للبحث والمعلومات الحديثة
 */
async function callPerplexity(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error(`Perplexity error: ${response.statusText}`);
    const data = await response.json();
    return {
      model: "Perplexity-Sonar",
      content: data.choices[0]?.message?.content || "",
      quality: 8,
    };
  } catch (error) {
    console.error("[AI] Perplexity error:", error);
    return { model: "Perplexity-Sonar", content: "", quality: 0 };
  }
}

/**
 * توليد شبهة جديدة باستخدام عدة نماذج
 */
export async function generateDoubt(): Promise<DoubtResponse | null> {
  const systemPrompt = `أنت متخصص إسلامي متقدم في الرد على الشبهات. 
قم بتوليد شبهة شائعة حول الإسلام مع رد مفصل وشامل.

الصيغة المطلوبة (JSON):
{
  "doubt": "نص الشبهة بوضوح",
  "refutation": "الرد القاطع والمفصل",
  "quranicEvidences": ["آية قرآنية مع التفسير", "آية أخرى"],
  "hadithEvidences": ["حديث نبوي مع الشرح", "حديث آخر"],
  "scholarStatements": ["قول عالم إسلامي معروف", "قول عالم آخر"],
  "realityRefutation": "شرح الرد من الواقع المحسوس",
  "sources": ["مصدر 1", "مصدر 2"]
}`;

  const userPrompt = `قم بتوليد شبهة جديدة مع ردودها الشاملة من القرآن والسنة وأقوال العلماء والواقع.`;

  try {
    // استدعاء عدة نماذج بالتوازي
    const responses = await Promise.all([
      callOpenAI(systemPrompt + "\n\n" + userPrompt),
      callClaude(systemPrompt + "\n\n" + userPrompt),
      callDeepSeek(systemPrompt + "\n\n" + userPrompt),
      callGrok(systemPrompt + "\n\n" + userPrompt),
      callPerplexity(systemPrompt + "\n\n" + userPrompt),
    ]);

    // اختيار أفضل استجابة
    const bestResponse = responses.reduce((best, current) => 
      current.quality > best.quality ? current : best
    );

    if (!bestResponse.content) {
      console.error("[AI] جميع النماذج فشلت في الاستجابة");
      return null;
    }

    // محاولة تحليل JSON
    try {
      const parsed = JSON.parse(bestResponse.content);
      return parsed as DoubtResponse;
    } catch {
      // إذا فشل التحليل، حاول استخراج JSON من النص
      const jsonMatch = bestResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as DoubtResponse;
      }
      console.error("[AI] فشل تحليل استجابة JSON");
      return null;
    }
  } catch (error) {
    console.error("[AI] خطأ في توليد الشبهة:", error);
    return null;
  }
}

/**
 * تحسين ورد معين باستخدام عدة نماذج
 */
export async function enhanceRefutation(doubt: string, initialRefutation: string): Promise<string> {
  const prompt = `الشبهة: ${doubt}

الرد الأولي: ${initialRefutation}

قم بتحسين هذا الرد بإضافة المزيد من الأدلة القرآنية والأحاديث وأقوال العلماء والأمثلة من الواقع.`;

  try {
    const responses = await Promise.all([
      callClaude(prompt),
      callOpenAI(prompt),
      callDeepSeek(prompt),
    ]);

    const bestResponse = responses.reduce((best, current) => 
      current.quality > best.quality ? current : best
    );

    return bestResponse.content || initialRefutation;
  } catch (error) {
    console.error("[AI] خطأ في تحسين الرد:", error);
    return initialRefutation;
  }
}

/**
 * البحث عن شبهات منتشرة
 */
export async function searchForDoubts(): Promise<string[]> {
  const prompt = `ما هي أكثر 5 شبهات منتشرة حول الإسلام في الوقت الحالي على الإنترنت والمواقع الإلكترونية؟
قدم قائمة بالشبهات فقط، واحدة في كل سطر.`;

  try {
    const response = await callPerplexity(prompt);
    const doubts = response.content
      .split("\n")
      .filter(line => line.trim().length > 0)
      .slice(0, 5);
    return doubts;
  } catch (error) {
    console.error("[AI] خطأ في البحث عن الشبهات:", error);
    return [];
  }
}
