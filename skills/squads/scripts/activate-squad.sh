#!/bin/bash
# activate-squad.sh — Squad Protocol Engine v4.0.0
# Activates a squad: validate, check deps, register for slash commands
# Usage: bash activate-squad.sh <squad-name>

set -euo pipefail

SQUAD_NAME="${1:?Usage: activate-squad.sh <squad-name>}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Resolve squad path
if [ -d "./squads/$SQUAD_NAME" ]; then
  SQUAD_PATH="./squads/$SQUAD_NAME"
elif [ -d "$HOME/squads/$SQUAD_NAME" ]; then
  SQUAD_PATH="$HOME/squads/$SQUAD_NAME"
else
  echo "ERROR: Squad '$SQUAD_NAME' not found in ./squads/ or ~/squads/"
  exit 1
fi

echo "Activating squad: $SQUAD_NAME"
echo "Path: $SQUAD_PATH"
echo "================================"

# Step 1: Validate
echo ""
echo "Step 1: Validation"
bash "$SCRIPT_DIR/validate-squad.sh" "$SQUAD_PATH"
if [ $? -ne 0 ]; then
  echo "ERROR: Validation failed. Fix errors before activating."
  exit 1
fi

# Step 2: Check runtime deps
echo ""
echo "Step 2: Runtime Dependencies"

# Node
NODE_VERSION=$(node --version 2>/dev/null || echo "none")
if [ "$NODE_VERSION" = "none" ]; then
  echo "[FAIL] Node.js not installed"
  exit 1
fi
echo "[PASS] Node.js: $NODE_VERSION"

# Python
PYTHON_VERSION=$(python3 --version 2>/dev/null || echo "none")
if [ "$PYTHON_VERSION" = "none" ]; then
  echo "[WARN] Python3 not installed (optional)"
else
  echo "[PASS] $PYTHON_VERSION"
fi

# yaml module
if node -e "require('yaml')" 2>/dev/null; then
  echo "[PASS] yaml module available"
else
  echo "[INFO] Installing yaml module..."
  npm install -g yaml 2>/dev/null || npm install yaml 2>/dev/null
  echo "[PASS] yaml module installed"
fi

# Step 3: Squad-specific deps
echo ""
echo "Step 3: Squad Dependencies"

NODE_DEPS=$(node -e "
  const y=require('yaml');const f=require('fs');
  const d=y.parse(f.readFileSync('$SQUAD_PATH/squad.yaml','utf8'));
  const deps=d.dependencies&&d.dependencies.node||[];
  deps.forEach(x=>console.log(x));
" 2>/dev/null || true)

if [ -n "$NODE_DEPS" ]; then
  while IFS= read -r dep; do
    PKG=$(echo "$dep" | sed 's/@.*//')
    if node -e "require('$PKG')" 2>/dev/null; then
      echo "[PASS] $dep (installed)"
    else
      echo "[INFO] Installing $dep..."
      npm install "$dep" 2>/dev/null && echo "[PASS] $dep installed" || echo "[WARN] Failed to install $dep"
    fi
  done <<< "$NODE_DEPS"
else
  echo "[INFO] No node dependencies defined"
fi

# Step 4: Register for slash commands
echo ""
echo "Step 4: Registration"

CMD_DIR=".claude/commands/SQUADS/$SQUAD_NAME"
mkdir -p "$CMD_DIR"

AGENT_FILES=$(find "$SQUAD_PATH/agents" -name "*.yaml" -o -name "*.md" 2>/dev/null || true)
if [ -n "$AGENT_FILES" ]; then
  while IFS= read -r agent_file; do
    BASENAME=$(basename "$agent_file")
    cp "$agent_file" "$CMD_DIR/$BASENAME"
    echo "[PASS] Registered: /SQUADS:$SQUAD_NAME:${BASENAME%.*}"
  done <<< "$AGENT_FILES"
else
  echo "[WARN] No agent files found to register"
fi

# Summary
echo ""
echo "================================"
VERSION=$(node -e "const y=require('yaml');const f=require('fs');const d=y.parse(f.readFileSync('$SQUAD_PATH/squad.yaml','utf8'));console.log(d.version||'unknown')" 2>/dev/null)
echo "Squad '$SQUAD_NAME' v$VERSION activated successfully."
echo "Use /SQUADS:$SQUAD_NAME:<agent-id> to invoke agents."
