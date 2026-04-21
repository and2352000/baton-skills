import { chromium, type Page, type Browser } from "playwright";
import { writeFileSync } from "fs";

const PORT = 7890;
const PID_FILE = "/tmp/browse-daemon.pid";

let browser: Browser | null = null;
let page: Page | null = null;

async function getPage(): Promise<Page> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  if (!page || page.isClosed()) {
    const context = await browser.newContext();
    page = await context.newPage();
  }
  return page;
}

async function handleCommand(cmd: string, args: string[]): Promise<string> {
  switch (cmd) {
    case "goto": {
      const p = await getPage();
      await p.goto(args[0]);
      return `Navigated to ${args[0]}`;
    }

    case "wait": {
      const target = args[0];
      const p = await getPage();
      if (target === "--networkidle") {
        await p.waitForLoadState("networkidle");
        return "Network idle";
      } else if (target === "--load") {
        await p.waitForLoadState("load");
        return "Page loaded";
      } else {
        await p.waitForSelector(target, { timeout: 15000 });
        return `Element found: ${target}`;
      }
    }

    case "is": {
      const [prop, sel] = args;
      const p = await getPage();
      if (prop === "visible") {
        const visible = await p.locator(sel).first().isVisible();
        return visible ? "true" : "false";
      }
      throw new Error(`Unknown property: ${prop}`);
    }

    case "text": {
      const p = await getPage();
      return await p.innerText("body");
    }

    case "html": {
      const sel = args[0];
      const p = await getPage();
      return sel
        ? await p.locator(sel).first().innerHTML()
        : await p.content();
    }

    case "scroll": {
      const sel = args[0];
      const p = await getPage();
      if (sel) {
        await p.locator(sel).first().scrollIntoViewIfNeeded();
        return `Scrolled to: ${sel}`;
      } else {
        await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        return "Scrolled to bottom";
      }
    }

    case "snapshot": {
      const p = await getPage();
      if (args.includes("-i")) {
        const items = await p.evaluate(() => {
          const roles = ["button", "link", "textbox", "checkbox", "radio", "combobox", "listbox", "menuitem", "option", "tab", "searchbox"];
          const els = document.querySelectorAll(
            roles.map(r => `[role="${r}"]`).join(",") + ",a,button,input,select,textarea"
          );
          return Array.from(els).map((el, i) => ({
            ref: `@e${i + 1}`,
            role: el.getAttribute("role") ?? el.tagName.toLowerCase(),
            name: (el as HTMLElement).innerText?.trim() || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "",
          }));
        });
        return JSON.stringify(items, null, 2);
      }
      return await (p as any).ariaSnapshot();
    }

    case "click": {
      const p = await getPage();
      await p.locator(args[0]).first().click();
      return `Clicked: ${args[0]}`;
    }

    case "url": {
      const p = await getPage();
      return p.url();
    }

    case "status":
      return "ok";

    case "stop":
      setTimeout(() => process.exit(0), 100);
      return "Daemon stopping";

    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
}

// Write PID file
writeFileSync(PID_FILE, String(process.pid));
console.log(`Browse daemon started (PID ${process.pid}) on port ${PORT}`);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Health check endpoint
    if (url.pathname === "/health" && req.method === "GET") {
      return Response.json({ ok: true, status: "ok", timestamp: Date.now() });
    }

    if (req.method !== "POST") {
      return new Response("POST only", { status: 405 });
    }
    const { cmd, args } = await req.json() as { cmd: string; args: string[] };
    try {
      const output = await handleCommand(cmd, args);
      return Response.json({ ok: true, output });
    } catch (err: any) {
      return Response.json({ ok: false, error: err.message }, { status: 400 });
    }
  },
});
