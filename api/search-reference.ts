import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function handler
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: '缺少搜索查询' });
    }

    // Get API key from environment variable (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'API 配置错误，请联系管理员' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Search for this academic paper: "${query}". 
      1. Provide a concise summary of what this paper is about (in Chinese). 
      2. If found, verify the title and authors.
      3. Focus on finding the actual content/abstract.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const summary = response.text || "未找到相关摘要信息。";
    
    // Extract sources from grounding chunks
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map(chunk => chunk.web)
      .filter(web => web !== undefined && web !== null)
      .map(web => ({
        uri: web.uri || '',
        title: web.title || 'Source Link'
      })) || [];

    // Filter out duplicates based on URI
    const uniqueSources = sources.filter((v, i, a) => 
      a.findIndex(v2 => (v2.uri === v.uri)) === i
    );

    return res.status(200).json({
      summary,
      sources: uniqueSources,
    });

  } catch (error: any) {
    console.error("Error searching reference:", error);
    return res.status(500).json({ 
      error: error.message || '搜索失败，请稍后重试。' 
    });
  }
}

