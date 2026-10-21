#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${TB_TAILSCALE_DOMAIN:?Set TB_TAILSCALE_DOMAIN to your ts.net hostname}"
cd "$ROOT"
command -v tailscale >/dev/null || { echo "Install and log into Tailscale first"; exit 1; }
command -v node >/dev/null || { echo "Node 22+ is required"; exit 1; }
npm ci && npm test && npm run build
PLIST="$HOME/Library/LaunchAgents/com.travelboss.site.plist"
mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>com.travelboss.site</string>
<key>ProgramArguments</key><array>
<string>$(command -v npm)</string><string>run</string><string>dev</string><string>--</string><string>--host</string><string>127.0.0.1</string><string>--port</string><string>5173</string><string>--strictPort</string>
</array>
<key>WorkingDirectory</key><string>$ROOT</string>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
<key>StandardOutPath</key><string>$HOME/Library/Logs/travelboss.log</string>
<key>StandardErrorPath</key><string>$HOME/Library/Logs/travelboss-error.log</string>
</dict></plist>
EOF
launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
# Tailscale Serve is private to your tailnet; do not use Funnel.
tailscale serve --bg --https=10443 http://127.0.0.1:5173
echo "Private URL: https://$DOMAIN:10443/"
echo "To update code: bash scripts/mac-mini-deploy.sh"
echo "Keep the legacy GitHub Pages site online until you verify this installation."
