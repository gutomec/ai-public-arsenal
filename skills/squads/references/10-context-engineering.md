# Context Engineering

## When to load
Intent: any (reference material for context-aware behavior)

## Protocol Reference
SQUAD_PROTOCOL.md Section 11

## Token Budget Numbers

| Parameter | Value | Source |
|-----------|-------|--------|
| Default context window | 200,000 tokens | context.ts |
| 1M context (Sonnet 4, Opus 4.6) | 1,000,000 tokens | context.ts |
| Max output (default) | 32,000 tokens | context.ts |
| Max output (upper) | 64,000 tokens | context.ts |
| Capped default | 8,000 tokens | context.ts |
| Compact max output | 20,000 tokens | context.ts |
| Auto-compact buffer | 13,000 tokens | autoCompact.ts |

## Auto-Compaction Trigger
```
effectiveWindow = min(contextWindow, CLAUDE_CODE_AUTO_COMPACT_WINDOW)
                  - min(maxOutputTokens, 20_000)
```
When estimated tokens exceed effectiveWindow → auto-compact triggers.

## Compaction Services
| Service | Purpose |
|---------|---------|
| autoCompact | Automatic trigger on token threshold |
| compact | Core summarization via forked agent |
| microCompact | Lightweight per-result truncation |

## Agent Handoff Protocol `[PROMPT]`
When switching agents, generate compact handoff artifact:
```yaml
handoff:
  from_agent: "{current}"
  to_agent: "{next}"
  story_context:
    story_id: "{id}"
    story_path: "{path}"
    current_task: "{task}"
    branch: "{branch}"
  decisions: [...]      # max 5
  files_modified: [...]  # max 10
  blockers: [...]        # max 3
  next_action: "{action}"
```

Constraints:
- Max artifact size: 500 tokens
- Max retained summaries: 3 (oldest discarded)
- Target compaction: ~379 tokens
- Savings: 33-57% vs full persona retention

## Skill Context Engineering
This skill uses lazy loading to minimize context usage:
- SKILL.md: ~200 lines (~600 tokens) — always loaded
- References: ~60-120 lines each (~200-400 tokens) — loaded per intent
- SQUAD_PROTOCOL.md: 1146 lines (~4000 tokens) — read by section, NEVER fully
- Target: <2000 tokens per intent

## API Retry Strategy `[HARNESS]`
```
BASE_DELAY = 500ms
MAX_RETRIES = 10
delay(n) = min(500 * 2^(n-1), 32000) + random(0, 0.25 * base)
```
| Attempt | Delay range |
|---------|-------------|
| 1 | 500-625ms |
| 2 | 1,000-1,250ms |
| 3 | 2,000-2,500ms |
| 4 | 4,000-5,000ms |
| 5 | 8,000-10,000ms |
| 6 | 16,000-20,000ms |
| 7+ | 32,000-40,000ms |

## Denial Tracking `[HARNESS]`
Prevents doom loops in permission system:
- maxConsecutive: 3 denials → fall back to user prompting
- maxTotal: 20 denials → fall back to user prompting
