# Runbook: Database Connection Exhaustion

## Symptoms

- Backend logs show: `Error: timeout exceeded when trying to connect at pg-pool/index.js`
- Backend logs show: `Error: connect ECONNREFUSED <db-ip>:5432`
- Cloud Run services returning HTTP 400/500 with fast response times (< 50ms)
- Cloud SQL dashboard shows peak connections near or exceeding 600

## Severity Assessment

If ALL services are returning errors → **P0**, follow this runbook immediately.
If only some endpoints are slow → **P1**, you have more time to investigate.

## Step-by-Step Diagnostic

### Step 1: Confirm it's a database issue (2 minutes)

Check Cloud SQL dashboard: Console → SQL → gcp-db-1 → Overview

Look at:
- **Peak connections** — is it near/above 600? → Connection exhaustion confirmed
- **CPU utilization (P99)** — is it above 90%? → Likely cause of slow queries holding connections
- **Deadlock count** — is it above 0? → Go to deadlock runbook (rare)

If connections are fine and CPU is fine, the problem is likely NOT the database. Check Cloud Run logs instead.

### Step 2: Check what's consuming connections (3 minutes)

Connect to the database and run:

```sql
-- Total connections right now
SELECT count(*) FROM pg_stat_activity;

-- Connections grouped by database (find who's using the most)
SELECT datname, count(*) 
FROM pg_stat_activity 
GROUP BY datname 
ORDER BY count DESC;

-- Connections grouped by state (find stuck connections)
SELECT state, count(*) 
FROM pg_stat_activity 
GROUP BY state 
ORDER BY count DESC;
```

If you see many connections in `idle in transaction` state → a query or process opened a transaction and never closed it. Go to Step 3.

If you see many connections in `active` state → queries are running slow. Go to Step 4.

### Step 3: Find and kill idle transactions (2 minutes)

```sql
-- Find the oldest idle-in-transaction connections
SELECT pid, usename, application_name, datname,
       now() - xact_start AS transaction_age,
       now() - query_start AS query_age,
       state, left(query, 100) AS query_preview
FROM pg_stat_activity
WHERE state = 'idle in transaction'
ORDER BY xact_start ASC
LIMIT 10;
```

If any transaction has been open for more than 5 minutes, it's likely the problem. Kill it:

```sql
-- Kill a specific connection (replace PID)
SELECT pg_terminate_backend(<pid>);
```

If it's a replication-related process (application_name contains 'walreceiver' or 'walsender'), consider stopping the replica entirely via Cloud SQL Console.

### Step 4: Find slow/long-running queries (2 minutes)

```sql
-- Find the longest-running active queries
SELECT pid, usename, application_name, datname,
       now() - query_start AS duration,
       state, left(query, 200) AS query_preview
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC
LIMIT 10;
```

If any query has been running for more than 5 minutes:
- Note the `application_name` and `query_preview` for the report
- Kill it: `SELECT pg_terminate_backend(<pid>);`
- If it's a Metabase query (check `usename` or `application_name`), consider temporarily blocking Metabase access

### Step 5: Check for table bloat (if CPU is high) (5 minutes)

```sql
-- Check oldest transaction age (vacuum blocker)
SELECT pid, usename, application_name, backend_type,
       now() - xact_start AS transaction_age
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start ASC
LIMIT 5;
```

If oldest transaction is hours old → this is blocking autovacuum → tables are bloated → queries scan too much data → CPU high.

Kill the old transaction and then force a vacuum on the most impacted tables:

```sql
VACUUM (VERBOSE) image_collections;
VACUUM (VERBOSE) image_containers;
VACUUM (VERBOSE) visits;
VACUUM (VERBOSE) assigned_surveys;
```

### Step 6: Emergency — if nothing above works

If killing queries and connections doesn't help:

1. **Check if a read replica exists** — Cloud SQL Console → Replicas. If yes, stop it immediately.
2. **Check temp file usage** — Look for `LOG: temporary file` entries in Cloud SQL logs. High temp file count = queries spilling to disk = increase `work_mem`.
3. **As a last resort**, restart the database. But be aware: this causes a brief complete outage and does NOT fix bloat or configuration issues.

## Things That Will NOT Fix This

| Action | Why It Won't Work |
|--------|------------------|
| Rolling back the backend | If the DB is the problem, app code changes don't help |
| Adding more CPU cores | More CPU doesn't help if queries scan bloated tables |
| Restarting the database | Bloat persists across restarts |

## Prevention Checklist

After resolving the incident, ensure these are configured:

- [ ] `statement_timeout = 60s`
- [ ] `idle_in_transaction_session_timeout = 300s`
- [ ] `work_mem = 64MB` (or appropriate for your instance)
- [ ] Alerts on: CPU > 80%, connections > 500, oldest transaction > 120s
- [ ] Metabase pointing to a read replica, not the primary
- [ ] Dev databases on a separate instance

## Related Incidents

- [INC-001: Production DB outage — Feb 12, 2026](../incidents/2026/INC-001-db-outage/report.md)