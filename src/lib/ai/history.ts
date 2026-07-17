import { ChatMessage } from "./types";

const MAX_HISTORY = 8;

export function buildHistory(messages: any[]): ChatMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      (m) =>
        m &&
        typeof m.text === "string" &&
        (m.sender === "user" || m.sender === "bot")
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      text: m.text.trim(),
    }));
}