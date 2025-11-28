import { ReferenceItem, SearchResult } from "../types";

// Call local API endpoints instead of directly calling Gemini
// This protects the API key from being exposed to the client

export const extractReferencesFromPdf = async (pdfBase64: string): Promise<ReferenceItem[]> => {
  try {
    const response = await fetch('/api/extract-references', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdfBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '无法解析PDF中的参考文献');
    }

    const data = await response.json();
    return data.references || [];
  } catch (error: any) {
    console.error("Error extracting references:", error);
    throw new Error(error.message || "无法解析PDF中的参考文献，请确保文件包含标准的参考文献章节。");
  }
};

export const searchReferenceOnline = async (query: string): Promise<Omit<SearchResult, 'loading'>> => {
  try {
    const response = await fetch('/api/search-reference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '搜索失败');
    }

    const data = await response.json();
    return {
      summary: data.summary || "未找到相关摘要信息。",
      sources: data.sources || [],
    };

  } catch (error: any) {
    console.error("Error searching reference:", error);
    throw new Error(error.message || "搜索失败，请稍后重试。");
  }
};