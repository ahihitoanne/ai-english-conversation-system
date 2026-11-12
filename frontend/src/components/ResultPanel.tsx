"use client";

import { useCallback, useEffect, useState } from "react";
import type { TurnLogItem } from "@/types/chat";

interface ResultPanelProps {
  turns: TurnLogItem[];
  onUseHint: (hint: string) => void;
  onClearHistory: () => void;
}

const SOURCE_LABELS: Record<TurnLogItem["source"], string> = {
  mic: "Ghi âm Mic",
  file: "Upload Audio",
  text: "Nhập Text",
};

function formatMs(value?: number | null): string {
  if (value === null || value === undefined) return "Không áp dụng (—)";
  return `${value.toFixed(2)} ms`;
}

export function ResultPanel({ turns, onUseHint, onClearHistory }: ResultPanelProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const latestTurn = turns[0] ?? null;

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    stopSpeech();
  }, [latestTurn?.id, stopSpeech]);

  const handleToggleSpeech = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="surface-card p-4 sm:p-5 space-y-4" aria-labelledby="result-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="result-heading" className="text-lg font-semibold">
          3. Kết quả văn bản trả về
        </h2>
        {turns.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="tap-target rounded-md border px-3 py-2 text-sm font-medium"
            style={{ borderColor: "var(--border)" }}
          >
            Xóa lịch sử hiển thị
          </button>
        )}
      </div>

      {!latestTurn ? (
        <div className="surface-muted p-4 text-sm" style={{ color: "var(--text-muted)" }}>
          Chưa có lượt kiểm thử nào. Hãy chọn kịch bản ở bên trái rồi thử ghi âm mic, tải file audio hoặc gửi một câu text để xem kết quả text tại đây.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="surface-muted px-2.5 py-1">
              Lượt #{latestTurn.turnIndex} · {SOURCE_LABELS[latestTurn.source]}
            </span>
            <span className="surface-muted px-2.5 py-1">
              Kịch bản: {latestTurn.scenarioTitle}
            </span>
            <span
              className="rounded-md px-2.5 py-1"
              style={{
                backgroundColor: latestTurn.response.is_mock ? "var(--danger-bg)" : "var(--ok-bg)",
                color: latestTurn.response.is_mock ? "var(--danger-text)" : "var(--ok-text)",
              }}
            >
              {latestTurn.response.is_mock ? "Chế độ Mock (chưa dùng API thật)" : "API Thật (is_mock: false)"}
            </span>
          </div>

          <div className="surface-muted p-3.5 space-y-1">
            <h3 className="text-sm font-semibold">Nội dung bạn nói / gửi (user_text)</h3>
            <p lang="en" className="text-base whitespace-pre-wrap break-words">
              {latestTurn.response.user_text}
            </p>
          </div>

          <div className="surface-muted p-3.5 space-y-2" style={{ borderColor: "var(--accent)" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">AI trả lời (ai_reply)</h3>
              <button
                type="button"
                onClick={() => handleToggleSpeech(latestTurn.response.ai_reply)}
                className="rounded-md border px-3 py-1.5 text-xs font-medium"
                style={{ borderColor: "var(--border)" }}
              >
                {isSpeaking ? "Dừng đọc" : "Nghe AI đọc (TTS trình duyệt)"}
              </button>
            </div>
            <p lang="en" className="text-base whitespace-pre-wrap break-words">
              {latestTurn.response.ai_reply}
            </p>
          </div>

          <div className="surface-muted p-3.5 space-y-1">
            <h3 className="text-sm font-semibold">Gợi ý diễn đạt tự nhiên hơn (better_phrasing)</h3>
            {latestTurn.response.better_phrasing ? (
              <p lang="en" className="text-sm whitespace-pre-wrap break-words font-medium">
                {latestTurn.response.better_phrasing}
              </p>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Không có lỗi cần sửa (<code>null</code>)
              </p>
            )}
          </div>

          <div className="surface-muted p-3.5 space-y-2">
            <h3 className="text-sm font-semibold">Gợi ý câu trả lời tiếp theo (suggested_hints)</h3>
            {latestTurn.response.suggested_hints.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {latestTurn.response.suggested_hints.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => onUseHint(hint)}
                    className="rounded-md border px-3 py-2 text-left text-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span lang="en">{hint}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Không có gợi ý thêm.
              </p>
            )}
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Bấm vào một gợi ý bất kỳ để điền nhanh vào ô nhập text.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <caption className="text-left font-semibold mb-1.5">
                Thông số đo được từ Backend
              </caption>
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th scope="col" className="py-1.5 pe-4 text-left font-medium">
                    Chỉ số
                  </th>
                  <th scope="col" className="py-1.5 text-left font-medium">
                    Giá trị
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th scope="row" className="py-1.5 pe-4 text-left font-normal">
                    Model LLM (<code>model_used</code>)
                  </th>
                  <td className="py-1.5 font-mono text-xs sm:text-sm">
                    {latestTurn.response.model_used || "—"}
                  </td>
                </tr>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th scope="row" className="py-1.5 pe-4 text-left font-normal">
                    Độ trễ STT Groq (<code>stt_ms</code>)
                  </th>
                  <td className="py-1.5 font-mono text-xs sm:text-sm">
                    {formatMs(latestTurn.response.stt_ms)}
                  </td>
                </tr>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th scope="row" className="py-1.5 pe-4 text-left font-normal">
                    Độ trễ LLM Gemini (<code>llm_ms</code>)
                  </th>
                  <td className="py-1.5 font-mono text-xs sm:text-sm">
                    {formatMs(latestTurn.response.llm_ms)}
                  </td>
                </tr>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th scope="row" className="py-1.5 pe-4 text-left font-normal">
                    Tổng thời gian xử lý API (<code>total_ms</code>)
                  </th>
                  <td className="py-1.5 font-mono text-xs sm:text-sm">
                    {formatMs(latestTurn.response.total_ms)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-1.5 pe-4 text-left font-normal">
                    Chi tiết lỗi (<code>error_detail</code>)
                  </th>
                  <td className="py-1.5 font-mono text-xs sm:text-sm">
                    {latestTurn.response.error_detail || "null"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <details>
            <summary className="cursor-pointer text-sm font-medium">
              Xem JSON thô trả về từ API
            </summary>
            <pre
              role="region"
              aria-label="JSON phản hồi mới nhất"
              tabIndex={0}
              className="code-viewer mt-2 text-xs sm:text-sm"
            >
              <code>{JSON.stringify(latestTurn.response, null, 2)}</code>
            </pre>
          </details>

          {turns.length > 1 && (
            <div className="pt-2 space-y-2">
              <h3 className="text-sm font-semibold">
                Nhật ký các lượt đã gửi trong phiên trình duyệt ({turns.length})
              </h3>
              <ol className="space-y-2 list-decimal ps-5 text-sm">
                {turns.map((item) => (
                  <li key={item.id} className="surface-muted p-2.5 space-y-1">
                    <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      Turn #{item.turnIndex} · {SOURCE_LABELS[item.source]} ·{" "}
                      {formatMs(item.response.total_ms)}
                    </div>
                    <p>
                      <strong>Bạn:</strong>{" "}
                      <span lang="en">{item.response.user_text}</span>
                    </p>
                    <p>
                      <strong>AI:</strong>{" "}
                      <span lang="en">{item.response.ai_reply}</span>
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

