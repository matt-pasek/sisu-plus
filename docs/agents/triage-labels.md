# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to Linear statuses.

Since Linear is managed via the web app, these statuses are applied manually.

| Canonical role    | Linear status | Notes                                                 |
| ----------------- | ------------- | ----------------------------------------------------- |
| `needs-triage`    | Backlog       | Maintainer needs to evaluate                          |
| `needs-info`      | Backlog       | Waiting on reporter — add a comment requesting detail |
| `ready-for-agent` | Todo          | Fully specified, an AFK agent can pick it up          |
| `ready-for-human` | Todo          | Requires human implementation                         |
| `wontfix`         | Cancelled     | Will not be actioned                                  |

`ready-for-agent` vs `ready-for-human` is noted in the issue description or a comment — both use **Todo** status.
