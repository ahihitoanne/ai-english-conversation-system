import type { ChatTurnResponse, HealthResponse, Scenario, StartSessionResponse } from "@/types/chat";

const DEFAULT_API_URL = "http://localhost:8000/api/v1";

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
}

function getBackendRootUrl(): string {
  const apiBase = getApiBaseUrl();
  try {
    return new URL(apiBase).origin;
  } catch {
    return apiBase.replace(/\/api\/v1$/, "");
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  const fallback = `Yêu cầu thất bại (HTTP ${response.status})`;
  try {
    const text = await response.text();
    if (!text) return fallback;
    const parsed = JSON.parse(text) as { detail?: unknown };
    if (typeof parsed.detail === "string") {
      return `${parsed.detail} (HTTP ${response.status})`;
    }
    if (Array.isArray(parsed.detail)) {
      const firstMsg = parsed.detail
        .map((item) => (typeof item === "object" && item && "msg" in item ? String(item.msg) : String(item)))
        .join("; ");
      return firstMsg ? `${firstMsg} (HTTP ${response.status})` : fallback;
    }
    return text;
  } catch {
    return fallback;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
  return (await response.json()) as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>(`${getBackendRootUrl()}/health`, {
    cache: "no-store",
  });
}

export async function fetchScenarios(): Promise<Scenario[]> {
  return requestJson<Scenario[]>(`${getApiBaseUrl()}/scenarios`, {
    cache: "no-store",
  });
}

export async function createSession(scenarioId: number): Promise<StartSessionResponse> {
  return requestJson<StartSessionResponse>(`${getApiBaseUrl()}/chat/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_id: scenarioId }),
  });
}

export interface VoiceTurnPayload {
  audio: Blob;
  filename: string;
  scenarioId: number;
  turnIndex: number;
  sessionId?: number | null;
}

export async function sendVoiceTurn(payload: VoiceTurnPayload): Promise<ChatTurnResponse> {
  const formData = new FormData();
  formData.append("audio", payload.audio, payload.filename);
  formData.append("scenario_id", String(payload.scenarioId));
  formData.append("turn_index", String(payload.turnIndex));
  if (payload.sessionId !== undefined && payload.sessionId !== null) {
    formData.append("session_id", String(payload.sessionId));
  }

  return requestJson<ChatTurnResponse>(`${getApiBaseUrl()}/chat/voice-turn`, {
    method: "POST",
    body: formData,
  });
}

export interface TextTurnPayload {
  userText: string;
  scenarioId: number;
  turnIndex: number;
  sessionId?: number | null;
}

export async function sendTextTurn(payload: TextTurnPayload): Promise<ChatTurnResponse> {
  const formData = new FormData();
  formData.append("user_text", payload.userText);
  formData.append("scenario_id", String(payload.scenarioId));
  formData.append("turn_index", String(payload.turnIndex));
  if (payload.sessionId !== undefined && payload.sessionId !== null) {
    formData.append("session_id", String(payload.sessionId));
  }

  return requestJson<ChatTurnResponse>(`${getApiBaseUrl()}/chat/text-turn`, {
    method: "POST",
    body: formData,
  });
}

