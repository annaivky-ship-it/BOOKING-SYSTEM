
import { GoogleGenAI } from "@google/genai";

// Standard aspect ratios supported by the UI and Gemini 3 pro image preview
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export const geminiService = {
  /**
   * Generates an image using gemini-3-pro-image-preview.
   * Requires a selected API key from process.env.API_KEY.
   */
  generateImage: async (prompt: string, aspectRatio: AspectRatio = "1:1") => {
    // Initializing with named parameter as required by guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any, 
            imageSize: "1K"
          },
        },
      });

      for (const part of response.candidates[0].content.parts) {
        // Find the image part as per guidelines
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image was generated in the response.");
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API KEY ERROR: Please re-select your paid API key via the selector.");
      }
      throw error;
    }
  },

  /**
   * Analyzes an uploaded image using gemini-3-pro-preview.
   */
  analyzeImage: async (base64Image: string, mimeType: string) => {
    // Initializing with named parameter as required by guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Act as a professional talent agent and photographer. Analyze this photo of a performer. 
    Evaluate the following:
    1. Lighting and Composition (Is it professional?)
    2. Vibe and Mood (What energy does it project?)
    3. Recommendations (How can the performer improve this shot or their gallery?)
    
    Return a concise, encouraging, and professional critique.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: mimeType,
              },
            },
            { text: prompt }
          ]
        }
      });

      // text is a property, not a method, on GenerateContentResponse
      return response.text;
    } catch (error) {
      console.error("Image analysis failed:", error);
      throw error;
    }
  }
};
