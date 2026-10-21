# Mac mini hosting and fast agent tools (staged setup)

This branch is preparation only. No changes to the running Mac mini or the current GitHub Pages deployment are made by the scripts until installed.

## Architecture / activation

The current implementation keeps the Vite development server on localhost because its existing middleware owns all writable APIs (trip PATCH, comments, places, hotel searches and weather). Tailscale Serve supplies private HTTPS access. This is a **transitional setup**, not a production-grade server. Never enable Tailscale Funnel or reverse-proxy this editor to the open internet.

On the Mac mini (when available):
1. Clone / fast-forward the repository, check Node >=22.12, npm, Tailscale login, and macOS permissions.
2. Run `TB_TAILSCALE_DOMAIN=mac-mini-de-vinicius.tail969dc0.ts.net bash scripts/mac-mini-install.sh`.
3. Check Tailscale ACLs for who can access the machine and verify the site at `https://mac-mini-de-vinicius.tail969dc0.ts.net:10443/`. The port is deliberately separate from the existing :10000 dashboard.
4. Only after verification, consider disabling the old GitHub Pages workflow and switching bookmarks.
5. For updates, run `bash scripts/mac-mini-deploy.sh` from a clean checkout. Automating invocation with a timer or GitHub Actions self-hosted runner is a separate configuration step, and **has not been activated**.

**Important:** The deploy guard refuses to update a dirty tracked checkout or one with local unpushed commits. Editor modifications must be committed and pushed or backed up/synced first. Do not point two editors at a shared checkout during deploy. GitHub Pages remains untouched until switchover.

## Agent tools

Run from the repo root:

```sh
node scripts/travel-agent.mjs list
node scripts/travel-agent.mjs day europa 'Dia 1'
node scripts/travel-agent.mjs search 'Pantheon'
node scripts/travel-agent.mjs batch europa /path/to/edits.json
```

Batch input: `{"revision":"<revision from day>","edits":[{"before":["existing complete line"],"after":["replacement line"]}]}`. Distinct edit blocks must match exactly once; batch edits reject stale revisions. This is a low-level transport for agents; respect `content/SCHEMA.md` and the protected `decisão:` items. Currently it does not validate every semantic travel rule or prevent edits to protected decisions. Do not expose this CLI as an unauthenticated HTTP endpoint.

## Performance plan and benchmarking

Record per-task wall time and calls for: (1) inspecting a day, (2) changing a single stop, (3) applying five independent changes, and (4) answering a place question requiring external research. Compare baseline manual Markdown workflow with CLI workflow, and measure p50/p95 across at least 10 runs before claiming speedups.

Next stages: SQLite/FTS search index for catalogs and structured location records, contract-aware high-level stop tools built on existing parser, schema validation and decision protection, caching external API lookups with appropriate TTL and provenance, and production Node server separated from Vite. The CLI search currently scans Markdown files and has no external API or SQLite cache. Avoid claiming those features are implemented.
