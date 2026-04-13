const express = require("express");

const app = express();
const port = Number(process.env.PORT || 8123);
const events = [];

app.use(express.raw({ type: "*/*", limit: "2mb" }));

function parseEnvelope(buffer) {
  const text = buffer.toString("utf8");
  const lines = text.split("\n").filter(Boolean);
  const jsonChunks = [];

  for (const line of lines) {
    try {
      jsonChunks.push(JSON.parse(line));
    } catch (_error) {
      continue;
    }
  }

  const eventPayload =
    jsonChunks.find(
      (chunk) => chunk.event_id || chunk.exception || chunk.message,
    ) || {};
  const exceptionValue = eventPayload.exception?.values?.[0];

  return {
    id: eventPayload.event_id || `evt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: eventPayload.level || "error",
    message:
      exceptionValue?.value ||
      eventPayload.message ||
      eventPayload.logentry?.formatted ||
      "Captured exception",
    type: exceptionValue?.type || eventPayload.type || "Error",
    scenario:
      eventPayload.tags?.scenario || eventPayload.extra?.scenario || "unknown",
    intensity:
      eventPayload.tags?.intensity ||
      eventPayload.extra?.intensity ||
      "unknown",
    raw: eventPayload,
  };
}

function renderHtml() {
  const rows = events
    .map(
      (event) => `
      <tr>
        <td>${event.timestamp}</td>
        <td><code>${event.type}</code></td>
        <td><code>${event.scenario}</code></td>
        <td>${escapeHtml(event.message)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Signal Lab Error Inbox</title>
      <style>
        body { margin: 0; background: #140f12; color: #fff8f8; font-family: Inter, ui-sans-serif, system-ui; }
        main { max-width: 1100px; margin: 0 auto; padding: 32px 20px 48px; }
        h1 { margin: 0 0 10px; font-size: 28px; }
        p { color: #f0cfd1; max-width: 720px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); vertical-align: top; }
        th { color: #fca5a5; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
        code { color: #fecaca; }
        a { color: #fdba74; }
      </style>
    </head>
    <body>
      <main>
        <h1>Signal Lab Error Inbox</h1>
        <p>This service accepts Sentry envelope traffic from the NestJS API and keeps the latest events in memory for local review. Raw JSON is available at <a href="/events">/events</a>.</p>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Scenario</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="4">No errors captured yet.</td></tr>'}</tbody>
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
  res.json({ status: "ok", events: events.length });
});

app.get("/events", (_req, res) => {
  res.json(events);
});

app.get("/", (_req, res) => {
  res.send(renderHtml());
});

app.post("/api/:projectId/envelope/", (req, res) => {
  const event = parseEnvelope(req.body);
  events.unshift(event);
  events.splice(100);
  res.status(200).send("ok");
});

app.post("/api/:projectId/store/", (req, res) => {
  const event = parseEnvelope(req.body);
  events.unshift(event);
  events.splice(100);
  res.status(200).send("ok");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Sentry sink listening on ${port}`);
});
