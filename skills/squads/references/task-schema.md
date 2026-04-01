# Task Schema — v2 Definition Reference

Task files live in `{resolved-squad-root}/{squad}/tasks/{prefix}-{role}-{verb}-{noun}.md` and use YAML frontmatter + markdown body. Resolve by checking `./squads/{squad}` first, then `~/squads/{squad}`.

## YAML Frontmatter

```yaml
---
task: "{functionName}()"         # Callable function name
responsavel: "{prefix}-{role}"   # Agent responsible for execution
atomic_layer: Organism           # Atom | Molecule | Organism | Template | Page

Entrada:                         # Inputs
  param1:
    type: string
    required: true
    description: "{what this input is}"
  param2:
    type: object
    required: false
    description: "{optional input}"

Saida:                           # Outputs
  result:
    type: string
    description: "{what this produces}"
  artifacts:
    type: array
    description: "{files or data created}"
  # v2: Structured output with template
  report:
    type: object
    schema: "schemas/{artifact}.json"       # NEW v2: JSON Schema for validation
    template: "templates/{output}.md"       # NEW v2: Output template to fill
    fields:                                 # NEW v2: Expected fields
      - risk_score: number
      - top_risks: array
      - recommendation: string

Checklist:
  pre:                           # Pre-conditions (must be true before execution)
    - "{condition 1}"
    - "{condition 2}"
  post:                          # Post-conditions (must be true after execution)
    - "{condition 1}"
    - "{condition 2}"
  # v2: Machine-verifiable conditions
  verify:                        # NEW v2: Programmatic post-conditions
    schema: "schemas/{artifact}.json"      # Validate output against schema
    assertions:                             # JavaScript assertions
      - "output.items.length > 0"
      - "output.score >= 0"

Performance:
  duration: "{estimated time}"
  cost: "{resource cost}"
  cacheable: false
  parallelizable: false

Error Handling:
  strategy: retry                # retry | fallback | abort
  retry:
    max_attempts: 3
    delay: "1s"
  fallback: "{fallback action}"

Metadata:
  version: "1.0.0"
  dependencies:
    - "{other-task}"
---
```

## v2 Additions

### `Saida.schema` — Output Schema Reference

Points to a JSON Schema file that defines the expected output structure:

```yaml
Saida:
  clauses:
    type: array
    schema: "schemas/clauses.json"
    description: "Extracted clauses matching the schema"
```

When present, the execution engine validates the agent's output against this schema after dispatch.

### `Saida.template` — Output Template

Points to a template file that the execution engine fills with agent data:

```yaml
Saida:
  report:
    type: object
    template: "templates/executive-summary.md"
    fields:
      - risk_score: number
      - top_risks: array
      - recommendation: string
      - overall_assessment: string
```

**How it works:**
1. Agent generates structured data (JSON) with the declared fields
2. Execution engine reads the template file
3. Engine replaces `{{field_name}}` placeholders with agent data
4. Final output is the filled template

**Template syntax:**
```markdown
# Executive Summary

**Overall Risk Score:** {{risk_score}}/10

## Top Risks

{{#each top_risks}}
### {{this.title}}
- **Severity:** {{this.severity}}
- **Description:** {{this.description}}
- **Recommendation:** {{this.recommendation}}
{{/each}}

## Overall Assessment

{{overall_assessment}}
```

**Fallback:** If agent output isn't valid JSON or is missing required fields, the execution engine logs a warning and uses the raw output (graceful degradation, not failure).

### `Checklist.verify` — Machine-Verifiable Conditions

While `Checklist.pre` and `Checklist.post` are text conditions for the LLM to read (v1 behavior), `Checklist.verify` contains conditions the execution engine checks programmatically:

```yaml
Checklist:
  pre:
    - "Contract document is uploaded and readable"
    - "Language is identified"
  post:
    - "All clauses extracted with parties and dates"
    - "No clause left unclassified"
  verify:                        # NEW: code checks these
    schema: "schemas/clauses.json"
    assertions:
      - "output.clauses.length > 0"
      - "output.clauses.every(c => c.type !== 'unknown')"
```

`Checklist.pre`/`post` = guidance for the agent (text).
`Checklist.verify` = gate for the engine (code).

## Markdown Body

After the frontmatter, include:

1. **Description** — what this task does
2. **Pipeline Diagram** — visual flow (optional)
3. **Output Format** — expected JSON structure (v2: should match schema)
4. **Examples** — usage examples

### Output Format Section (v2 recommended)

```markdown
## Output Format

The agent MUST return valid JSON matching `schemas/clauses.json`:

\`\`\`json
{
  "clauses": [
    {
      "id": "C001",
      "text": "The Buyer shall pay...",
      "type": "obligation",
      "parties": ["Buyer"],
      "dates": ["2026-06-30"]
    }
  ],
  "metadata": {
    "total_clauses": 12,
    "language": "en"
  }
}
\`\`\`

The execution engine validates this output before passing to the next agent.
```

## Complete v2 Example

```yaml
---
task: "extractClauses()"
responsavel: "crs-clause-extractor"
atomic_layer: Organism

Entrada:
  contract:
    type: string
    required: true
    description: "Full contract text or file path"
  language:
    type: string
    required: false
    description: "Contract language (auto-detected if omitted)"

Saida:
  clauses:
    type: array
    schema: "schemas/clauses.json"
    description: "Extracted and classified clauses"
  metadata:
    type: object
    description: "Contract metadata (parties, dates, type)"

Checklist:
  pre:
    - "Contract document is readable"
    - "Document appears to be a legal contract"
  post:
    - "Every clause has an ID, text, and type"
    - "Parties are identified in metadata"
  verify:
    schema: "schemas/clauses.json"
    assertions:
      - "output.clauses.length > 0"
      - "output.clauses.every(c => c.id && c.text && c.type)"
      - "output.metadata.parties && output.metadata.parties.length > 0"

Performance:
  duration: "1-3 minutes"
  cost: medium
  cacheable: true
  parallelizable: false

Error Handling:
  strategy: retry
  retry:
    max_attempts: 3
    delay: "2s"
  fallback: "Return raw text segmented by paragraph as uncategorized clauses"

Metadata:
  version: "2.0.0"
  dependencies: []
---

# Extract Clauses

Reads a contract document and extracts all clauses with classification, party identification, and date extraction.

## Pipeline

\`\`\`
Contract Text → [Parse] → [Identify Clauses] → [Classify] → [Extract Parties/Dates] → Structured Clauses JSON
\`\`\`

## Output Format

Returns JSON matching `schemas/clauses.json`:

\`\`\`json
{
  "clauses": [
    {
      "id": "C001",
      "text": "The Buyer shall pay the Purchase Price within 30 days of closing.",
      "type": "obligation",
      "parties": ["Buyer"],
      "dates": ["30 days of closing"],
      "risk_indicators": ["payment_timeline"]
    }
  ],
  "metadata": {
    "total_clauses": 15,
    "parties": ["Buyer", "Seller"],
    "contract_type": "purchase_agreement",
    "language": "en",
    "extracted_at": "2026-03-24T16:00:00Z"
  }
}
\`\`\`
```

## v1-Compatible Example (no v2 features)

```yaml
---
task: "planWork()"
responsavel: "ms-leader"
atomic_layer: Organism

Entrada:
  requirements:
    type: string
    required: true
    description: "Work requirements to plan"

Saida:
  plan:
    type: object
    description: "Execution plan with task assignments"

Checklist:
  pre:
    - "Requirements are clear and complete"
  post:
    - "Plan covers all requirements"
    - "Each task assigned to an agent"

Performance:
  duration: "1-3 minutes"
  cost: low

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2

Metadata:
  version: "1.0.0"
  dependencies: []
---

# Plan Work

Creates an execution plan from requirements.
```

This v1 task works without changes in the v2 execution engine.

## Naming Convention

Format: `{prefix}-{agent-role}-{verb}-{noun}.md`

| Part | Rule | Example |
|---|---|---|
| prefix | Squad's slashPrefix | `bc`, `ms`, `crs` |
| agent-role | Agent role (without prefix) | `clause-extractor`, `leader` |
| verb | Action verb | `extract`, `analyze`, `validate`, `write` |
| noun | Target noun | `clauses`, `report`, `plan`, `summary` |
