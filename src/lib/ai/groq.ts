import { ChatMessage, GeminiResult } from "./types";

const MODEL =
  process.env.AI_MODEL || "llama-3.3-70b-versatile";

export async function askGroq(
  systemPrompt: string,
  history: ChatMessage[]
): Promise<GeminiResult> {

  try {

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },

      ...history.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.text,
      })),
    ];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.2,
          max_tokens: 700,
        }),
      }
    );

    if (!response.ok) {

      console.log(await response.text());

      throw new Error("Groq API Error");

    }

    const json = await response.json();

    return {

      success: true,

      text:
        json.choices?.[0]?.message?.content ?? "",

    };

  } catch (err) {

    console.error(err);

    return {

      success: false,

      text: "",

    };

  }

}