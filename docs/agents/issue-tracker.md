# Issue Tracker

Issues are tracked in **Linear** via the MCP integration (`mcp__claude_ai_Linear__*` tools).

- **Team:** Personal
- **Project:** Sisu+

## Workflow

Backlog → Todo → In Progress → In Review → Done (Cancelled for wontfix)

## Creating and updating issues

Use `mcp__claude_ai_Linear__save_issue` to create or update issues. Always set the team to "Personal" and the project to
"Sisu+". Apply the appropriate status per `docs/agents/triage-labels.md`.

## Reading issues

Use `mcp__claude_ai_Linear__list_issues` filtered by team/project. Use `mcp__claude_ai_Linear__get_issue` for a specific
issue.

## Adding comments

Use `mcp__claude_ai_Linear__save_comment` — e.g. when moving to `needs-info`, add a comment asking the reporter for the
missing detail.

## What stays manual

Assigning yourself to issues and moving them to **In Review** or **Done** as you work is still done in the Linear web
app.
