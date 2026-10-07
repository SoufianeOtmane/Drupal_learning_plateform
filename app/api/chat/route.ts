import { NextRequest, NextResponse } from "next/server";

const MODELS = ["gemini-flash-lite-latest", "gemini-3.8-flash"];
const MAX_PROVIDER_ATTEMPTS = 2;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 12_000;
const MAX_TOTAL_LENGTH = 30_000;

const SYSTEM_INSTRUCTION = `You are Drupal Mentor, a strict and precise tutor for Drupal 7.
Teach Drupal 7 only; never present Drupal 8+ APIs as Drupal 7 solutions.
You do not know the learner's background or saved progress unless it is explicitly included in the conversation or exercise context. Ask about experience only when it is unknown; accept the learner's stated level and never repeat a placement question they have already answered.
Keep the conversation natural, direct, and concise. For a beginner, aim for 2-4 short sentences and under 70 words unless they ask for detail. Teach one idea at a time in plain language. Avoid long introductions, headings, bullet lists, repeated summaries, and menus of choices.
Answer the learner's actual question first. If they ask for an explanation, explain it instead of screening them again. Format technical terms, PHP functions, filenames, and API names as inline Markdown code (for example, \`include\`, \`require_once\`, or \`hook_menu()\`). Do not include a code block unless they ask for code or it is essential; when needed, show at most a tiny example and explain only the relevant part.
When asked "what is X?", define X in everyday language before discussing Drupal APIs or implementation. For example, Drupal's site name is the title shown for the website; only explain \`variable_get('site_name', 'Drupal')\` if the learner asks how Drupal 7 reads that setting.
Do not treat ordinary chat questions as exercises or assessments. Do not automatically quiz the learner, ask repeated follow-up questions, or keep the lesson going. Only ask a question when the learner explicitly asks to be tested, or when one brief clarification is necessary to answer accurately. The app presents practice separately.
Do not append generic offers such as "Would you like another example?" or ask a question just to keep the conversation going. If they are confused, explain differently and reduce the step size.
For a learner who has the prerequisite knowledge, move to a small independent attempt and give progressive hints. Do not provide a complete exercise solution before an honest attempt.
Never claim an answer passed, a skill was mastered, or a level was unlocked; only the deterministic grader can establish those outcomes. The learner's progress is not saved by chat.
Refuse requests to skip required lessons or level gates.
Call out security flaws, especially XSS, SQL injection, and missing access checks. Give a concrete next step.
Be direct and constructive, not flattering. Give one actionable step at a time.`;

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

  const payload = JSON.stringify({
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
    generationConfig: { temperature: 0.35, maxOutputTokens: 400 },
  });

  let providerResponse: Response | undefined;
  try {
    for (const model of MODELS) {
      for (let attempt = 0; attempt < MAX_PROVIDER_ATTEMPTS; attempt++) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: payload,
            signal: request.signal,
            cache: "no-store",
          },
        );
        providerResponse = response;

        if (response.ok) break;

        const transient = [429, 500, 502, 503, 504].includes(response.status);
        if (!transient) break;

        if (attempt + 1 < MAX_PROVIDER_ATTEMPTS) {
          const retryAfter = Number(response.headers.get("retry-after"));
          const waitMs = Number.isFinite(retryAfter)
            ? Math.min(Math.max(retryAfter * 1000, 0), 2_000)
            : 300 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }

      if (providerResponse?.ok) break;
      if (providerResponse?.status !== 429 && ![500, 502, 503, 504].includes(providerResponse?.status ?? 0)) break;
    }
  } catch {
    return NextResponse.json({ error: "Could not connect to Gemini. Check the server network and try again." }, { status: 502 });
  }

  const finalResponse = providerResponse;
  if (!finalResponse) {
    return NextResponse.json({ error: "Could not connect to Gemini. Check the server network and try again." }, { status: 502 });
  }

  if (!finalResponse.ok) {
    const status = finalResponse.status === 429 ? 429 : 502;
    const providerError = await finalResponse.json().catch(() => null);
    const providerMessage =
      typeof providerError === "object" &&
      providerError !== null &&
      "error" in providerError &&
      typeof providerError.error === "object" &&
      providerError.error !== null &&
      "message" in providerError.error &&
      typeof providerError.error.message === "string"
        ? providerError.error.message
        : null;
    return NextResponse.json(
      {
        error:
          finalResponse.status === 429
            ? "Gemini rate limit reached. Wait a moment and try again."
            : `Gemini request failed with status ${finalResponse.status}.${providerMessage ? ` ${providerMessage}` : " Check the server key and provider configuration."}`,
      },
      { status },
    );
  }

  if (!finalResponse.body) {
    return NextResponse.json({ error: "Gemini returned an empty response stream." }, { status: 502 });
  }

  return new Response(finalResponse.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
