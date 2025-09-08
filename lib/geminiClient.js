import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeBase64Image(base64Image, mimeType = 'image/jpeg') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a nutrition analysis expert. Analyze the provided image.
1. Determine if the image contains food.
2. If it does, respond ONLY in JSON with:
   {
     "isFood": true,
     "foodName": "<name>",
     "estimatedCalories": "<calories per serving>",
     "healthScore": <0-100>
   }
3. If it is not food, respond ONLY in JSON:
   {
     "isFood": false
   }
Be accurate, concise, and consistent.`;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Image } },
        ],
      },
    ],
  });

  const text = result.response.text();
  // Attempt robust JSON extraction to handle extra formatting like code fences
  const attemptParses = [
    () => JSON.parse(text),
    () => {
      const fenced = text.match(/```(?:json)?\n([\s\S]*?)\n```/i);
      if (fenced) return JSON.parse(fenced[1]);
      throw new Error('no fenced block');
    },
    () => {
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        return JSON.parse(text.slice(first, last + 1));
      }
      throw new Error('no braces found');
    },
  ];

  for (const tryParse of attemptParses) {
    try {
      const parsed = tryParse();
      return parsed;
    } catch (_) {
      // continue
    }
  }

  throw new Error('Model did not return valid JSON');
}


