# ShelfExecution — Incident Reports

This repository contains post-incident reports, evidence, and runbooks for production incidents affecting ShelfExecution products (shelfscan, shelfintel, shelfpulse, shelfex).

## Purpose

Every production incident that affects users is documented here. The goals are:

1. **Learn from failures** — understand what went wrong and why
2. **Prevent recurrence** — track action items to completion
3. **Build institutional knowledge** — new team members can read past incidents to understand our system's failure modes
4. **Improve response time** — runbooks help us act faster during future incidents

## Severity Levels

| Level | Definition | Examples | Response Time | Report Required |
|-------|-----------|----------|---------------|-----------------|
| **P0** | Complete outage. All or most users affected. Core functionality unavailable. | Database down, API completely unresponsive, data loss | Immediate — all hands | Full report within 48 hours |
| **P1** | Major degradation. Many users affected. Core features partially working. | Very slow response times, partial data loss, one product fully down | Within 30 minutes | Full report within 72 hours |
| **P2** | Minor degradation. Some users affected. Non-core features impacted. | Dashboard slow, one API endpoint failing, Metabase down | Within 2 hours | Quick report within 1 week |
| **P3** | Minimal impact. Few users affected. Workarounds available. | Intermittent errors, cosmetic issues, non-critical job failures | Next business day | Quick report (optional) |

## How to File an Incident Report

### 1. Create the incident folder

```
incidents/2026/INC-XXX-short-description/
```

Use the next sequential number. Check the CHANGELOG.md for the last used number.

### 2. Copy the appropriate template

- **P0/P1:** Copy `templates/incident-report.md` → `report.md`
- **P2/P3:** Copy `templates/quick-incident.md` → `report.md`

### 3. Fill out the report

Write the report within the timeframe specified by the severity level. Include:
- What happened (user-visible impact)
- Timeline of events and response actions
- Root cause analysis
- What fixed it
- Action items with owners and deadlines

### 4. Add evidence

Put screenshots, log exports, and monitoring graphs in the `evidence/` folder. Reference them in the report using relative paths.

### 5. Update CHANGELOG.md

Add a one-line entry to `CHANGELOG.md` so the incident is discoverable.

### 6. Submit a PR

All incident reports go through PR review. At least one person who was NOT involved in the incident should review for clarity and completeness.

## Repo Structure

```
incidents/          → Individual incident reports organized by year
templates/          → Report templates (full and quick)
runbooks/           → Step-by-step guides for known failure scenarios
CHANGELOG.md        → Quick-reference log of all incidents
```

## Runbooks

Before starting an investigation from scratch, check the `runbooks/` folder. If we've seen a similar failure before, there may already be a diagnostic guide.

| Runbook | When to Use |
|---------|------------|
| `db-connection-exhaustion.md` | pg-pool timeout errors, ECONNREFUSED to database |
| `high-cpu-postgres.md` | Cloud SQL CPU > 80%, slow queries |
| `cloud-run-5xx.md` | Backend returning 500/502/503 errors |
| `emergency-contacts.md` | Who to call for what |

## Blameless Culture

These reports are about **systems and processes**, not people. We document what happened and why so we can improve. We don't assign blame to individuals. If you made a change that contributed to an incident, documenting it honestly helps everyone learn — including yourself.