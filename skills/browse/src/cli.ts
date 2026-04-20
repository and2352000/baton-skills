#!/usr/bin/env bun
import { resolve } from "path";

const PORT = 7890;
const SERVER_PATH = resolve(import.meta.dir, "server.ts");

const [, , cmd, ...args] = process.argv;

// --- daemon management ---

async function isDaemonRunning(): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${PORT}/health`, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function startDaemon() {
  if (await isDaemonRunning()) {
    console.log("Daemon already running");
    return;
  }
  Bun.spawn(["bun", "run", SERVER_PATH], {
    stdout: Bun.file("/tmp/browse-daemon.log"),
    stderr: Bun.file("/tmp/browse-daemon.log"),
    detached: true,
  });
  // wait for it to be ready
  for (let i = 0; i < 20; i++) {
    await Bun.sleep(200);
    if (await isDaemonRunning()) {
      console.log("Daemon started");
      return;
    }
  }
  console.error("Daemon failed to start. Check /tmp/browse-daemon.log");
  process.exit(1);
}

async function stopDaemon() {
  if (!await isDaemonRunning()) {
    console.log("Daemon not running");
    return;
  }
  await send("stop", []);
  console.log("Daemon stopped");
}

// --- send command to daemon ---

async function send(command: string, cmdArgs: string[]): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`http://localhost:${PORT}`, {
      method: "POST",
      body: JSON.stringify({ cmd: command, args: cmdArgs }),
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    console.error("Daemon not running. Start it with: browse serve");
    process.exit(1);
  }

  const json = await res.json() as { ok: boolean; output?: string; error?: string };
  if (json.ok) {
    if (json.output) console.log(json.output);
  } else {
    console.error(json.error);
    process.exit(1);
  }
}

// --- main ---

switch (cmd) {
  case "serve":
    await startDaemon();
    break;
  case "stop":
    await stopDaemon();
    break;
  default:
    if (!cmd) {
      console.error("Usage: browse <command> [args...]");
      console.error("Commands: serve, stop, goto, wait, is, text, html, scroll, snapshot, click, url, status");
      process.exit(1);
    }
    await send(cmd, args);
}
