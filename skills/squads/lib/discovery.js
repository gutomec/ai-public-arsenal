/**
 * Squad Discovery Engine — Bulletproof Implementation
 *
 * PRIMARY METHOD: Bash find (handles tilde expansion natively)
 * FALLBACK: Directory traversal (Node.js fs)
 *
 * Problem solved: Glob tool cannot expand ~ before pattern matching
 * Solution: Use Bash find for discovery instead of Glob
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

class SquadDiscovery {
  /**
   * Discover all squads from both ./squads/ and ~/squads/
   * Returns array of SquadInfo objects, deduplicated (local > home)
   */
  static discoverAllSquads() {
    try {
      const localSquads = this.discoverLocation('./squads', 'local');
      const homeSquads = this.discoverLocation('~/squads', 'home');
      return this.mergeAndDeduplicate(localSquads, homeSquads);
    } catch (error) {
      console.error(`[ERROR] Discovery failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Discover squads in a single location
   */
  static discoverLocation(location, locationType) {
    const expandedPath = this.expandPath(location);

    // Quick check: directory exists and is readable
    if (!this.dirExists(expandedPath)) {
      return [];
    }

    if (!this.isReadable(expandedPath)) {
      console.warn(`[WARN] Directory not readable: ${expandedPath}`);
      return [];
    }

    try {
      // PRIMARY METHOD: Bash find (bulletproof)
      return this.discoverViaBashFind(expandedPath, locationType);
    } catch (error) {
      console.warn(`[WARN] Bash find failed, falling back to traversal: ${error.message}`);
      // FALLBACK: Directory traversal
      return this.discoverViaTraversal(expandedPath, locationType);
    }
  }

  /**
   * PRIMARY DISCOVERY: Bash find
   * Why: Handles tilde expansion, fast, reliable
   */
  static discoverViaBashFind(dir, locationType) {
    // Command: find DIR -maxdepth 2 -name squad.yaml -type f
    // Why -maxdepth 2: squad.yaml is always at {dir}/{squad-name}/squad.yaml
    const cmd = `find "${dir}" -maxdepth 2 -name "squad.yaml" -type f 2>/dev/null`;

    let output;
    try {
      output = execSync(cmd, { encoding: 'utf-8' });
    } catch (error) {
      throw new Error(`Bash find failed: ${error.message}`);
    }

    const paths = output
      .trim()
      .split('\n')
      .filter(line => line.length > 0);

    const squads = [];
    for (const squadPath of paths) {
      try {
        const info = this.loadSquadInfo(squadPath, locationType);
        squads.push(info);
      } catch (err) {
        // Log but continue — don't fail entire discovery on one bad squad
        console.warn(`[WARN] Failed to parse ${squadPath}: ${err.message}`);
      }
    }

    return squads;
  }

  /**
   * FALLBACK DISCOVERY: Directory traversal
   * Used if bash find fails (rare)
   */
  static discoverViaTraversal(dir, locationType) {
    const squads = [];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip files, hidden dirs, and non-directories
        if (!entry.isDirectory() || entry.name.startsWith('.')) {
          continue;
        }

        const squadYamlPath = path.join(dir, entry.name, 'squad.yaml');
        if (!fs.existsSync(squadYamlPath)) {
          continue;
        }

        try {
          const info = this.loadSquadInfo(squadYamlPath, locationType);
          squads.push(info);
        } catch (err) {
          console.warn(`[WARN] Failed to parse ${squadYamlPath}: ${err.message}`);
        }
      }
    } catch (error) {
      throw new Error(`Directory traversal failed: ${error.message}`);
    }

    return squads;
  }

  /**
   * LAZY LOADING: Parse only essential metadata
   * Full parse happens only on inspect/run
   */
  static loadSquadInfo(yamlPath, location) {
    const content = fs.readFileSync(yamlPath, 'utf-8');

    let parsed;
    try {
      parsed = yaml.parse(content);
    } catch (error) {
      throw new Error(`Invalid YAML: ${error.message}`);
    }

    // Validate required fields
    if (!parsed.name || !parsed.version) {
      throw new Error('Missing required fields: name, version');
    }

    // Count agents, workflows, tasks
    // Support both "agents/workflows/tasks" and "components.agents" formats
    const agents = this.countItems(parsed, 'agents');
    const workflows = this.countItems(parsed, 'workflows');
    const tasks = this.countItems(parsed, 'tasks');

    return {
      name: parsed.name,
      version: parsed.version,
      description: parsed.description || '(no description)',
      location,
      path: path.dirname(yamlPath),
      agents,
      workflows,
      tasks,
      harness: !!parsed.harness, // v3 indicator
    };
  }

  /**
   * Count items in squad.yaml (agents, workflows, tasks)
   * Supports multiple formats
   */
  static countItems(parsed, type) {
    // Try direct format: agents: [], workflows: [], tasks: []
    if (Array.isArray(parsed[type])) {
      return parsed[type].length;
    }

    // Try components format: components: { agents: [], workflows: [], tasks: [] }
    if (parsed.components && Array.isArray(parsed.components[type])) {
      return parsed.components[type].length;
    }

    return 0;
  }

  /**
   * Merge results with precedence: local > home
   */
  static mergeAndDeduplicate(localSquads, homeSquads) {
    const byName = new Map();

    // Add home squads first (lower priority)
    homeSquads.forEach(s => byName.set(s.name, s));

    // Override with local squads (higher priority)
    localSquads.forEach(s => byName.set(s.name, s));

    // Return sorted by name
    return Array.from(byName.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  /**
   * Path expansion: handle ~, ./, etc.
   */
  static expandPath(p) {
    if (p.startsWith('~')) {
      const home = process.env.HOME;
      if (!home) {
        throw new Error('HOME environment variable not set');
      }
      return p.replace('~', home);
    }
    if (p.startsWith('./') || p.startsWith('../')) {
      return path.resolve(p);
    }
    if (p.startsWith('/')) {
      return p;
    }
    return path.resolve(p);
  }

  /**
   * Check if directory exists
   */
  static dirExists(p) {
    try {
      return fs.statSync(p).isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Check if directory is readable
   */
  static isReadable(p) {
    try {
      fs.accessSync(p, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format squads for display
   */
  static formatSquads(squads) {
    if (squads.length === 0) {
      return `
⚠️  No squads found

Searched:
  • ./squads/
  • ~/squads/

Getting started:
  1. Create first squad: *create-squad my-first-squad
  2. Or import squads: cp -r /path/to/squads/* ~/squads/

For debugging:
  *list-squads --debug
`;
    }

    // Group by location
    const local = squads.filter(s => s.location === 'local');
    const home = squads.filter(s => s.location === 'home');

    let output = `✅ Found ${squads.length} squads\n`;

    if (local.length > 0) {
      output += `\n📂 Local Workspace (./squads/):\n`;
      local.forEach(s => {
        const hasHarness = s.harness ? ' [v3]' : '';
        output += `  • ${s.name} (v${s.version}, ${s.agents} agents, ${s.workflows} workflows)${hasHarness}\n`;
      });
    }

    if (home.length > 0) {
      output += `\n🏠 Home Directory (~/squads/):\n`;
      home.forEach(s => {
        const hasHarness = s.harness ? ' [v3]' : '';
        output += `  • ${s.name} (v${s.version}, ${s.agents} agents, ${s.workflows} workflows)${hasHarness}\n`;
      });
    }

    return output;
  }
}

module.exports = { SquadDiscovery };
