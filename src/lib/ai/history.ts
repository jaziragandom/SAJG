import { ChatMessage } from "./types";

export function buildHistory(messages: any[]): ChatMessage[] {

    if (!Array.isArray(messages))
        return [];

    const history = messages

        .filter((m) =>
            m.sender === "user" ||
            m.sender === "assistant"
        )

        .slice(-10)

        .map((m): ChatMessage => ({

            role:
                m.sender === "user"
                    ? "user"
                    : "model",

            text: String(m.text ?? "")

        }));

    return history;
}