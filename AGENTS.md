> Project setup note: This file is customized for Dakkah CityOS docs.
> For Mintlify product knowledge (components, configuration, writing standards),
> install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# CityOS Documentation — Agent Guide

## You are part of a swarm

Dakkah CityOS documentation is maintained by a **multi-agent swarm** coordinated through:
- **`docs-swarm/orchestrator`** — Root orchestrator in this repo (`.claude/agents/docs-swarm/orchestrator.md`)
- **`docs-swarm/content-agent`** — Hand-written content (guides, concepts, verticals)
- **`docs-swarm/api-ref-agent`** — API Reference tab
- **`docs-swarm/sdk-ref-agent`** — SDK Reference tab
- **`docs-swarm/structure-agent`** — Navigation, docs.json, cross-links
- **`docs-swarm/generated-agent`** — Generated Reference tab sync
- **`docs-swarm/review-agent`** — Quality gate, links, style
- **`docs-swarm/mintlify-agent`** — Mintlify components, theming, SEO
- **`cityos-master-agent`** — Code repo orchestrator (for domain accuracy)

When in doubt, escalate to `docs-swarm/orchestrator` in this repo.

## Platform context

- **41 apps** across web, native, TV, kiosk, IoT, infrastructure
- **51 packages** (shared SDKs, design tokens, adapters, domain packages)
- **TypeScript 6.0.2** throughout — `ignoreDeprecations: "6.0"` mandatory
- **Primary locale: Arabic (`ar`)**, secondary English (`en`), SAR halalas for prices
- **Auth: Keycloak OIDC/PKCE** with `tenant_id` JWT claims
- **All cross-system calls via BFF only** — no direct service-to-service from clients

## Swarm Architecture

```text
                    docs-swarm/orchestrator
                           (root)
       +---------+---------+---------+---------+
       v         v         v         v         v
   content    api-ref   sdk-ref   structure  generated
   agent      agent     agent     agent      agent
       |         |         |         |         |
       +---------+---------+---------+---------+
                           |
                    review-agent
                           |
                    mintlify-agent
                           |
              cityos-master-agent (code repo)
```

| Agent | Responsibility | Triggers |
|---|---|---|
| `docs-swarm/orchestrator` | Route tasks, coordinate swarm | Any docs task |
| `docs-swarm/content-agent` | Guides, concepts, verticals, config | "write guide", "draft page" |
| `docs-swarm/api-ref-agent` | API endpoints, auth, errors | "api endpoint", "endpoint doc" |
| `docs-swarm/sdk-ref-agent` | SDK clients, types, schemas | "sdk client", "typescript client" |
| `docs-swarm/structure-agent` | docs.json, navigation, redirects | "navigation", "restructure", "move page" |
| `docs-swarm/generated-agent` | Sync generated/ from code repo | "generated reference", "sync docs" |
| `docs-swarm/review-agent` | Links, style, terminology, QA | "review docs", "check links", "qa" |
| `docs-swarm/mintlify-agent` | Components, theming, SEO, MCP | "mintlify component", "theming" |
| `cityos-master-agent` | Domain accuracy from code | Technical correctness questions |

## Repository structure

This docs repo (`dakkah-core/docs`) is **separate** from the main code repo (`dakkah-core/dakkah-cityos-cms`).

```
dakkah-core/docs/           ← This repo (Mintlify docs)
├── docs.json               ← Mintlify config + navigation
├── index.mdx               ← Landing page
├── introduction.mdx
├── quickstart.mdx
├── concepts/               ← Core concepts (multi-tenancy, SDUI, surfaces)
├── guides/                 ← Task-oriented guides
├── verticals/              ← Vertical overviews (commerce, fleet, iot...)
├── apps/                   ← App documentation
├── api/                    ← API reference (OpenAPI-backed)
├── sdk/                    ← SDK reference
├── configuration/          ← Config guides
├── integrations/           ← Third-party integrations
├── resources/              ← Glossary, error codes, FAQ
├── changelog/              ← Release notes
└── generated/              ← Auto-generated from code repo
    ├── apps/               ← 25 app deep-dives
    ├── packages/           ← 40 package deep-dives
    └── diagrams/           ← 145 Mermaid diagrams
```

## The Generated Reference tab

The **"Generated Reference"** tab contains documentation auto-generated from the `dakkah-cityos-cms` codebase. It is maintained by `docs-swarm/generated-agent`.

### What it contains

| Section | Source | Count |
|---|---|---|
| Apps | `apps/*` source code | 25 |
| Packages | `packages/*` source code | 40 |
| Diagrams | TypeScript AST + dependency graph | 145 |

Each generated page includes:
- **Overview** — Design philosophy (type-aware per module)
- **Architecture** — Abstraction layers, file structure
- **Integration Guide** — How to use the module
- **Component Catalog** — React components with props
- **Type System** — Interfaces, types, enums
- **Hooks** — React hooks with params/returns
- **Dependencies** — Cross-linked with purpose grouping
- **Consumers & Impact** — Runtime vs build-time dependents
- **Diagrams** — Class, dependency, component hierarchy, ER
- **Related Apps** — Apps sharing similar dependencies

### How `generated/` is maintained

```bash
# In dakkah-cityos-cms repo:
node scripts/docs/generate-all.mjs --force   # Full regeneration
node scripts/docs/mintlify/export-to-mintlify.mjs   # Export to docs repo
node scripts/docs/mintlify/merge-navigation.mjs      # Update docs.json
```

The pipeline uses **ts-morph** for TypeScript AST analysis and produces structured data. LLM narratives are added by **Copilot Agent** or **Mintlify Agent** during review, not by the pipeline itself.

### Do NOT edit generated files by hand

Files under `generated/` are overwritten on every export. If you need to fix content:
- Update the **source code** in `dakkah-cityos-cms`
- Or update the **generation scripts** in `dakkah-cityos-cms/scripts/docs/`
- Then re-run the export

## Cross-linking between hand-written and generated docs

Link from hand-written docs to generated reference:

```mdx
For implementation details, see the
[generated package reference](/generated/packages/cityos-core).
```

Link from generated docs back to hand-written guides (handled by export script):
- `../../packages/foo/index.md` → `/generated/packages/foo`
- `../../apps/bar/index.md` → `/generated/apps/bar`
- `../../diagrams/class/foo.mmd` → `/generated/diagrams/class/foo.mmd`

## Terminology

- Use "tenant" for city/operator scope, not "account".
- Use "domain" for business capability areas (commerce, bookings, fleet, loyalty, events, citizen, IoT, governance, healthcare).
- Use "surface" for client experiences (web, admin, carplay/auto, mobile).
- Use "SDK client" when referring to domain client libraries.
- Use "capability flag" for feature gating and entitlement controls.
- Use "CityOS" as the product name (not "platform" as a standalone noun).
- Use "block" for SDUI (Server-Driven UI) components.
- Use "collection" for Payload CMS data models.

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references
- Prefer task-oriented headings that begin with an action verb where possible
- For API documentation, include both curl and TypeScript examples when applicable
- Link related pages instead of duplicating long explanations
- Keep API path examples and object fields consistent with the source schema

## Content boundaries

- Document only public or intended-for-customer behavior in CityOS docs.
- Do not document internal-only admin workflows, private endpoints, or unreleased features.
- Do not invent endpoints, schema fields, capability flags, or SDK methods.
- If behavior is uncertain, mark it for confirmation instead of presenting assumptions as facts.
- Treat the codebase and OpenAPI artifacts as source of truth when docs and examples diverge.

## MCP endpoint

The docs are exposed via MCP at `https://dakkahcityos.mintlify.app/mcp`:
- `search_dakkah_city_os` — Semantic search across all docs (hand-written + generated)
- `query_docs_filesystem_dakkah_city_os` — Shell-like queries (rg, cat, head, tree, ls)

## Platform-wide rules (apply to all docs)

1. **TypeScript 6.0.2** - `ignoreDeprecations: "6.0"` in all tsconfigs
2. **No direct service-to-service** - all cross-system calls via BFF or CityBus
3. **`tenantId` required** on all data operations
4. **Arabic first** - all user-facing strings must support `ar` locale
5. **SAR halalas** - all monetary amounts in smallest unit (integer)
6. **HMAC-SHA256 verification** on incoming webhooks
7. **`X-CityOS-Correlation-Id`** header on cross-service requests
8. **`rbacChecker`** for Payload access control
9. **Keycloak JWT** - validate `tenant_id` on protected routes

## Adding a new vertical/app/package

1. **Code repo**: Add the module in `apps/` or `packages/`
2. **Code repo**: Run doc generation to produce the deep-dive
3. **Code repo**: Export to this docs repo
4. **Docs repo**: Add hand-written overview in appropriate section (verticals, guides, etc.)
5. **Docs repo**: Cross-link to generated reference
6. **Docs repo**: Update `docs.json` navigation if needed
7. **Verify**: Run `mint broken-links` before committing
