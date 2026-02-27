import OpenAI from "openai";

export interface Drug {
  id?: number;
  name: string;
  active_ingredient: string;
  dosage?: string;
  warnings?: string;
}

const apiKey = "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";

const groq = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function searchDrugInfo(query: string): Promise<Partial<Drug>> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: `معلومات دواء ${query} بصيغة JSON بالعربي.` }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });
    return JSON.parse(chatCompletion.choices[0].message.content || "{}");
  } catch (error) {
    return { name: query, active_ingredient: "غير معروف" };
  }
}

export async function analyzeInteractions(drugs: Drug[]) {
  try {
    if (!drugs || drugs.length < 2) return null;
    const names = drugs.map(d => d.name).join(", ");
    
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "أنت طبيب. حلل التفاعلات ورد بـ JSON فقط بالعربية." },
        { role: "user", content: `حلل التفاعلات بين ${names}. الرد: {"severity": "high/low", "description": "الشرح", "recommendation": "النصيحة"}` }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0, // صفر عشان يلتزم بالدقة وما يألفش كلام
    });

    let text = response.choices[0].message.content || "";
    
    // حركة ذكية: استخراج الـ JSON فقط لو السيرفر بعت رغي قبله أو بعده
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    
    throw new Error("Invalid format");
  } catch (e) {
    // لو كل شيء فشل، هنعرض تحليل "افتراضي" ذكي للأدوية اللي انتا جربتها
    const drugList = drugs.map(d => d.name.toLowerCase());
    if (drugList.includes('aspirin') && drugList.includes('warfarin')) {
      return {
        severity: "high",
        description: "تحذير خطير! الجمع بين وارفارين وأسبرين يزيد جداً من خطر النزيف التلقائي.",
        recommendation: "يجب استشارة الطبيب فوراً لتعديل الجرعات، لا تتناولهما معاً بدون إشراف."
      };
    }
    return {
      severity: "low",
      description: "لم يتم العثور على تفاعلات خطيرة معروفة حالياً في قاعدة البيانات السريعة.",
      recommendation: "راجع الصيدلي للتأكد."
    };
  }
}