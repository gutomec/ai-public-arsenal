# Dependency Management Protocol

## Supported Types

| Type | Manager | Lock File | Install Location | Status |
|------|---------|-----------|-----------------|--------|
| `node` | pnpm | `pnpm-lock.yaml` | `node_modules/` | Active |
| `python` | uv | `uv.lock` | `.venv/` | Active |
| `system` | — | — | OS-level | Docs only |
| `squads` | — | `squad-lock.json` | `squads/` | Active |
| `mcp-tools` | — | — | MCP config | Docs only |
| `go` | go modules | `go.sum` | `vendor/` | Reserved |
| `rust` | cargo | `Cargo.lock` | `target/` | Reserved |

## Node.js Protocol (pnpm)

### Generated `package.json`

```json
{
  "name": "{squad-name}-deps",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "puppeteer": "^23.0.0"
  }
}
```

### Install

```bash
cd squads/{squad-name}
pnpm install
```

### Lock Strategy

- `pnpm-lock.yaml` is **committed** — it is the source of truth
- Content-addressable store enables 3-5x faster installs vs npm
- Strict isolation prevents phantom dependencies

## Python Protocol (uv)

### Generated `pyproject.toml`

```toml
[project]
name = "{squad-name}-deps"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
    "requests>=2.31.0",
]
```

### Install

```bash
cd squads/{squad-name}
uv venv
uv sync
```

### Lock Strategy

- `uv.lock` is **committed** — it is the source of truth
- uv replaces pip, poetry, pyenv, and virtualenv
- 10-100x faster than pip

## System Dependencies

System deps are **documentation only** — no auto-install. Declare them so users know prerequisites:

```yaml
dependencies:
  system:
    - "ffmpeg>=6.0"
    - "imagemagick>=7.0"
```

The squad's `README.md` MUST list system deps with install instructions per OS.

## Squad-to-Squad Dependencies

Squads can depend on other squads. Resolution uses Glob to verify existence:

```bash
Glob squads/{dep-name}/squad.yaml
```

### `squad-lock.json` Format

```json
{
  "lockVersion": 1,
  "squads": {
    "brandcraft": {
      "version": "1.0.0",
      "resolved": "squads/brandcraft/squad.yaml"
    }
  }
}
```

## MCP Tools Dependencies

MCP tools are declared in `squad.yaml` under `mcpTools` (existing field). The dependency section cross-references:

```yaml
dependencies:
  mcp-tools:
    - "puppeteer"
    - "filesystem"
```

Verify via MCP server availability — no install action.

## Extensibility: Go & Rust (Reserved)

### Adding Go Support

```yaml
dependencies:
  go:
    - "github.com/chromedp/chromedp@v0.9.0"
```

Install: `cd squads/{name} && go mod download`
Lock: `go.sum` committed.

### Adding Rust Support

```yaml
dependencies:
  rust:
    - "serde@1.0"
```

Install: `cd squads/{name} && cargo fetch`
Lock: `Cargo.lock` committed.

## Lazy Installation Model

Dependencies are **NEVER** installed automatically. Installation happens only when the user explicitly runs `*install-squad-deps {name}`.

Rationale:
- Squads may be inspected without needing deps
- Large dep trees (puppeteer ~400MB) should not surprise users
- Keeps `*create-squad` fast

## Install Protocol (`*install-squad-deps`)

```
1. Read squads/{name}/squad.yaml
2. Parse dependencies section
3. For each type with entries:
   │
   ├─ node:
   │  ├─ Generate/update package.json from dep list
   │  ├─ Run: cd squads/{name} && pnpm install
   │  └─ Verify: node_modules/ exists and pnpm-lock.yaml created
   │
   ├─ python:
   │  ├─ Generate/update pyproject.toml from dep list
   │  ├─ Run: cd squads/{name} && uv venv && uv sync
   │  └─ Verify: .venv/ exists and uv.lock created
   │
   ├─ squads:
   │  ├─ For each dep: Glob squads/{dep}/squad.yaml
   │  ├─ If missing: WARN — dependency squad not found
   │  └─ Generate squad-lock.json
   │
   ├─ system:
   │  └─ WARN: "System deps require manual install — see README.md"
   │
   └─ mcp-tools:
      └─ INFO: "Verify MCP tools are configured in your MCP settings"
4. Report summary: installed / warned / skipped per type
```

## Check Protocol (`*check-squad-deps`)

Checks dependency status **without installing anything**:

```
1. Read squads/{name}/squad.yaml
2. Parse dependencies section
3. For each type:
   │
   ├─ node:
   │  ├─ Check: node_modules/ exists?
   │  ├─ Check: package.json exists?
   │  └─ Check: pnpm-lock.yaml exists?
   │
   ├─ python:
   │  ├─ Check: .venv/ exists?
   │  ├─ Check: pyproject.toml exists?
   │  └─ Check: uv.lock exists?
   │
   ├─ squads:
   │  └─ Check: each referenced squad exists?
   │
   └─ system/mcp-tools:
      └─ List declared deps (info only)
4. Report: ✅ installed | ⚠ declared but not installed | — not declared
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `pnpm: command not found` | pnpm not installed | `npm install -g pnpm` |
| `uv: command not found` | uv not installed | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Lock file missing | Deps declared but never installed | Run `*install-squad-deps {name}` |
| Version mismatch | Lock file outdated | Delete lock file and reinstall |
| Squad dep not found | Referenced squad missing | Create or install the dependency squad first |
| `node_modules/` in git | `.gitignore` not configured | Add `squads/**/node_modules/` to `.gitignore` |
Resolve squad paths by checking `./squads/{name}` first, then `~/squads/{name}`. For dependency discovery across squads, inspect both roots and prefer `./squads/{name}` when names collide.
