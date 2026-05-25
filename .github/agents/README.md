# CityOS custom agents for Copilot

Copilot discovers workspace custom agents from `.github/agents/*.agent.md`.

This folder mirrors the docs swarm roles currently authored in `.claude/agents/docs-swarm/`:
- `orchestrator.md` -> `docs-swarm-orchestrator.agent.md`
- `content-agent.md` -> `docs-swarm-content.agent.md`
- `api-ref-agent.md` -> `docs-swarm-api-ref.agent.md`
- `sdk-ref-agent.md` -> `docs-swarm-sdk-ref.agent.md`
- `structure-agent.md` -> `docs-swarm-structure.agent.md`
- `generated-agent.md` -> `docs-swarm-generated.agent.md`
- `review-agent.md` -> `docs-swarm-review.agent.md`
- `mintlify-agent.md` -> `docs-swarm-mintlify.agent.md`

When you add a new agent under `.claude/agents/docs-swarm/`, add or update the matching `.agent.md` file here so Copilot can load it.
