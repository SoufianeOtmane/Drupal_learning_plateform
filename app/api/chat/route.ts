import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-2.5-flash";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 12_000;
const MAX_TOTAL_LENGTH = 30_000;

const SYSTEM_INSTRUCTION = `You are Drupal Mentor, a strict and precise tutor for Drupal 7.
Teach Drupal 7 only; never present Drupal 8+ APIs as Drupal 7 solutions.
Coach the learner through short steps and ask them to attempt the work.
Do not provide a complete exercise solution before an honest attempt. Refuse requests to skip required lessons or level gates.
Call out security flaws, especially XSS, SQL injection, and missing access checks. Give a concrete next step.
Be direct and constructive, not flattering. For exercises, give hints progressively rather than revealing the full answer.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  );
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini is not configured. Add GEMINI_API_KEY to your local server environment and restart the app." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !Array.isArray((body as Record<string, unknown>).messages)) {
    return NextResponse.json({ error: "Provide a messages array." }, { status: 400 });
  }

  const messages: unknown[] = (body as { messages: unknown[] }).messages;
  const exerciseContext = (body as Record<string, unknown>).exerciseContext;
  if (exerciseContext !== undefined && (typeof exerciseContext !== "string" || exerciseContext.length > 2_000)) {
    return NextResponse.json({ error: "Exercise context must be a string under 2,000 characters." }, { status: 400 });
  }
  if (
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isChatMessage) ||
    messages.reduce((total, message) => total + (isChatMessage(message) ? message.content.length : 0), 0) > MAX_TOTAL_LENGTH
  ) {
    return NextResponse.json(
      { error: `Messages must contain 1-${MAX_MESSAGES} valid entries and stay within the request size limit.` },
      { status: 400 },
    );
  }

  const conversation = messages as ChatMessage[];
  if (conversation.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "The last conversation message must be from the learner." }, { status: 400 });
  }

  let providerResponse: Response;
  try {
    providerResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              { text: SYSTEM_INSTRUCTION },
              ...(typeof exerciseContext === "string" ? [{ text: `Exercise context from the app: ${exerciseContext}` }] : []),
            ],
          },
          contents: conversation.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
        }),
        signal: request.signal,
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json({ error: "Could not connect to Gemini. Check the server network and try again." }, { status: 502 });
  }

  if (!providerResponse.ok) {
    const status = providerResponse.status === 429 ? 429 : 502;
    return NextResponse.json(
      {
        error:
          providerResponse.status === 429
            ? "Gemini rate limit reached. Wait a moment and try again."
            : `Gemini request failed with status ${providerResponse.status}. Check the server key and provider configuration.`,
      },
      { status },
    );
  }

  if (!providerResponse.body) {
    return NextResponse.json({ error: "Gemini returned an empty response stream." }, { status: 502 });
  }

  return new Response(providerResponse.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
