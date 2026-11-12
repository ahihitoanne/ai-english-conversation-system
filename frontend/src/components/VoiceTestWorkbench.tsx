"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSession,
  fetchHealth,
  fetchScenarios,
  getApiBaseUrl,
  sendTextTurn,
  sendVoiceTurn,
} from "@/lib/api";
import { MAX_RECORDING_SECONDS, useAudioRecorder } from "@/hooks/useAudioRecorder";
import type { ChatTurnResponse, HealthResponse, Scenario, TurnLogItem } from "@/types/chat";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { ResultPanel } from "@/components/ResultPanel";

function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function parseOptionalPositiveInt(raw: string): { valid: boolean; value: number | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: true, value: null };
  if (!/^\d+$/.test(trimmed)) return { valid: false, value: null };
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return { valid: false, value: null };
  return { valid: true, value: parsed };
}

export function VoiceTestWorkbench() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(null);
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [scenariosError, setScenariosError] = useState<string | null>(null);

  const [sessionIdInput, setSessionIdInput] = useState("");
  const [turnIndexInput, setTurnIndexInput] = useState("1");
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [turnIndexError, setTurnIndexError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textError, setTextError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [turns, setTurns] = useState<TurnLogItem[]>([]);

  const sessionInputRef = useRef<HTMLInputElement | null>(null);
  const turnInputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const recorder = useAudioRecorder();

  const loadBackendData = useCallback(async () => {
    setScenariosLoading(true);
    setScenariosError(null);
    setHealthError(null);

    try {
      const [healthRes, scenarioList] = await Promise.all([fetchHealth(), fetchScenarios()]);
      setHealth(healthRes);
      setScenarios(scenarioList);
      setSelectedScenarioId((prev) =>
        prev !== null && scenarioList.some((s) => s.id === prev)
          ? prev
          : scenarioList[0]?.id ?? null
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setHealth(null);
      setHealthError(msg);
      setScenariosError(
        `Không kết nối được tới Backend (${getApiBaseUrl()}). Hãy chắc chắn uvicorn đang chạy ở cổng 8000.`
      );
    } finally {
      setScenariosLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  const validateTurnParams = (): { scenarioId: number; turnIndex: number; sessionId: number | null } | null => {
    setSessionError(null);
    setTurnIndexError(null);

    if (selectedScenarioId === null) {
      setSubmitError("Chưa có kịch bản nào được chọn. Hãy tải lại kịch bản trước.");
      return null;
    }

    const sessionCheck = parseOptionalPositiveInt(sessionIdInput);
    if (!sessionCheck.valid) {
      setSessionError("Session ID phải là số nguyên dương hoặc để trống.");
      sessionInputRef.current?.focus();
      return null;
    }

    const turnCheck = parseOptionalPositiveInt(turnIndexInput);
    if (!turnCheck.valid || turnCheck.value === null) {
      setTurnIndexError("Turn index phải là số nguyên >= 1.");
      turnInputRef.current?.focus();
      return null;
    }

    return {
      scenarioId: selectedScenarioId,
      turnIndex: turnCheck.value,
      sessionId: sessionCheck.value,
    };
  };

  const recordTurnResult = (
    source: TurnLogItem["source"],
    turnIndex: number,
    scenarioId: number,
    response: ChatTurnResponse
  ) => {
    const scenarioTitle =
      scenarios.find((item) => item.id === scenarioId)?.title ?? `Scenario #${scenarioId}`;
    const entry: TurnLogItem = {
      id: `${Date.now()}-${turnIndex}`,
      source,
      turnIndex,
      scenarioTitle,
      response,
    };
    setTurns((prev) => [entry, ...prev]);
    setTurnIndexInput(String(turnIndex + 1));
    setStatusMessage(
      `Đã nhận phản hồi cho lượt ${turnIndex}. AI trả lời: ${response.ai_reply}`
    );
  };

  const handleSendRecordedAudio = async () => {
    setSubmitError(null);
    if (!recorder.audioBlob) {
      setSubmitError("Chưa có bản ghi âm nào. Hãy bấm Bắt đầu ghi âm trước.");
      return;
    }
    const params = validateTurnParams();
    if (!params) return;

    setIsSubmitting(true);
    try {
      const response = await sendVoiceTurn({
        audio: recorder.audioBlob,
        filename: recorder.filename,
        scenarioId: params.scenarioId,
        turnIndex: params.turnIndex,
        sessionId: params.sessionId,
      });
      recordTurnResult("mic", params.turnIndex, params.scenarioId, response);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendUploadedFile = async () => {
    setSubmitError(null);
    if (!selectedFile) {
      setSubmitError("Bạn chưa chọn file audio nào.");
      fileInputRef.current?.focus();
      return;
    }
    const params = validateTurnParams();
    if (!params) return;

    setIsSubmitting(true);
    try {
      const response = await sendVoiceTurn({
        audio: selectedFile,
        filename: selectedFile.name,
        scenarioId: params.scenarioId,
        turnIndex: params.turnIndex,
        sessionId: params.sessionId,
      });
      recordTurnResult("file", params.turnIndex, params.scenarioId, response);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setTextError(null);

    const trimmed = textInput.trim();
    if (!trimmed) {
      setTextError("Vui lòng nhập nội dung câu tiếng Anh trước khi gửi.");
      textAreaRef.current?.focus();
      return;
    }

    const params = validateTurnParams();
    if (!params) return;

    setIsSubmitting(true);
    try {
      const response = await sendTextTurn({
        userText: trimmed,
        scenarioId: params.scenarioId,
        turnIndex: params.turnIndex,
        sessionId: params.sessionId,
      });
      recordTurnResult("text", params.turnIndex, params.scenarioId, response);
      setTextInput("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (event.nativeEvent.isComposing || event.keyCode === 229) {
        return;
      }
      if (!isSubmitting) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  };

  const handleUseHint = (hint: string) => {
    setTextInput(hint);
    setTextError(null);
    textAreaRef.current?.focus();
  };

  const handleCreateSession = async () => {
    setSubmitError(null);
    setSessionError(null);
    if (selectedScenarioId === null) {
      setSubmitError("Chưa chọn kịch bản để tạo session.");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createSession(selectedScenarioId);
      setSessionIdInput(String(created.session_id));
      setTurnIndexInput("1");
      setStatusMessage(`Đã tạo session mới #${created.session_id} trong PostgreSQL.`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
      <header className="surface-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">VocabTalk — Khung kiểm thử Frontend</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Gửi giọng nói (Mic / File) hoặc Text lên FastAPI và xuất toàn bộ kết quả văn bản từ AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className="rounded-md px-3 py-1.5 font-medium"
            style={{
              backgroundColor: health ? "var(--ok-bg)" : "var(--danger-bg)",
              color: health ? "var(--ok-text)" : "var(--danger-text)",
            }}
          >
            {health
              ? `Backend: Đang chạy · DB: ${health.database}`
              : healthError
              ? "Backend: Chưa kết nối được"
              : "Backend: Đang kiểm tra..."}
          </span>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <ScenarioSelector
            scenarios={scenarios}
            selectedId={selectedScenarioId}
            isLoading={scenariosLoading}
            loadError={scenariosError}
            onSelect={setSelectedScenarioId}
            onRetry={loadBackendData}
          />

          <section className="surface-card p-4 sm:p-5 space-y-5" aria-labelledby="input-heading">
            <h2 id="input-heading" className="text-lg font-semibold">
              2. Gửi lượt nói / văn bản tới AI
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="session-id" className="text-sm font-medium">
                  Session ID (tùy chọn)
                </label>
                <div className="flex gap-2">
                  <input
                    ref={sessionInputRef}
                    id="session-id"
                    name="session_id"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={sessionIdInput}
                    onChange={(e) => {
                      setSessionIdInput(e.target.value);
                      if (sessionError) setSessionError(null);
                    }}
                    aria-invalid={sessionError ? "true" : undefined}
                    aria-describedby={sessionError ? "session-id-error" : "session-id-help"}
                    placeholder="Để trống nếu chưa tạo session"
                    className="tap-target w-full rounded-md border px-3 py-2 text-sm surface-muted"
                  />
                  <button
                    type="button"
                    onClick={handleCreateSession}
                    disabled={isSubmitting || selectedScenarioId === null}
                    className="tap-target shrink-0 rounded-md border px-3 py-2 text-xs font-medium disabled:opacity-60"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Tạo Session
                  </button>
                </div>
                <span id="session-id-help" className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Để trống nếu chỉ test AI, hoặc bấm &ldquo;Tạo Session&rdquo; để lưu vào PostgreSQL.
                </span>
                {sessionError && (
                  <span id="session-id-error" className="text-xs font-medium" style={{ color: "var(--danger-text)" }}>
                    {sessionError}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="turn-index" className="text-sm font-medium">
                  Turn index <span aria-hidden="true">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    ref={turnInputRef}
                    id="turn-index"
                    name="turn_index"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]+"
                    required
                    value={turnIndexInput}
                    onChange={(e) => {
                      setTurnIndexInput(e.target.value);
                      if (turnIndexError) setTurnIndexError(null);
                    }}
                    aria-invalid={turnIndexError ? "true" : undefined}
                    aria-describedby={turnIndexError ? "turn-index-error" : undefined}
                    className="tap-target w-full rounded-md border px-3 py-2 text-sm surface-muted"
                  />
                  <button
                    type="button"
                    onClick={() => setTurnIndexInput("1")}
                    className="tap-target shrink-0 rounded-md border px-3 py-2 text-xs font-medium"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Về 1
                  </button>
                </div>
                {turnIndexError && (
                  <span id="turn-index-error" className="text-xs font-medium" style={{ color: "var(--danger-text)" }}>
                    {turnIndexError}
                  </span>
                )}
              </div>
            </div>

            <div className="surface-muted p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Cách A: Ghi âm trực tiếp từ Mic</h3>
                <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatTimer(recorder.elapsedMs)} / 00:{MAX_RECORDING_SECONDS}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {recorder.status !== "recording" ? (
                  <button
                    type="button"
                    onClick={recorder.startRecording}
                    disabled={isSubmitting}
                    className="tap-target rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--accent-contrast)",
                    }}
                  >
                    Bắt đầu ghi âm
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={recorder.stopRecording}
                    className="tap-target rounded-md px-4 py-2 text-sm font-semibold"
                    style={{
                      backgroundColor: "var(--danger-bg)",
                      color: "var(--danger-text)",
                    }}
                  >
                    Dừng ghi âm
                  </button>
                )}

                {recorder.audioBlob && recorder.status !== "recording" && (
                  <>
                    <button
                      type="button"
                      onClick={handleSendRecordedAudio}
                      disabled={isSubmitting || selectedScenarioId === null}
                      className="tap-target rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
                      style={{
                        backgroundColor: "var(--ok-bg)",
                        color: "var(--ok-text)",
                      }}
                    >
                      Gửi bản ghi lên AI
                    </button>
                    <button
                      type="button"
                      onClick={recorder.clearRecording}
                      disabled={isSubmitting}
                      className="tap-target rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-60"
                      style={{ borderColor: "var(--border)" }}
                    >
                      Xóa
                    </button>
                  </>
                )}
              </div>

              {recorder.status === "recording" && (
                <p className="text-xs font-medium" style={{ color: "var(--danger-text)" }}>
                  Đang thu âm... Hãy nói tiếng Anh vào micro rồi bấm Dừng ghi âm.
                </p>
              )}

              {recorder.errorMessage && (
                <p role="alert" className="text-xs font-medium" style={{ color: "var(--danger-text)" }}>
                  {recorder.errorMessage}
                </p>
              )}

              {recorder.audioUrl && (
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Nghe lại đoạn vừa thu ({recorder.filename}):
                  </p>
                  <audio controls src={recorder.audioUrl} className="w-full" />
                </div>
              )}
            </div>

            <div className="surface-muted p-3.5 space-y-2.5">
              <h3 className="text-sm font-semibold">Cách B: Upload file audio sẵn (.mp3, .wav, .webm)</h3>
              <label htmlFor="audio-file-input" className="block text-xs" style={{ color: "var(--text-muted)" }}>
                Chọn file âm thanh từ máy
              </label>
              <input
                ref={fileInputRef}
                id="audio-file-input"
                type="file"
                accept="audio/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              <button
                type="button"
                onClick={handleSendUploadedFile}
                disabled={isSubmitting || selectedScenarioId === null}
                className="tap-target rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60"
                style={{ borderColor: "var(--border)" }}
              >
                Gửi file audio lên AI
              </button>
            </div>

            <form onSubmit={handleTextSubmit} noValidate className="surface-muted p-3.5 space-y-2.5">
              <h3 className="text-sm font-semibold">Cách C: Nhập câu tiếng Anh bằng Text</h3>
              <div className="flex flex-col gap-1">
                <label htmlFor="text-input" className="text-sm font-medium">
                  Câu muốn nói với AI <span aria-hidden="true">*</span>
                </label>
                <span id="text-input-hint" className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Nhấn Enter để gửi nhanh (tương thích bộ gõ tiếng Việt), Shift+Enter để xuống dòng.
                </span>
                <textarea
                  ref={textAreaRef}
                  id="text-input"
                  name="user_text"
                  rows={3}
                  required
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    if (textError) setTextError(null);
                  }}
                  onKeyDown={handleTextareaKeyDown}
                  aria-invalid={textError ? "true" : undefined}
                  aria-describedby={textError ? "text-input-error text-input-hint" : "text-input-hint"}
                  placeholder="Ví dụ: Hello, I want order one iced latte less sweet, please."
                  className="w-full rounded-md border p-2.5 text-sm surface-card"
                />
                {textError && (
                  <span id="text-input-error" className="text-xs font-medium" style={{ color: "var(--danger-text)" }}>
                    {textError}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="tap-target rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-contrast)",
                }}
              >
                Gửi text tới AI
              </button>
            </form>

            {isSubmitting && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Đang gửi yêu cầu tới Backend &amp; chờ AI phản hồi...</p>
                <progress aria-label="Đang chờ phản hồi từ Backend" className="w-full" />
              </div>
            )}

            {submitError && (
              <div
                role="alert"
                className="rounded-md p-3 text-sm font-medium"
                style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger-text)" }}
              >
                Lỗi gọi API: {submitError}
              </div>
            )}

            <div role="status" aria-live="polite" className="visually-hidden">
              {statusMessage}
            </div>
          </section>
        </div>

        <div className="lg:col-span-7">
          <ResultPanel
            turns={turns}
            onUseHint={handleUseHint}
            onClearHistory={() => {
              setTurns([]);
              setStatusMessage("Đã xóa danh sách lịch sử hiển thị.");
            }}
          />
        </div>
      </main>
    </div>
  );
}

