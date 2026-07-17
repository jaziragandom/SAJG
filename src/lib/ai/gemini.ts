import { GoogleGenAI } from "@google/genai";
import { ChatMessage, GeminiResult } from "./types";

const MODEL =
  process.env.AI_MODEL || "gemini-2.5-flash-lite";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function askGemini(
  systemPrompt: string,
  history: ChatMessage[]
): Promise<GeminiResult> {
  try {
    console.log("MODEL =", MODEL);
    console.log("KEY =", process.env.GEMINI_API_KEY?.substring(0, 8));

    const models = await ai.models.list();

    console.log("==================================");
    console.log("AVAILABLE MODELS");
    console.log(models);
    console.log("==================================");

    return {
      success: false,
      text: "Model list printed.",
    };
  } catch (err: any) {
    console.error("Gemini Error:", err);

    return {
      success: false,
      text: "خطا در ارتباط با Gemini",
    };
  }
}