# Schemas Protocol — JSON Schema for Artifact Validation

## Purpose

JSON Schemas define the **expected structure** of artifacts passed between agents. The execution engine validates agent output against these schemas before allowing the workflow to proceed.

## Directory Convention

Schemas live in `{resolved-squad-root}/{squad-name}/schemas/`. Resolve by checking `./squads/{squad-name}` first, then `~/squads/{squad-name}`:

```
{resolved-squad-root}/contract-review-squad/
├── schemas/
│   ├── clauses.json          # Schema for extracted clauses
│   ├── risk-report.json      # Schema for risk assessment
│   └── summary.json          # Schema for executive summary
```

## Schema Format

Use [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/schema) (or Draft 7 for broader compatibility).

### Minimal Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Extracted Clauses",
  "type": "object",
  "required": ["clauses"],
  "properties": {
    "clauses": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "text", "type"],
        "properties": {
          "id": { "type": "string" },
          "text": { "type": "string", "minLength": 1 },
          "type": { "type": "string", "enum": ["obligation", "right", "condition", "definition", "termination"] }
        }
      }
    }
  }
}
```

### Schema with Rich Validation

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Risk Report",
  "type": "object",
  "required": ["risks", "overall_risk_score", "generated_at"],
  "properties": {
    "risks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["clause_id", "risk_level", "description", "recommendation"],
        "properties": {
          "clause_id": { "type": "string" },
          "risk_level": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
          "description": { "type": "string", "minLength": 10 },
          "recommendation": { "type": "string", "minLength": 10 },
          "affected_parties": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    },
    "overall_risk_score": {
      "type": "number",
      "minimum": 0,
      "maximum": 10
    },
    "generated_at": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

## Creating Schemas (`*create-schema`)

### Protocol

1. **Read the task** that produces the artifact
2. **Extract fields** from `Saida` definition
3. **Generate JSON Schema** matching the field types
4. **Write to** `schemas/{artifact-name}.json`
5. **Update workflow** to reference the schema in `validation.schema`

### Example

Given this task output definition:
```yaml
Saida:
  clauses:
    type: array
    description: "List of extracted contract clauses"
  metadata:
    type: object
    description: "Contract metadata (parties, dates, type)"
```

Generate:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Clause Extraction Output",
  "type": "object",
  "required": ["clauses", "metadata"],
  "properties": {
    "clauses": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "text"],
        "properties": {
          "id": { "type": "string" },
          "text": { "type": "string" }
        }
      }
    },
    "metadata": {
      "type": "object",
      "required": ["parties"],
      "properties": {
        "parties": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

## Validation Execution

The execution engine validates in this order:

### 1. Parse Output as JSON

```bash
node -e 'JSON.parse(process.argv[1]); console.log("VALID JSON")' "$OUTPUT"
```

If output is not JSON, try to extract JSON from markdown code blocks:
```bash
# Look for ```json ... ``` blocks in the output
node -e '
const text = process.argv[1];
const match = text.match(/```json\s*([\s\S]*?)\s*```/);
if (match) { JSON.parse(match[1]); console.log("EXTRACTED"); }
else { console.error("NO JSON FOUND"); process.exit(1); }
'
```

### 2. Schema Validation

**With ajv (if available):**
```bash
node -e '
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const schema = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const data = JSON.parse(process.argv[2]);
const valid = ajv.validate(schema, data);
if (!valid) {
  console.error(JSON.stringify(ajv.errors, null, 2));
  process.exit(1);
}
console.log("SCHEMA VALID");
' "schemas/clauses.json" "$OUTPUT"
```

**Without ajv (structural fallback):**
```bash
node -e '
const schema = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const data = JSON.parse(process.argv[2]);
const errors = [];
// Check required fields
if (schema.required) {
  for (const field of schema.required) {
    if (!(field in data)) errors.push("missing required: " + field);
  }
}
// Check types
if (schema.properties) {
  for (const [key, spec] of Object.entries(schema.properties)) {
    if (key in data) {
      const actual = Array.isArray(data[key]) ? "array" : typeof data[key];
      if (spec.type && actual !== spec.type) errors.push(key + ": expected " + spec.type + " got " + actual);
    }
  }
}
if (errors.length) { console.error(errors.join("\\n")); process.exit(1); }
console.log("STRUCTURAL VALID");
' "schemas/clauses.json" "$OUTPUT"
```

**Python fallback:**
```bash
python3 -c '
import json, sys
with open(sys.argv[1]) as f: schema = json.load(f)
data = json.loads(sys.argv[2])
errors = []
for field in schema.get("required", []):
    if field not in data: errors.append(f"missing: {field}")
if errors:
    print("\\n".join(errors), file=sys.stderr); sys.exit(1)
print("VALID")
' "schemas/clauses.json" "$OUTPUT"
```

### 3. Assertion Evaluation

```bash
node -e '
const output = JSON.parse(process.argv[1]);
const assertion = process.argv[2];
const result = eval(assertion);
if (!result) { console.error("FAIL: " + assertion); process.exit(1); }
console.log("PASS");
' "$OUTPUT" "output.clauses.length > 0"
```

## Schema Versioning

Schemas follow the squad version. When the squad version bumps, schemas can be updated. The `title` field documents what version the schema targets.

## Best Practices

1. **Start minimal** — require only the fields that matter for downstream agents
2. **Use enums** for categorical fields (risk_level, clause_type)
3. **Set minLength/minItems** to catch empty outputs
4. **Don't over-constrain** — the agent needs room to express domain knowledge
5. **Test schemas** against sample data before adding to workflow
6. **One schema per artifact** — don't reuse schemas across different artifact types

## Referencing Schemas in Workflow

```yaml
# In workflow step:
creates:
  artifact: "clauses.json"
  format: json
  schema: "schemas/clauses.json"    # relative to squad root

# In validation gate:
validation:
  schema: "schemas/clauses.json"    # same file
  assertions:
    - "output.clauses.length > 0"   # additional checks beyond schema
```

The schema path is always relative to the squad root directory (`{resolved-squad-root}/{squad-name}/`).
