# Installation Guide — GitHub is the Single Source of Truth

This repository uses **GitHub as the single source of truth** for all code, skills, and squads. All distribution happens through npm, but npm always pulls from GitHub (never from a separate npm registry source).

## Quick Start

### For Skills (Recommended)
```bash
# Install squads skill via Claude Code skills CLI
npx skills add @gutomec/ai-public-arsenal@squads

# Or from GitHub directly
npx skills add gutomec/ai-public-arsenal@squads
```

### For Node.js Projects
```bash
# Install from GitHub (always latest)
npm install github:gutomec/ai-public-arsenal

# Or via npm registry (synced from GitHub)
npm install @gutomec/ai-public-arsenal
```

### For Specific Skills
```bash
# Clone and use specific skill directory
git clone https://github.com/gutomec/ai-public-arsenal.git
cd ai-public-arsenal/skills/squads
```

## GitHub as Single Source of Truth

### Why This Approach?

1. **No Duplication** — GitHub is the only location with the authoritative code
2. **Always Latest** — npm always resolves to the latest GitHub commit
3. **Single Sync Point** — Updates happen once on GitHub, automatically available everywhere
4. **Version Control** — Git history is the source of truth for all versions
5. **No Registry Lock-in** — Not dependent on npm registry availability

### How It Works

```
Your Project
    ↓
npm install @gutomec/ai-public-arsenal
    ↓
npm resolves to GitHub
    ↓
GitHub: gutomec/ai-public-arsenal
    ↓
Latest code, skills, squads
```

### Installation Methods (All Point to GitHub)

| Method | Command | Always Latest? |
|--------|---------|---|
| **Skills CLI** (recommended) | `npx skills add @gutomec/ai-public-arsenal@squads` | ✅ Yes |
| **GitHub Direct** | `npm install github:gutomec/ai-public-arsenal` | ✅ Yes |
| **npm Registry** | `npm install @gutomec/ai-public-arsenal` | ✅ Yes (synced) |
| **Git Clone** | `git clone https://github.com/gutomec/ai-public-arsenal.git` | ✅ Yes |

## Versioning

- **GitHub releases** are the source of truth
- **npm version** always matches latest GitHub version
- **Semantic versioning** follows git tags: `v3.0.0`
- **Latest** is always the main branch

## Updating

All updates happen automatically:

1. Changes pushed to GitHub main branch
2. Package version bumped in `package.json`
3. Git tag created (`v3.0.0`)
4. Published to npm (mirrors GitHub)
5. All installation methods pull the update

No manual sync needed — GitHub is the only point where changes happen.

## Directory Structure

```
github.com/gutomec/ai-public-arsenal
├── skills/
│   └── squads/                 ← Install this via `npx skills add`
│       ├── SKILL.md            ← Main skill definition
│       └── references/         ← Protocols and schemas
├── squads/
│   └── nirvana-squad-creator/  ← Example squad
├── package.json                ← npm metadata (points to GitHub)
└── README.md                   ← This documentation
```

## Verification

To verify you're getting the latest version:

```bash
# Check what was installed
npm list @gutomec/ai-public-arsenal

# Check the GitHub URL it resolved to
npm view @gutomec/ai-public-arsenal repository.url

# Expected output:
# git+https://github.com/gutomec/ai-public-arsenal.git
```

## Contributing

1. Clone from GitHub
2. Make changes locally
3. Test
4. Push to GitHub
5. Create a release/tag on GitHub
6. npm automatically syncs (no manual publish needed)

## Support

- **Issues:** [GitHub Issues](https://github.com/gutomec/ai-public-arsenal/issues)
- **Discussions:** [GitHub Discussions](https://github.com/gutomec/ai-public-arsenal/discussions)
- **Repository:** [github.com/gutomec/ai-public-arsenal](https://github.com/gutomec/ai-public-arsenal)

---

**Remember:** GitHub is your single source of truth. All installation methods, including npm, always pull from GitHub.
