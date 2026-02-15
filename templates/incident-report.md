# Incident Report: [Short Title]

## Summary

| Field | Detail |
|-------|--------|
| **Incident ID** | INC-XXX |
| **Date** | YYYY-MM-DD |
| **Duration** | X hours Y minutes (HH:MM — HH:MM IST) |
| **Severity** | P0 / P1 / P2 / P3 |
| **Affected Services** | List affected services |
| **Affected Clients** | Who was impacted and how |
| **On-Call / First Responder** | Name |
| **Report Author** | Name |
| **Report Date** | YYYY-MM-DD |

---

## 1. What Happened (User-Visible Impact)

_Describe what users experienced in plain language. A non-technical person should understand this section._

_Example: "Field surveyors were unable to upload shelf photos through the mobile app. The portal dashboard showed errors for all users. Metabase analytics were inaccessible."_

---

## 2. Timeline

_List events in chronological order. Include timestamps in IST. Mark response actions clearly._

| Time (IST) | Event |
|------------|-------|
| HH:MM | First signs of degradation |
| HH:MM | Alerts triggered / issue noticed |
| HH:MM | **ACTION:** [What was tried] → **RESULT:** [Did it work?] |
| HH:MM | **ACTION:** [What was tried] → **RESULT:** [Did it work?] |
| HH:MM | Root cause identified |
| HH:MM | Fix applied |
| HH:MM | Full recovery confirmed |

---

## 3. Root Cause Analysis

### Primary Root Cause

_What was the fundamental cause of the incident? Explain the technical mechanism._

### Contributing Factors

_What other conditions made this worse or allowed it to happen?_

- **Factor 1:** [Description]
- **Factor 2:** [Description]
- **Factor 3:** [Description]

### Why Wasn't This Caught Earlier?

_What monitoring, alerts, or processes failed to detect this before it became an outage?_

---

## 4. Resolution

### What Fixed It

_What specific action resolved the incident?_

### What Did NOT Fix It

_List actions that were attempted but did not resolve the issue. This is valuable for future responders._

| Action Attempted | Why It Didn't Work |
|-----------------|-------------------|
| [Action] | [Reason] |

---

## 5. Impact Assessment

| Metric | Value |
|--------|-------|
| Total downtime | X hours Y minutes |
| Users affected | Approximate count |
| Requests failed | Count if available |
| Data loss | Yes/No — describe if yes |
| Client escalations | List any |
| Revenue impact | Estimate if applicable |

---

## 6. Action Items

_Every action item must have an owner and a deadline. Track completion status here and in your project management tool._

### Immediate (This Week)

| # | Action | Owner | Deadline | Status | Ticket |
|---|--------|-------|----------|--------|--------|
| 1 | [Action description] | [Name] | YYYY-MM-DD | ⬜ Pending | [Link] |
| 2 | [Action description] | [Name] | YYYY-MM-DD | ⬜ Pending | [Link] |

### Short-Term (This Month)

| # | Action | Owner | Deadline | Status | Ticket |
|---|--------|-------|----------|--------|--------|
| 3 | [Action description] | [Name] | YYYY-MM-DD | ⬜ Pending | [Link] |

### Long-Term (This Quarter)

| # | Action | Owner | Deadline | Status | Ticket |
|---|--------|-------|----------|--------|--------|
| 4 | [Action description] | [Name] | YYYY-MM-DD | ⬜ Pending | [Link] |

_Status key: ⬜ Pending | 🔄 In Progress | ✅ Complete | ❌ Won't Do (explain why)_

---

## 7. Lessons Learned

_What did we learn? What would we do differently next time? Keep these concise and actionable._

1. **[Lesson title]:** [Explanation]
2. **[Lesson title]:** [Explanation]

---

## 8. Evidence

_Reference screenshots, logs, and monitoring data stored in the `evidence/` folder._

| Figure | Description | File |
|--------|------------|------|
| Fig 1 | [Description] | [evidence/filename.png](evidence/filename.png) |
| Fig 2 | [Description] | [evidence/filename.png](evidence/filename.png) |

---

## Postmortem Meeting

| Field | Detail |
|-------|--------|
| **Date** | YYYY-MM-DD |
| **Attendees** | Names |
| **Notes** | See `postmortem-notes.md` or summarize key discussion points here |

---

_Last updated: YYYY-MM-DD_