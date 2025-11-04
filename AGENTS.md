Filebrowser Fork — Agent Guide

Purpose
- Maintain this fork with the smallest possible diff from upstream (filebrowser/filebrowser).
- Prefer extensibility via frontend modules and isolated mount points over editing core code.
- Avoid protocol/scheme changes (e.g., JWT shape) unless strictly necessary.

First Steps (required)
- Read project build files: `Makefile`, `CONTRIBUTING.md`, `frontend/package.json`, `go.mod`, and this `AGENTS.md`.
- Follow upstream’s order and targets. Prefer `make build` when available; otherwise run the underlying commands in the same order.

Definition of “Build the Project”
- Always rebuild from sources; do not rely on prebuilt binaries or existing `dist/`.
- Order (canonical): frontend → backend.
  - Frontend: `pnpm install --frozen-lockfile` then `pnpm run build`.
  - Backend release: `go build` (embeds `frontend/dist`).
  - Backend dev: `go build -tags dev` (serves live frontend from `frontend/`).
  - With Makefile: prefer `make build` (calls both) when available.

Core Principles
- Minimal core changes:
  - Only add stable extension mount points in core views/templates.
  - Keep module logic in `frontend/src/modules/**`.
  - Do not expand core types just for module needs; use module‑local extended types.
- Readme Preview feature:
  - Per‑user flag; default is always false, not configurable through global Settings.
  - Do not add this flag to JWT; fetch full user profile client‑side (module) when needed.
- Backend changes:
  - The fork adds `ReadmePreview` to `users.User` (persisted per user).
  - Do not introduce global defaults in `settings.UserDefaults` for module flags.

Extension System (frontend)
- Registry and mount points:
  - Registry: `frontend/src/modules/registry.ts`
  - Mount: `frontend/src/modules/ExtensionsMount.vue`
  - Plugin: `frontend/src/modules/index.ts`
  - Existing mount targets used by the fork:
    - `filelisting:after` (below file listing)
    - `profile:after-columns` (additional column in profile settings)
- Adding a module (pattern):
  1) Create `frontend/src/modules/<feature>/` with component(s) and `register.ts` calling `register('<target>', Comp)`.
  2) Import the module’s `register.ts` in `frontend/src/modules/index.ts`.
  3) Only add `<ExtensionsMount target="…" />` to core views where needed.

Modules in this fork
- `readme-preview`:
  - Finds `README.md` in current directory, fetches content via files API, renders with `marked` and sanitizes with `DOMPurify`.
  - Renders at `filelisting:after`. Provides a settings form in `profile:after-columns` to toggle the per‑user flag.
  - Treats `readmePreview` as module‑local extension: use a local type (e.g., `IUserExtended` = `IUser & { readmePreview?: boolean }`).
  - Update via users API with partial update `['readmePreview']` (do not change core API signatures).
- `auth-refresh`:
  - Watches `[jwt, user.id]` and fetches full user via users API to keep store up‑to‑date.
  - Prevents scattering profile fetch logic into core auth utilities.

Build & Test (follow upstream)
- Frontend (Vue 3 + Vite):
  - Install: `cd frontend && pnpm install --frozen-lockfile`
  - Build: `pnpm run build`
  - Typecheck: `pnpm run typecheck`
- Backend (Go):
  - Dev build (serve assets from source): `go build -tags dev`
  - Release build (embed `frontend/dist`): `go build`
- Makefile targets (optional, mirrors above):
  - `make build-frontend`, `make build-backend`, `make build`, `make test`, `make lint`

Environment Preparation (tools) — minimal‑diff approach
- Node (frontend):
  - Respect the version declared in `frontend/package.json > engines.node` (or `.nvmrc` if present). Use a version manager to select it; do not suppress engine checks.
- pnpm:
  - Use the repo’s lockfile and `--frozen-lockfile`. Expect network for first install.
  - If `node_modules` already exists, you may build without re‑install to reduce network use.
- Go (backend):
  - Use the version declared in `go.mod` (`go` directive).
  - Fetch modules with `go mod download` (network) before building when needed.

Toolchain Activation (before installing)
- Activate existing toolchains using the workspace’s documented method before proposing any installation.
- Refer to the workspace‑level `AGENTS.md` for environment‑specific activation guidance.
- If required toolchains are not available after activation, request installation (one command per approval).

Permissions & Network
- Never bypass sandbox limits. If blocked, stop and request elevation explicitly (one command per request) with rationale.
- Typical one‑by‑one elevation examples:
  - Install nvm: `curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/... | bash`
  - Install Node (version from `frontend/package.json > engines.node`): `nvm install <derived-version>`
  - Install frontend deps: `cd frontend && pnpm install --frozen-lockfile`
  - Fetch Go modules: `cd .. && go mod download`

Troubleshooting & Fallbacks
- No `make`: run the underlying commands directly (see above).
- Interactive prompts (pnpm): set `CI=1` to avoid interactivity when recreating `node_modules`.
- No network:
  - Frontend: if `node_modules` present, try `pnpm run typecheck` and `vite build` via local binaries.
  - Backend: cannot fetch modules — report and request elevation, or use vendored modules if present.

When Changing/Adding Features
- Prefer a module:
  - Add a mount point if missing (single line in the view) and register module components.
  - Avoid touching core view logic, stores, or global types unless impossible otherwise.
- If persistence is required:
  - Prefer per‑user fields under `users.User` and use existing users API for partial updates.
  - Avoid expanding JWT payload; use the `auth-refresh` pattern to hydrate the profile after login/renew.
- Do not add global defaults for module flags to server settings; keep defaults implicit (code/false).

Diff Hygiene
- Keep diffs small and localized. One line mount additions are preferred.
- Document rationale in commit messages (what/why, not just how).
- Avoid refactors that move or reformat large upstream files unless required.

Quality Gates
- Frontend: `pnpm run typecheck`, `pnpm run lint`, build via Vite.
- Backend: `go test ./...` where feasible.

Ask First When Unsure
- If a change seems to grow the diff (new core fields, JWT changes, server defaults), propose a module‑based or mount‑point solution before editing core.
