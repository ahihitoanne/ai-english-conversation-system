"use client";

import type { Scenario } from "@/types/chat";

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedId: number | null;
  isLoading: boolean;
  loadError: string | null;
  onSelect: (scenarioId: number) => void;
  onRetry: () => void;
}

export function ScenarioSelector({
  scenarios,
  selectedId,
  isLoading,
  loadError,
  onSelect,
  onRetry,
}: ScenarioSelectorProps) {
  const selectedScenario = scenarios.find((item) => item.id === selectedId) ?? null;

  return (
    <section className="surface-card p-4 sm:p-5 space-y-4" aria-labelledby="scenario-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="scenario-heading" className="text-lg font-semibold">
          1. Chọn kịch bản hội thoại
        </h2>
        <button
          type="button"
          onClick={onRetry}
          disabled={isLoading}
          className="tap-target rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-60"
          style={{ borderColor: "var(--border)" }}
        >
          Tải lại kịch bản
        </button>
      </div>

      {isLoading && (
        <div className="space-y-1">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Đang tải danh sách kịch bản từ Backend...
          </p>
          <progress aria-label="Đang tải danh sách kịch bản" className="w-full" />
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          className="rounded-md p-3 text-sm"
          style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger-text)" }}
        >
          {loadError}
        </div>
      )}

      {!isLoading && !loadError && scenarios.length === 0 && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Chưa có kịch bản nào trong cơ sở dữ liệu.
        </p>
      )}

      {scenarios.length > 0 && scenarios.length <= 5 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium mb-1">
            Danh sách kịch bản có sẵn ({scenarios.length})
          </legend>
          <div className="grid gap-2">
            {scenarios.map((scenario) => {
              const inputId = `scenario-radio-${scenario.id}`;
              const checked = scenario.id === selectedId;
              return (
                <div
                  key={scenario.id}
                  className="surface-muted flex items-start gap-3 p-3"
                  style={
                    checked
                      ? { borderColor: "var(--accent)", borderWidth: "2px" }
                      : undefined
                  }
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="scenario"
                    value={scenario.id}
                    checked={checked}
                    onChange={() => onSelect(scenario.id)}
                    className="mt-1 h-5 w-5 shrink-0"
                  />
                  <label htmlFor={inputId} className="cursor-pointer flex-1 text-sm">
                    <span className="font-semibold block">
                      #{scenario.id} — {scenario.title} ({scenario.category})
                    </span>
                    <span className="block mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Vai bạn: {scenario.user_role} · Vai AI: {scenario.ai_role}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
      )}

      {scenarios.length > 5 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scenario-select" className="text-sm font-medium">
            Danh sách kịch bản ({scenarios.length})
          </label>
          <select
            id="scenario-select"
            name="scenario_id"
            value={selectedId ?? ""}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="tap-target rounded-md border px-3 py-2 surface-muted"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                #{scenario.id} — {scenario.title} ({scenario.category})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedScenario && (
        <div className="surface-muted p-3 space-y-2 text-sm">
          <p>
            <strong>Bối cảnh:</strong>{" "}
            <span lang="en">{selectedScenario.context_description}</span>
          </p>
          <p>
            <strong>Câu mở đầu gợi ý từ AI:</strong>{" "}
            <span lang="en">&ldquo;{selectedScenario.initial_ai_message}&rdquo;</span>
          </p>

          {(selectedScenario.goals.length > 0 || selectedScenario.vocabulary_items.length > 0) && (
            <details className="pt-1">
              <summary className="cursor-pointer font-medium">
                Xem mục tiêu hội thoại &amp; từ vựng gợi ý
              </summary>
              <div className="mt-2 space-y-2">
                {selectedScenario.goals.length > 0 && (
                  <div>
                    <p className="font-medium">Mục tiêu:</p>
                    <ul className="list-disc ps-5 space-y-0.5">
                      {selectedScenario.goals.map((goal) => (
                        <li key={goal} lang="en">
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedScenario.vocabulary_items.length > 0 && (
                  <div>
                    <p className="font-medium">Từ vựng:</p>
                    <ul className="list-disc ps-5 space-y-0.5">
                      {selectedScenario.vocabulary_items.map((item) => (
                        <li key={`${item.word}-${item.id ?? ""}`}>
                          <span lang="en" className="font-semibold">
                            {item.word}
                          </span>{" "}
                          {item.ipa ? <span className="opacity-80">{item.ipa}</span> : null} —{" "}
                          {item.meaning_vi}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

