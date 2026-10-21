#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# No default configuration, and no deployment without a locally enabled file.
exec node "$ROOT/scripts/mac-mini-deploy.mjs" "$@"
