export interface VocabularyItem {
  id?: number | null;
  word: string;
  ipa?: string | null;
  meaning_vi: string;
  example_sentence?: string | null;
}

export interface Scenario {
  id: number;
  title: string;
  category: string;
  user_role: string;
  ai_role: string;
  context_description: string;
  initial_ai_message: string;
  goals: string[];
  vocabulary_items: VocabularyItem[];
}

export interface ChatTurnResponse {
  user_text: string;
  ai_reply: string;
  better_phrasing?: string | null;
  suggested_hints: string[];
  is_mock: boolean;
  model_used?: string | null;
  stt_ms?: number | null;
  llm_ms?: number | null;
  total_ms?: number | null;
  error_detail?: string | null;
}

export interface HealthResponse {
  status: string;
  database: string;
}

export interface StartSessionResponse {
  session_id: number;
  scenario_id: number;
  created_at: string;
}

export interface TurnLogItem {
  id: string;
  source: "mic" | "file" | "text";
  turnIndex: number;
  scenarioTitle: string;
  response: ChatTurnResponse;
}

