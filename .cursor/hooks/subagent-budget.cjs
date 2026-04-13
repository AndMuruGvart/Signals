"use strict";

const { readStdinObject } = require("./_stdin-json.cjs");

function main() {
  const input = readStdinObject();
  const task = String(input.task || "").trim();
  const tooBroad = task.length > 180 || /\band\b|\bthen\b|\balso\b/i.test(task);

  if (!tooBroad) {
    process.stdout.write(JSON.stringify({ permission: "allow" }));
    process.exit(0);
  }

  process.stdout.write(
    JSON.stringify({
      permission: "deny",
      user_message:
        "Subagent task is too broad. Split it into one atomic outcome, one directory, and one verification step.",
    }),
  );
  process.exit(2);
}

try {
  main();
} catch {
  process.stdout.write(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}
