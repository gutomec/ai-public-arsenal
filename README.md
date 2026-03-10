# AI Public Arsenal

Open-source skills, squads, and agents for AI coding assistants — installable via [skills.sh](https://skills.sh).

> Works with **Claude Code** · **Codex** · **Cursor** · **Gemini CLI** · **Antigravity** · **Windsurf** · **OpenCode**

## Quick Start

```bash
# Install the squads skill
npx skills add gutomec/ai-public-arsenal@squads
```

## Skills

Skills are AI agent instructions installed via `npx skills add`. They live in `skills/` and follow the [Agent Skills Spec](https://agentskills.io/specification).

| Skill | What it does |
|---|---|
| **[squads](skills/squads/)** | Creates, inspects, validates, and manages multi-agent squads — scaffolds agents, tasks, workflows, and config |

## Squads

Squads are self-contained multi-agent teams managed by the `squads` skill. They are **not** installed via skills.sh — they are directories with agents, tasks, and workflows.

| Squad | Agents | Description |
|---|---|---|
| **[nirvana-squad-creator](squads/nirvana-squad-creator/)** | 9 | Meta-squad that generates new squads from requirements |
| **[ultimate-landingpage](squads/ultimate-landingpage/)** | 9 | Full landing page pipeline — research, copy, design, build, review |

## Demo

Live demo of the Squad Flow Tracker — visualizes squad execution in real-time with SSE events.

**[View Demo](https://gutomec.github.io/squads/)** · [Source](demo/)

```bash
# Run locally
cd demo && node server.js
# Open http://localhost:3001
```

## Structure

```
ai-public-arsenal/
├── skills/           # Installable via skills.sh
│   └── squads/       # Squad manager skill (SKILL.md + references/)
├── squads/           # Squad definitions (managed by the squads skill)
│   ├── nirvana-squad-creator/
│   └── ultimate-landingpage/
└── demo/             # Flow Tracker demo (SSE + embedded replay)
```

## License

MIT
