# Runbook: High CPU on PostgreSQL (Cloud SQL)

## Symptoms

- Cloud SQL CPU utilization (P99) above 80%
- Query latency (P99) increasing — spikes to 10s, 20s, 30s+
- Backend response times degrading across all endpoints
- Cloud SQL dashboard shows CPU gauge in yellow/red zone

## Severity Assessment

- CPU > 90% sustained → **P1** (will likely become P0 if not addressed)
- CPU > 80% sustained → **P2** (investigate within hours)
- CPU > 80% in spikes only → **P3** (investigate, likely a specific query)

## Important: Do NOT Just Add More CPU

Adding vCPUs is a temporary band-aid, not a fix. In our [INC-001 incident](../incidents/2026/INC-001-db-outage/report.md), the team scaled from 12 → 16 → 20 cores and the problem persisted because the root cause was table bloat forcing queries to scan far more data than necessary.

**Always diagnose the cause first.** More CPU only helps if the bottleneck is genuinely compute-bound. Most PostgreSQL CPU spikes are caused by inefficient queries scanning too much data.

## Step-by-Step Diagnostic

### Step 1: Identify WHAT is consuming CPU (3 minutes)

Check Cloud SQL dashboard → Database Load → "By database" view.

This tells you which database is generating the load. In our environment, the likely culprits are:

| Database | Typical Cause |
|----------|--------------|
| shelfscan-prod-v1 | High API traffic, unoptimized visits query |
| metabase_v58 | Heavy analytical queries (CTE reports) |
| shelfscan-dev-v1 | Runaway dev query (no timeouts configured) |
| shelfintel-prod-v1 | Bulk data processing |

### Step 2: Check for table bloat (5 minutes)

Table bloat is the #1 hidden cause of high CPU. When autovacuum is blocked, dead rows accumulate and every query scans far more data than it should.

```sql
-- Check if autovacuum is being blocked by old transactions
SELECT pid, usename, application_name, backend_type,
       now() - xact_start AS transaction_age,
       state, left(query, 100) AS query_preview
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start ASC
LIMIT 10;
```

**Red flags:**
- Any transaction older than 10 minutes → likely blocking vacuum
- `backend_type = 'walsender'` with old transaction → replica is blocking vacuum
- `application_name` containing 'Metabase' with old transaction → Metabase holding transaction open

If you find a bloat-causing transaction, kill it:
```sql
SELECT pg_terminate_backend(<pid>);
```

Then check the bloat level on major tables:
```sql
-- Estimate dead rows per table
SELECT schemaname, relname, 
       n_live_tup, n_dead_tup,
       ROUND(n_dead_tup::numeric / GREATEST(n_live_tup, 1) * 100, 2) AS dead_pct,
       last_autovacuum, last_vacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY n_dead_tup DESC
LIMIT 15;
```

If `dead_pct` is above 20% on any major table, that table is bloated and needs vacuum:
```sql
VACUUM (VERBOSE) <table_name>;
```

For severe bloat (dead_pct > 50%), consider `VACUUM FULL` — but be aware this locks the table for the duration. Schedule during off-hours.

### Step 3: Find the expensive queries (3 minutes)

```sql
-- Currently running queries sorted by duration
SELECT pid, usename, application_name, datname,
       now() - query_start AS duration,
       left(query, 200) AS query_preview
FROM pg_stat_activity
WHERE state = 'active' AND query NOT LIKE '%pg_stat%'
ORDER BY duration DESC
LIMIT 10;
```

```sql
-- If pg_stat_statements is enabled, find historically expensive queries
SELECT calls, mean_exec_time::integer AS avg_ms,
       total_exec_time::integer AS total_ms,
       rows,
       left(query, 150) AS query_preview
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### Step 4: Check temp file usage (2 minutes)

High temp file usage means queries are spilling to disk, which hammers CPU and I/O.

Check Cloud SQL dashboard → Temp data size and Temp Files charts.

If temp files are high (> 1 GB or > 500 files):
- Queries are exceeding `work_mem` and writing sort/join data to disk
- Check current setting: `SHOW work_mem;`
- If it's 4 MB (default), increase it: `ALTER SYSTEM SET work_mem = '64MB'; SELECT pg_reload_conf();`

### Step 5: Check for replica issues (2 minutes)

If a read replica exists, check:

1. **Cloud SQL Console → Replicas** — is replication lag growing?
2. **Replication connections on primary:**
```sql
SELECT pid, usename, application_name, backend_type,
       state, sent_lsn, write_lsn, flush_lsn, replay_lsn
FROM pg_stat_replication;
```

If `sent_lsn` is far ahead of `replay_lsn`, the replica is falling behind and the WAL sender is doing heavy work. Consider stopping the replica if it's non-critical.

### Step 6: Check connection count and distribution (2 minutes)

High connection counts consume CPU for context switching and memory management.

```sql
-- Connections by database
SELECT datname, count(*)
FROM pg_stat_activity
GROUP BY datname
ORDER BY count DESC;

-- Connections by state
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state
ORDER BY count DESC;
```

If total connections > 500, identify and reduce non-essential consumers (dev databases, idle Metabase connections).

## Quick Fixes (Ordered by Impact)

| Priority | Action | Expected Impact |
|----------|--------|----------------|
| 1 | Kill any transaction older than 10 minutes | Unblocks vacuum, reduces bloat |
| 2 | Stop read replica if one exists | Removes WAL sender load + unblocks vacuum |
| 3 | Kill long-running Metabase queries | Frees connections and CPU |
| 4 | Run VACUUM on bloated tables | Reclaims dead rows, reduces scan volume |
| 5 | Increase `work_mem` to 64MB | Reduces temp file I/O |
| 6 | Increase vCPUs (last resort) | Only helps if above steps are done first |

## Things That Will NOT Fix This

| Action | Why It Won't Work |
|--------|------------------|
| Adding more CPU cores alone | If bloat is the cause, queries will consume any amount of CPU |
| Restarting the database | Bloat and dead rows persist across restarts |
| Rolling back the backend | If the problem is DB-level, app code doesn't matter |
| Reducing traffic | Helps temporarily but doesn't fix the root cause |

## Prevention

- [ ] `statement_timeout = 60s` configured
- [ ] `idle_in_transaction_session_timeout = 300s` configured
- [ ] `work_mem = 64MB` configured
- [ ] Alert on CPU > 80% (warning) and > 90% (critical)
- [ ] Alert on oldest transaction age > 120 seconds
- [ ] Metabase queries routed to read replica, not primary
- [ ] Dev databases on separate instance
- [ ] Weekly check of `pg_stat_user_tables` for dead row accumulation

## Related Incidents

- [INC-001: Production DB outage — Feb 12, 2026](../incidents/2026/INC-001-db-outage/report.md)

## Related Runbooks

- [Database Connection Exhaustion](db-connection-exhaustion.md) — often follows high CPU as queries slow down and hold connections