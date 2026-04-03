#!/bin/bash
# validate-squad.sh — Squad Protocol Engine v4.0.0
# Validates a squad directory against the protocol
# Usage: bash validate-squad.sh <squad-path>

set -euo pipefail

SQUAD_PATH="${1:?Usage: validate-squad.sh <squad-path>}"
SCHEMA_DIR="$HOME/.claude/skills/squads/schemas"
ERRORS=0
WARNINGS=0

echo "Validating squad at: $SQUAD_PATH"
echo "================================"

# B1: squad.yaml exists
if [ ! -f "$SQUAD_PATH/squad.yaml" ]; then
  echo "[FAIL] B1: squad.yaml not found"
  exit 1
fi
echo "[PASS] B1: squad.yaml exists"

# B2-B5: Parse and validate basic fields
NAME=$(node -e "const y=require('yaml');const f=require('fs');const d=y.parse(f.readFileSync('$SQUAD_PATH/squad.yaml','utf8'));console.log(d.name||'')" 2>/dev/null)
VERSION=$(node -e "const y=require('yaml');const f=require('fs');const d=y.parse(f.readFileSync('$SQUAD_PATH/squad.yaml','utf8'));console.log(d.version||'')" 2>/dev/null)

if [ -z "$NAME" ]; then
  echo "[FAIL] B3: name field missing"
  ERRORS=$((ERRORS+1))
else
  echo "[PASS] B3: name = $NAME"
  if ! echo "$NAME" | grep -qE '^[a-z0-9-]+$'; then
    echo "[FAIL] B4: name format invalid (must be kebab-case)"
    ERRORS=$((ERRORS+1))
  else
    echo "[PASS] B4: name format valid"
  fi
fi

if [ -z "$VERSION" ]; then
  echo "[FAIL] B5: version field missing"
  ERRORS=$((ERRORS+1))
else
  if echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo "[PASS] B5: version = $VERSION (valid semver)"
  else
    echo "[FAIL] B5: version format invalid (must be semver)"
    ERRORS=$((ERRORS+1))
  fi
fi

# B6-B8: Check referenced files exist
check_files() {
  local TYPE=$1
  local CHECK_ID=$2
  local DIR=$3
  local FILES=$(node -e "
    const y=require('yaml');const f=require('fs');
    const d=y.parse(f.readFileSync('$SQUAD_PATH/squad.yaml','utf8'));
    const c=d.components&&d.components.$TYPE||[];
    c.forEach(x=>console.log(x));
  " 2>/dev/null)

  if [ -n "$FILES" ]; then
    while IFS= read -r file; do
      if [ ! -f "$SQUAD_PATH/$DIR/$file" ]; then
        echo "[FAIL] $CHECK_ID: $DIR/$file not found"
        ERRORS=$((ERRORS+1))
      fi
    done <<< "$FILES"
    local COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
    echo "[PASS] $CHECK_ID: $COUNT $TYPE files verified"
  else
    echo "[INFO] $CHECK_ID: No $TYPE defined"
  fi
}

check_files "agents" "B6" "agents"
check_files "tasks" "B7" "tasks"
check_files "workflows" "B8" "workflows"

# Advisory checks
echo ""
echo "Advisory Checks"
echo "---------------"

for field in description author license tags slashPrefix; do
  VAL=$(node -e "const y=require('yaml');const f=require('fs');const d=y.parse(f.readFileSync('$SQUAD_PATH/squad.yaml','utf8'));console.log(d.$field?'yes':'no')" 2>/dev/null)
  if [ "$VAL" = "yes" ]; then
    echo "[PASS] A: $field present"
  else
    echo "[WARN] A: $field missing (recommended)"
    WARNINGS=$((WARNINGS+1))
  fi
done

[ -f "$SQUAD_PATH/README.md" ] && echo "[PASS] A: README.md exists" || { echo "[WARN] A: README.md missing"; WARNINGS=$((WARNINGS+1)); }

# Check for harness (v3)
HAS_HARNESS=$(node -e "const y=require('yaml');const f=require('fs');const d=y.parse(f.readFileSync('$SQUAD_PATH/squad.yaml','utf8'));console.log(d.harness?'yes':'no')" 2>/dev/null)
if [ "$HAS_HARNESS" = "yes" ]; then
  echo "[PASS] A: harness block configured (v3)"
else
  echo "[WARN] A: No harness block (consider upgrading to v3)"
  WARNINGS=$((WARNINGS+1))
fi

# Summary
echo ""
echo "================================"
echo "Squad: $NAME v$VERSION"
echo "Blocking errors: $ERRORS"
echo "Warnings: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
  echo "Verdict: PASS"
  exit 0
else
  echo "Verdict: FAIL"
  exit 1
fi
