import { GoogleGenAI, Type, Schema } from "@google/genai";

// Vercel Serverless Function handler
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: '缺少 PDF 数据' });
    }

    // Get API key from environment variable (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'API 配置错误，请联系管理员' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-2.5-flash";
    
    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.STRING, description: "The reference number or identifier (e.g., '[1]', '1.')." },
          content: { type: Type.STRING, description: "The full text of the reference citation." },
          searchQuery: { type: Type.STRING, description: "A cleaned string containing just the title and authors, optimized for search engines." }
        },
        required: ["index", "content", "searchQuery"],
      }
    };

    // Clean Base64 string
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: cleanBase64,
            },
          },
          {
            text: "Please analyze the 'References' or 'Bibliography' section of this PDF. Extract all references listed. Return them as a JSON array. Ensure the 'index' matches the document's citation style."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (response.text) {
      const references = JSON.parse(response.text);
      return res.status(200).json({ references });
    }
    
    return res.status(200).json({ references: [] });

  } catch (error: any) {
    console.error("Error extracting references:", error);
    return res.status(500).json({ 
      error: error.message || '无法解析PDF中的参考文献，请确保文件包含标准的参考文献章节。' 
    });
  }
}

