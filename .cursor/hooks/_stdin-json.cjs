"use strict";

const fs = require("fs");

/**
 * Cursor passes hook payloads on stdin as JSON. Empty or whitespace-only
 * input must not crash the hook (otherwise failClosed blocks all reads/shell).
 */
function readStdinObject() {
  try {
    const raw = fs.readFileSync(0, "utf8");
    const trimmed = String(raw).trim();
    if (!trimmed) {
      return {};
    }
    return JSON.parse(trimmed);
  } catch {
    return {};
  }
}

module.exports = { readStdinObject };
