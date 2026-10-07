"use client";

import { useState } from "react";

export type MentorMessage = {
  role: "mentor" | "you";
  text: string;
};

type GeminiEvent = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

function extractText(eventData: string) {
  if (eventData === "[DONE]") return "";
  const event = JSON.parse(eventData) as GeminiEvent;
  if (event.error?.message) throw new Error(event.error.message);
  return event.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

export function useMentorChat(initialMessages: MentorMessage[]) {
  const [messages, setMessages] = useState(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  function resetMessages(nextMessages: MentorMessage[]) {
    setMessages(nextMessages);
    setError("");
  }

  async function sendMessage(text: string, exerciseContext?: string) {
    const cleanText = text.trim();
    if (!cleanText || isSending) return;

    const conversation = [...messages, { role: "you" as const, text: cleanText }];
    const responseIndex = conversation.length;
    setMessages([...conversation, { role: "mentor", text: "" }]);
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseContext,
          messages: conversation.slice(-20).map((message) => ({
            role: message.role === "mentor" ? "assistant" : "user",
            content: message.text,
          })),
        }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? `Chat request failed (${response.status}).`);
      }
      if (!response.body) throw new Error("Chat response did not include a stream.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      let answer = "";

      function processLine(line: string) {
        if (!line.startsWith("data:")) return;
        const eventText = line.slice(5).trim();
        if (!eventText || eventText === "[DONE]") return;
        answer += extractText(eventText);
        setMessages([...conversation, { role: "mentor", text: answer }]);
      }

      while (true) {
        const { value, done } = await reader.read();
        pending += decoder.decode(value, { stream: !done });
        const lines = pending.split(/\r?\n/);
        pending = lines.pop() ?? "";
        lines.forEach(processLine);
        if (done) break;
      }
      if (pending) processLine(pending);
      if (!answer.trim()) throw new Error("Gemini returned no text. Check the prompt or provider safety response.");
    } catch (cause) {
      setMessages(conversation);
      setError(cause instanceof Error ? cause.message : "Chat request failed unexpectedly.");
    } finally {
      setIsSending(false);
    }

    return true;
  }

  return { messages, isSending, error, sendMessage, resetMessages };
}
