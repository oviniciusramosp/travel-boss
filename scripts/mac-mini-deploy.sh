#!/bin/bash
set -euo pipefail
# Invoked by launchd or manually, on a working checkout.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec 9>"$ROOT/.git/travel-boss-deploy.lock"
flock_available=0
if command -v flock >/dev/null; then flock -n 9 || exit 0; flock_available=1; fi
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Refusing deploy: tracked local edits would be overwritten" >&2
  exit 2
fi
git fetch origin main
if [[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]]; then exit 0; fi
# Only fast-forward. If local commits exist, user needs to sync first.
git merge-base --is-ancestor HEAD origin/main || { echo "Local commits pending; refusing deploy" >&2; exit 3; }
git merge --ff-only origin/main
npm ci
npm test
npm run build
echo "Deployed $(git rev-parse --short HEAD)"
