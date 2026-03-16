/**
 * Fuwamaru OS — Dev server launcher
 *
 * Turbopack panics on multi-byte UTF-8 characters in absolute paths (e.g. Japanese folder names).
 * Since this project lives under OneDrive/デスクトップ/ふわまるAI, we force webpack mode via
 * the --webpack flag introduced in Next.js 16.
 */
const { spawn } = require("child_process");
const path = require("path");

const projectDir = path.join(__dirname, "fuwamaru-os");
const nextBin = path.join(projectDir, "node_modules", "next", "dist", "bin", "next");

// "dev" → next dev --webpack  |  "start" → next start  |  "build" → next build
const cmd = process.argv[2] || "dev";
const extraArgs = cmd === "dev" ? ["--webpack"] : [];

const child = spawn(process.execPath, [nextBin, cmd, ...extraArgs], {
  stdio: "inherit",
  cwd: projectDir,
});

child.on("exit", (code) => process.exit(code ?? 0));
