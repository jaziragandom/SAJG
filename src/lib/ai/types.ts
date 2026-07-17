export type ChatRole =
    | "user"
    | "model";

export interface ChatMessage {

    role: ChatRole;

    text: string;

}

export interface GeminiResult {

    success: boolean;

    text: string;

}