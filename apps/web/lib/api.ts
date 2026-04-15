export type ScenarioPayload = {
  scenario: "traffic_burst" | "latency_spike" | "system_error";
  intensity: "low" | "medium" | "high";
  note?: string;
};

export type ScenarioRun = {
  id: string;
  scenario: ScenarioPayload["scenario"];
  intensity: ScenarioPayload["intensity"];
  status: "running" | "succeeded" | "failed";
  note: string | null;
  summary: string | null;
  errorMessage: string | null;
  sentryEventId: string | null;
  createdAt: string;
  completedAt: string | null;
  durationMs: number | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function listScenarioRuns(limit = 10) {
  return request<ScenarioRun[]>(`/api/scenarios/history?limit=${limit}`);
}

export function runScenario(payload: ScenarioPayload) {
  return request<ScenarioRun>("/api/scenarios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
