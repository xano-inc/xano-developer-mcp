#!/usr/bin/env bash
# Prevent publishing prerelease versions without --tag flag.
# Without this guard, `npm publish` on a beta version tags it as "latest".

VERSION=$(node -p "require('./package.json').version")

if [[ "$VERSION" == *-* ]]; then
  # Check if --tag was passed to the npm publish command
  if [[ "$npm_config_tag" == "" || "$npm_config_tag" == "latest" ]]; then
    echo "ERROR: Prerelease version $VERSION requires --tag flag (e.g. npm publish --tag beta)" >&2
    echo "Use: npm run publish:beta" >&2
    exit 1
  fi
fi
