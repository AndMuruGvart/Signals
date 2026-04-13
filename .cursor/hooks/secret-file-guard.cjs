"use strict";

const { readStdinObject } = require("./_stdin-json.cjs");

function main() {
  const input = readStdinObject();
  const filePath = String(input.file_path || "");

  const blockedPatterns = [/\.env(\.|$)/i, /\.pem$/i, /\.key$/i, /id_rsa/i];
  const shouldBlock = blockedPatterns.some((pattern) => pattern.test(filePath));

  if (!shouldBlock) {
    process.stdout.write(JSON.stringify({ permission: "allow" }));
    process.exit(0);
  }

  process.stdout.write(
    JSON.stringify({
      permission: "deny",
      user_message: `Blocked reading sensitive file: ${filePath}`,
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
