#!/bin/bash

# Bump the version number in package.json
# Usage: ./scripts/bump-version.sh [major|minor|patch|beta]
# Default: patch
#
# beta: If current version is already a beta (e.g. 0.0.69-beta.0),
#        increments the beta number (-> 0.0.69-beta.1).
#        Otherwise, bumps patch and adds -beta.0 (e.g. 0.0.68 -> 0.0.69-beta.0).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PACKAGE_JSON="$PROJECT_ROOT/package.json"

BUMP_TYPE="${1:-patch}"

if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch|beta)$ ]]; then
  echo "Usage: $0 [major|minor|patch|beta]"
  echo "  Default: patch"
  exit 1
fi

CURRENT=$(grep -o '"version": *"[^"]*"' "$PACKAGE_JSON" | head -1 | sed 's/"version": *"//;s/"//')

# Split base version from prerelease tag
BASE="${CURRENT%%-*}"
PRERELEASE=""
if [[ "$CURRENT" == *"-"* ]]; then
  PRERELEASE="${CURRENT#*-}"
fi

IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE"

case "$BUMP_TYPE" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0; PRERELEASE="" ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0; PRERELEASE="" ;;
  patch) PATCH=$((PATCH + 1)); PRERELEASE="" ;;
  beta)
    if [[ "$PRERELEASE" == beta.* ]]; then
      # Already a beta — increment beta number
      BETA_NUM="${PRERELEASE#beta.}"
      PRERELEASE="beta.$((BETA_NUM + 1))"
    else
      # Not a beta — bump patch and start beta.0
      PATCH=$((PATCH + 1))
      PRERELEASE="beta.0"
    fi
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
if [[ -n "$PRERELEASE" ]]; then
  NEW_VERSION="$NEW_VERSION-$PRERELEASE"
fi

# Escape dots and hyphens for sed
ESCAPED_CURRENT=$(echo "$CURRENT" | sed 's/[.]/\\./g; s/[-]/\\-/g')
sed -i '' "s/\"version\": *\"$ESCAPED_CURRENT\"/\"version\": \"$NEW_VERSION\"/" "$PACKAGE_JSON"

echo "$CURRENT -> $NEW_VERSION"
