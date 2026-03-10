#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Squad Flow Tracker — Demo SSE Replay Server
// Zero-dependency Node.js server that replays JSONL scenarios via SSE.
//
// Usage:
//   node server.js                    # default: port 3001
//   PORT=8080 node server.js          # custom port
//
// Endpoints:
//   GET /              — Serve index.html
//   GET /scenarios     — List available scenarios
//   GET /flow/:name    — SSE replay (?speed=1 real-time, ?speed=5 fast, ?speed=0 instant)
// ─────────────────────────────────────────────────────────────────────────────

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3001;
const SCENARIOS_DIR = path.join(__dirname, 'scenarios');
const HTML_FILE = path.join(__dirname, 'index.html');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
}

function sendJson(res, code, data) {
  setCors(res);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function readScenario(name) {
  const filePath = path.join(SCENARIOS_DIR, `${name}.jsonl`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

// ─── Route: GET / ────────────────────────────────────────────────────────────

function handleIndex(req, res) {
  fs.readFile(HTML_FILE, (err, data) => {
    if (err) return sendJson(res, 500, { error: 'Could not read index.html' });
    setCors(res);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

// ─── Route: GET /scenarios ───────────────────────────────────────────────────

function handleScenarios(req, res) {
  let scenarios = [];
  try {
    scenarios = fs.readdirSync(SCENARIOS_DIR)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => {
        const name = f.replace('.jsonl', '');
        const events = readScenario(name);
        const start = events && events[0];
        return {
          name,
          squad: start?.squad || name,
          totalAgents: start?.totalAgents || 0,
          events: events ? events.length : 0,
        };
      });
  } catch {}
  sendJson(res, 200, { scenarios });
}

// ─── Route: GET /flow/:name — SSE replay ────────────────────────────────────

function handleFlowSSE(req, res, scenarioName) {
  const events = readScenario(scenarioName);
  if (!events || events.length === 0) {
    return sendJson(res, 404, { error: `Scenario "${scenarioName}" not found` });
  }

  // Parse speed from query: 0=instant, 1=real-time, 5=5x (default)
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const speed = parseFloat(url.searchParams.get('speed') ?? '5');

  setCors(res);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send connected event
  res.write(`event: connected\ndata: ${JSON.stringify({
    scenario: scenarioName,
    totalEvents: events.length,
    speed,
    timestamp: new Date().toISOString(),
  })}\n\n`);

  let closed = false;
  req.on('close', () => { closed = true; });

  // Compute delays from timestamps
  const timestamps = events.map(e => e.timestamp ? new Date(e.timestamp).getTime() : 0);

  if (speed === 0) {
    // Instant dump — send all events immediately
    events.forEach(event => {
      if (closed) return;
      res.write(`event: trigger\ndata: ${JSON.stringify(event)}\n\n`);
    });
    if (!closed) res.end();
    return;
  }

  // Replay with timing
  let index = 0;

  function emitNext() {
    if (closed || index >= events.length) {
      if (!closed) res.end();
      return;
    }

    const event = events[index];
    res.write(`event: trigger\ndata: ${JSON.stringify(event)}\n\n`);
    index++;

    if (index < events.length) {
      const currentTs = timestamps[index - 1];
      const nextTs = timestamps[index];
      const delta = (nextTs && currentTs) ? Math.max(0, nextTs - currentTs) : 500;
      const delay = speed > 0 ? Math.round(delta / speed) : 0;
      setTimeout(emitNext, Math.min(delay, 10000)); // cap at 10s max delay
    } else {
      if (!closed) res.end();
    }
  }

  emitNext();
}

// ─── Router ──────────────────────────────────────────────────────────────────

function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    setCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (pathname === '/' || pathname === '/index.html') {
    return handleIndex(req, res);
  }

  if (pathname === '/scenarios') {
    return handleScenarios(req, res);
  }

  const flowMatch = pathname.match(/^\/flow\/([a-zA-Z0-9_-]+)$/);
  if (flowMatch) {
    return handleFlowSSE(req, res, flowMatch[1]);
  }

  sendJson(res, 404, { error: `No route: ${pathname}` });
}

// ─── Start ───────────────────────────────────────────────────────────────────

const server = http.createServer(router);

server.listen(PORT, () => {
  const scenarios = fs.readdirSync(SCENARIOS_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => f.replace('.jsonl', ''));

  console.log(`
\x1b[33m╔══════════════════════════════════════════════════╗
║  Squad Flow Tracker — Demo Server                ║
║                                                  ║
║  Dashboard:  http://localhost:${String(PORT).padEnd(5)}              ║
║  Scenarios:  ${String(scenarios.length).padEnd(36)}║
║  ${scenarios.map(s => '• ' + s).join(', ').padEnd(48)}║
╚══════════════════════════════════════════════════╝\x1b[0m
`);
});

process.on('SIGINT', () => {
  console.log('\n[server] Goodbye.');
  server.close(() => process.exit(0));
});
