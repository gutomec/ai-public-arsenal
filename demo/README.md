# Squad Flow Tracker — Demo System

Real-time visualization of squad agent pipelines. Watch multi-agent workflows execute step-by-step through an interactive graph rendered in the browser.

## Architecture

```
┌─────────────────┐     SSE stream      ┌──────────────────────┐
│   server.js     │ ──────────────────→  │     index.html       │
│  (Node.js SSE)  │   event: trigger     │  (Dual-Mode Viewer)  │
│                 │   data: {json}       │                      │
│  Reads .jsonl   │                      │  Canvas graph +      │
│  scenarios and  │  GET /scenarios      │  live event log +    │
│  replays with   │ ←──────────────────  │  progress stats      │
│  timing         │                      │                      │
└─────────────────┘                      └──────────────────────┘
        ↑                                         ↑
        │ reads                                   │ or
┌───────┴─────────┐                      ┌────────┴─────────────┐
│   scenarios/    │                      │  Embedded scenario   │
│  *.jsonl files  │                      │  (file:// mode)      │
└─────────────────┘                      └──────────────────────┘
```

## Quick Start

```bash
cd demo
node server.js
# → http://localhost:3001
```

Select a scenario from the dropdown and watch the pipeline execute in real-time.

## Components

### server.js — SSE Replay Server

Zero-dependency Node.js HTTP server that reads JSONL scenario files and replays them as Server-Sent Events with timing derived from original timestamps.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Serve the viewer (`index.html`) |
| `GET` | `/scenarios` | List available scenarios with metadata (JSON) |
| `GET` | `/flow/:name` | SSE replay of a scenario (query: `?speed=N`) |

**Environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | HTTP server port |

**Replay speed control:**

```
/flow/nsc-pipeline?speed=1    # Real-time (~7 min for NSC)
/flow/nsc-pipeline?speed=5    # 5x speed (~1.5 min) — default
/flow/nsc-pipeline?speed=0    # Instant dump (all events at once)
```

Delays between events are computed from the `timestamp` field in each JSONL line, divided by the speed multiplier. Maximum delay is capped at 10 seconds to prevent stalls.

**CORS:** Enabled for all origins (`*`), allowing the viewer to connect from `file://` or any host.

### index.html — Dual-Mode Viewer

A single-file web application (~63 KB) with zero external JS dependencies. Renders an interactive pipeline graph on an HTML5 Canvas with a live event log sidebar.

**Two operating modes:**

| Mode | How to use | Behavior |
|------|-----------|----------|
| **Standalone** | Open `index.html` directly in a browser (`file://`) | Replays an embedded scenario via `setTimeout` |
| **SSE** | Open via `server.js` at `http://localhost:3001` | Connects to the server, fetches `/scenarios`, streams events from `/flow/:name` |

**Visual features:**

- Directed graph layout with agent nodes connected by edges
- Color-coded node states: gray (pending), blue (active), green (complete), red (failed)
- Animated transitions on agent handoffs
- Progress bar and agent counter
- Live event log with timestamps
- Dark theme with amber accent (Outfit + DM Mono fonts)

### scenarios/ — JSONL Scenario Files

Each `.jsonl` file contains one JSON event per line, representing a complete squad execution recording. Events are ordered chronologically with ISO 8601 timestamps.

**Included scenarios:**

| File | Squad | Agents | Tasks | Duration | Description |
|------|-------|--------|-------|----------|-------------|
| `nsc-pipeline.jsonl` | nirvana-squad-creator | 8 | 22 | ~7 min | Full NSC pipeline: analyze, create agents, create tasks, create workflows, optimize, validate, generate README, publish |

## Event Protocol

Events flow as SSE with `event: trigger` and `data: {JSON}`. The full lifecycle:

```
squad-start → flow-preview → [agent-start → task-start → task-end → ... → agent-end → flow-transition]* → flow-complete → squad-end
```

| Event | Key Fields | Description |
|-------|-----------|-------------|
| `squad-start` | `squad`, `prefix`, `version`, `totalAgents` | Pipeline initiated |
| `flow-preview` | `nodes[]`, `edges[]`, `totalAgents` | Graph layout — nodes have `id`, `name`, `order`; edges have `from`, `to` |
| `agent-start` | `agent`, `progress` | Agent begins work (`progress` = "N/total") |
| `task-start` | `agent`, `task` | Individual task/tool operation started |
| `task-end` | `agent`, `task`, `result` | Task completed (`result` = "success" or "failure") |
| `agent-end` | `agent`, `duration` | Agent finished all tasks |
| `flow-transition` | `from`, `to`, `progress`, `handoff` | Handoff between agents (`handoff` = artifact passed) |
| `flow-complete` | `totalDuration`, `agentsExecuted`, `path[]` | Pipeline finished |
| `squad-end` | `totalDuration`, `agentsExecuted`, `tasksExecuted`, `status` | Session closed |

All events include `squad`, `prefix`, and `timestamp` fields.

## Recording Your Own Scenarios

1. Enable triggers in your squad's `squad.yaml`:
   ```yaml
   triggers:
     enabled: true
   ```

2. Run the squad normally — events are written to `.aios/squad-triggers/{squad-name}.jsonl`

3. Copy the JSONL file to `demo/scenarios/`:
   ```bash
   cp .aios/squad-triggers/my-squad.jsonl demo/scenarios/
   ```

4. Sanitize paths and sensitive data before sharing:
   ```bash
   sed -i '' 's|/Users/[^"]*|...|g' demo/scenarios/my-squad.jsonl
   ```

5. Restart the server — the new scenario appears in the dropdown automatically.

## JSONL Format Reference

Each line is a self-contained JSON object. Minimal example for a 2-agent squad:

```jsonl
{"type":"squad-start","squad":"my-squad","prefix":"ms","version":"1.0.0","totalAgents":2,"timestamp":"2026-01-01T10:00:00Z"}
{"type":"flow-preview","squad":"my-squad","prefix":"ms","nodes":[{"id":"planner","name":"planner","order":0},{"id":"executor","name":"executor","order":1}],"edges":[{"from":"planner","to":"executor"}],"totalAgents":2,"timestamp":"2026-01-01T10:00:00Z"}
{"type":"agent-start","squad":"my-squad","prefix":"ms","agent":"planner","progress":"1/2","timestamp":"2026-01-01T10:00:02Z"}
{"type":"task-start","squad":"my-squad","prefix":"ms","agent":"planner","task":"create-plan","timestamp":"2026-01-01T10:00:04Z"}
{"type":"task-end","squad":"my-squad","prefix":"ms","agent":"planner","task":"create-plan","result":"success","timestamp":"2026-01-01T10:00:20Z"}
{"type":"agent-end","squad":"my-squad","prefix":"ms","agent":"planner","duration":"18s","timestamp":"2026-01-01T10:00:22Z"}
{"type":"flow-transition","squad":"my-squad","prefix":"ms","from":"planner","to":"executor","progress":"1/2","handoff":"plan.md","timestamp":"2026-01-01T10:00:24Z"}
{"type":"agent-start","squad":"my-squad","prefix":"ms","agent":"executor","progress":"2/2","timestamp":"2026-01-01T10:00:26Z"}
{"type":"task-start","squad":"my-squad","prefix":"ms","agent":"executor","task":"implement","timestamp":"2026-01-01T10:00:28Z"}
{"type":"task-end","squad":"my-squad","prefix":"ms","agent":"executor","task":"implement","result":"success","timestamp":"2026-01-01T10:00:50Z"}
{"type":"agent-end","squad":"my-squad","prefix":"ms","agent":"executor","duration":"24s","timestamp":"2026-01-01T10:00:52Z"}
{"type":"flow-complete","squad":"my-squad","prefix":"ms","totalDuration":"52s","agentsExecuted":2,"totalAgents":2,"path":["planner","executor"],"timestamp":"2026-01-01T10:00:54Z"}
{"type":"squad-end","squad":"my-squad","prefix":"ms","status":"success","totalDuration":"52s","agentsExecuted":2,"tasksExecuted":2,"timestamp":"2026-01-01T10:00:56Z"}
```

## Requirements

- Node.js 18+
- Zero npm dependencies (uses only `http`, `fs`, `path` built-in modules)
- Modern browser with Canvas and EventSource support
