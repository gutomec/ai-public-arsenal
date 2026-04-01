# Agent Schema — v2 Definition Reference

Agent files live in `{resolved-squad-root}/{squad}/agents/{prefix}-{role}.md` and use YAML frontmatter + markdown body. Resolve by checking `./squads/{squad}` first, then `~/squads/{squad}`.

## YAML Frontmatter

```yaml
---
agent:
  name: "{Display Name}"
  id: "{prefix}-{role}"          # Must start with squad prefix
  title: "{Agent Title}"
  icon: "{emoji}"
  whenToUse: "Use this agent when..."

  # v2: Model routing
  model: "gemini-3-flash"     # NEW v2: Preferred model for this agent
  model_config:                  # NEW v2: Model configuration
    temperature: 0.1             # Lower = more deterministic
    max_tokens: 4096             # Max output tokens

  # v2: Context budget
  context:                       # NEW v2: Context management
    budget: 8000                 # Max tokens of input context
    strategy: summarize          # full | summarize | reference
    include:                     # What to include in context
      - "previous_output: summary"
      - "schemas/*"
    exclude:                     # What to exclude from context
      - "raw_data/*"
      - "*.log"

persona_profile:
  archetype: "{archetype}"
  communication: "{style}"

greeting_levels:
  minimal: "{one-line greeting}"
  named: "Hello {user}, {greeting}"
  archetypal: "{full persona greeting}"

persona:
  role: "{role description}"
  style: "{communication style}"
  identity: "{character traits}"
  focus: "{primary focus area}"
  core_principles:
    - "{principle 1}"
    - "{principle 2}"
    - "{principle 3}"

commands:
  - name: "*{command-name}"
    visibility: public           # public | internal
    description: "{what it does}"
    args:
      - name: "{arg}"
        required: true
        description: "{arg description}"

dependencies:
  tasks:
    - "{prefix}-{role}-{verb}-{noun}.md"
  scripts: []
  templates: []
  checklists: []
---
```

## v2 Additions

### `agent.model` — Preferred Model

Declares which LLM model this agent should use:

```yaml
agent:
  model: "gemini-3-flash"     # Cheap, fast — good for extraction tasks
```

| Use case | Recommended model | Pricing (in/out per 1M) |
|---|---|---|
| Orchestration, planning, deep reasoning | `claude-sonnet-4.6`, `claude-opus-4.6` | $3/$15, $5/$25 |
| Orchestration (budget) | `gemini-3.1-pro` | $2/$12 |
| Extraction, transformation, workers | `gemini-3-flash`, `gpt-5-mini` | $0.50/$3, $0.25/$2 |
| Review, quality control | `claude-sonnet-4.6`, `gemini-3.1-pro` | $3/$15, $2/$12 |
| Simple formatting, classification | `gemini-3.1-flash-lite`, `gpt-5-nano` | $0.25/$1.50, $0.05/$0.40 |
| Budget frontier (open-weight) | `deepseek-v3.2`, `kimi-k2.5` | $0.28/$0.42, free |

**Resolution order:** `agent.model` > `workflow.model_strategy` > platform default.

**Note:** Model routing is advisory. The Squad Manager communicates preference in the dispatch prompt. The actual model depends on what the host platform supports.

### `agent.model_config` — Model Parameters

```yaml
agent:
  model_config:
    temperature: 0.1      # 0.0-2.0 — lower = more deterministic
    max_tokens: 4096       # Max output length
```

Use low temperature for extraction/structured output tasks. Use higher for creative tasks.

### `agent.context` — Context Budget

Controls how much context the agent receives and how it's compressed:

```yaml
agent:
  context:
    budget: 8000               # Max tokens of context to receive
    strategy: summarize        # How to handle context over budget
    include:                   # Explicit includes
      - "previous_output: summary"
      - "schemas/*"
      - "templates/*"
    exclude:                   # Explicit excludes
      - "raw_data/*"
      - "*.log"
      - "previous_output: raw"
```

#### Strategy values

| Strategy | Behavior | When to use |
|---|---|---|
| `full` | Pass everything as-is (v1 default) | Small inputs, simple workflows |
| `summarize` | Auto-summarize large artifacts | Medium inputs, agent only needs key points |
| `reference` | Save to file, pass only path | Large inputs, agent can read files itself |

#### Include/exclude syntax

- `"previous_output: full"` — Include full previous output
- `"previous_output: summary"` — Include summary of previous output
- `"previous_output: structured"` — Include structured data only
- `"schemas/*"` — Include all schema files
- `"templates/*"` — Include all template files
- `"raw_data/*"` — Exclude raw data directory

#### Budget enforcement

1. Collect all required context (from `requires` + `include`)
2. Remove excluded items
3. Apply strategy to remaining items
4. Estimate token count
5. If over budget: further truncate/summarize until under budget
6. Pass final context to dispatch

## Markdown Body

After the frontmatter, include:

1. **Quick Commands** — table of available commands
2. **Output Format** — expected output structure (v2: should match schema)
3. **Collaboration** — receives from / hands off to
4. **Anti-patterns** — what this agent should never do

### Output Format Section (v2 recommended)

```markdown
## Output Format

This agent MUST return valid JSON when used in a validated workflow:

\`\`\`json
{
  "clauses": [...],
  "metadata": { ... }
}
\`\`\`

See `schemas/clauses.json` for the complete schema.
```

### Collaboration Section

```markdown
## Collaboration

### Receives From
- `{prefix}-{other-agent}`: {what it receives}

### Hands Off To
- `{prefix}-{other-agent}`: {what it produces}

### Shared Artifacts
- `{artifact}`: {description}
```

## Complete v2 Example

```yaml
---
agent:
  name: "Clause Extractor"
  id: "crs-clause-extractor"
  title: "Contract Clause Extraction Specialist"
  icon: "📋"
  whenToUse: "Use when extracting and classifying clauses from legal contracts"

  model: "gemini-3-flash"
  model_config:
    temperature: 0.1
    max_tokens: 8192

  context:
    budget: 12000
    strategy: full
    include:
      - "schemas/clauses.json"
    exclude:
      - "*.log"

persona_profile:
  archetype: "The Analyst"
  communication: "Precise and structured"

persona:
  role: "Extracts, classifies, and structures contract clauses"
  style: "Methodical, thorough, detail-oriented"
  focus: "Clause identification and classification accuracy"
  core_principles:
    - "Every clause must be captured — no omissions"
    - "Classification must use defined categories only"
    - "Output must be valid JSON matching the schema"

commands:
  - name: "*extract-clauses"
    visibility: public
    description: "Extract all clauses from a contract document"
    args:
      - name: "contract"
        required: true
        description: "Path to contract file or raw text"

dependencies:
  tasks:
    - "crs-clause-extractor-extract-clauses.md"
  schemas:
    - "schemas/clauses.json"
---

# Clause Extractor

## Quick Commands

| Command | Description |
|---|---|
| `*extract-clauses` | Extract all clauses from a contract |

## Output Format

Returns JSON matching `schemas/clauses.json`:

\`\`\`json
{
  "clauses": [
    {
      "id": "C001",
      "text": "...",
      "type": "obligation",
      "parties": ["Buyer"],
      "dates": ["30 days"]
    }
  ],
  "metadata": {
    "total_clauses": 15,
    "parties": ["Buyer", "Seller"]
  }
}
\`\`\`

## Collaboration

### Receives From
- Input: Raw contract document

### Hands Off To
- `crs-risk-flagger`: Structured clauses JSON
- `crs-summary-writer`: Clauses + metadata

## Anti-patterns
- Never skip clauses to reduce output length
- Never invent clauses not present in the contract
- Never output free-form text — always return JSON matching the schema
- Never classify a clause as "unknown" without attempting classification first
```

## v1-Compatible Example

```yaml
---
agent:
  name: "Squad Leader"
  id: "ms-leader"
  title: "Team Orchestrator"
  icon: "🎯"
  whenToUse: "Use when coordinating squad work"

persona:
  role: "Orchestrates squad agents and manages workflows"
  style: "Structured and directive"
  focus: "Task coordination and quality"
  core_principles:
    - "Clear delegation"
    - "Quality gates at every step"

commands:
  - name: "*plan"
    visibility: public
    description: "Create execution plan"

dependencies:
  tasks:
    - "ms-leader-plan-work.md"
---

# Squad Leader

## Quick Commands

| Command | Description |
|---|---|
| `*plan` | Create execution plan |

## Collaboration

### Hands Off To
- `ms-worker`: Delegated tasks

## Anti-patterns
- Never execute tasks directly — always delegate
```

This v1 agent works without changes in v2.
