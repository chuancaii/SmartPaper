import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ReferenceItem, SearchResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean Base64 string
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:application\/pdf;base64,/, '');
};

export const extractReferencesFromPdf = async (pdfBase64: string): Promise<ReferenceItem[]> => {
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

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: cleanBase64(pdfBase64),
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
      return JSON.parse(response.text) as ReferenceItem[];
    }
    return [];
  } catch (error) {
    console.error("Error extracting references:", error);
    throw new Error("无法解析PDF中的参考文献，请确保文件包含标准的参考文献章节。");
  }
};

export const searchReferenceOnline = async (query: string): Promise<Omit<SearchResult, 'loading'>> => {
  const modelId = "gemini-2.5-flash"; // Using flash for search as well
  
  try {
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
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(v2 => (v2.uri === v.uri)) === i);

    return {
      summary,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Error searching reference:", error);
    throw new Error("搜索失败，请稍后重试。");
  }
};