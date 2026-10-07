export async function readApiResponse<T>(response: Response): Promise<T> {
  const body = await response.text();
  let payload: unknown;

  try {
    payload = body ? JSON.parse(body) : null;
  } catch {
    throw new Error(
      `The server returned an unreadable response (HTTP ${response.status}). Check the app server logs.`,
    );
  }

  if (typeof payload !== "object" || payload === null) {
    throw new Error(
      response.ok
        ? "The server returned an empty response. Check the app server logs."
        : `The request failed (HTTP ${response.status}) without an error message. Check the app server logs.`,
    );
  }

  const result = payload as T & { error?: unknown };
  if (!response.ok) {
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : `The request failed (HTTP ${response.status}). Check the app server logs.`,
    );
  }
  return result;
}
