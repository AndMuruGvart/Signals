"use strict";

const { readStdinObject } = require("./_stdin-json.cjs");

function main() {
  const input = readStdinObject();
  const command = String(input.command || "");

  const blocked = [
    "git reset --hard",
    "git checkout --",
    "rm -rf",
    "docker compose down -v",
    "del /s /q",
  ];

  const match = blocked.find((fragment) => command.includes(fragment));

  if (!match) {
    process.stdout.write(JSON.stringify({ permission: "allow" }));
    process.exit(0);
  }

  process.stdout.write(
    JSON.stringify({
      permission: "deny",
      user_message: `Blocked risky command: ${match}. Use a safer, targeted alternative.`,
      agent_message:
        "Do not use destructive workspace-wide commands. Switch to surgical edits or ask the user before deleting data.",
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
