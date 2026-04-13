const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3100);
const lokiUrl = process.env.LOKI_URL || "http://loki:3100";

async function fetchLogs() {
  const end = Date.now() * 1_000_000;
  const start = end - 6 * 60 * 60 * 1_000_000_000;
  const params = new URLSearchParams({
    query: '{app="signal-lab-api"}',
    limit: "50",
    direction: "backward",
    start: String(start),
    end: String(end),
  });

  const response = await fetch(
    `${lokiUrl}/loki/api/v1/query_range?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Loki query failed with ${response.status}`);
  }

  const payload = await response.json();
  const streams = payload.data?.result ?? [];
  const rows = [];

  for (const stream of streams) {
    for (const value of stream.values ?? []) {
      rows.push({
        labels: stream.stream ?? {},
        ts: Number(value[0]),
        line: value[1],
      });
    }
  }

  return rows.sort((left, right) => right.ts - left.ts);
}

function renderHtml(rows) {
  const items = rows
    .map((row) => {
      const timestamp = new Date(row.ts / 1_000_000).toISOString();
      return `
        <tr>
          <td>${timestamp}</td>
          <td><code>${row.labels.level || "info"}</code></td>
          <td><code>${row.labels.scenario || "unknown"}</code></td>
          <td><pre>${escapeHtml(row.line)}</pre></td>
        </tr>
      `;
    })
    .join("");

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Signal Lab Loki Viewer</title>
      <style>
        body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; margin: 0; background: #111827; color: #f9fafb; }
        main { max-width: 1200px; margin: 0 auto; padding: 32px 20px 48px; }
        h1 { font-size: 28px; margin: 0 0 10px; }
        p { color: #cbd5e1; margin: 0 0 24px; }
        table { width: 100%; border-collapse: collapse; background: #0f172a; border: 1px solid #334155; }
        th, td { border-bottom: 1px solid #1e293b; padding: 12px; vertical-align: top; text-align: left; }
        th { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
        pre { margin: 0; white-space: pre-wrap; word-break: break-word; }
        a { color: #67e8f9; }
      </style>
    </head>
    <body>
      <main>
        <h1>Signal Lab Loki Viewer</h1>
        <p>Latest structured logs from Loki. Refresh after running a scenario. Raw JSON is available at <a href="/api/logs">/api/logs</a>.</p>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Level</th>
              <th>Scenario</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>${items || '<tr><td colspan="4">No logs yet.</td></tr>'}</tbody>
        </table>
      </main>
    </body>
  </html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/logs", async (_req, res) => {
  try {
    const rows = await fetchLogs();
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/", async (_req, res) => {
  try {
    const rows = await fetchLogs();
    res.send(renderHtml(rows));
  } catch (error) {
    res
      .status(500)
      .send(
        `<pre>${escapeHtml(error instanceof Error ? error.message : "Unknown error")}</pre>`,
      );
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Loki viewer listening on ${port}`);
});
