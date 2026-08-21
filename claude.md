# CLAUDE.md

## Picking up a ticket

When asked to "pick up", "work on", or "start" a ticket, follow this workflow. Do not skip the sign-off gates.

### Step 2 — Plan the changes

Write a plan covering:

- **Goal** — what "done" looks like, in one sentence.
- **Approach** — the design choices and why.
- **Files** — paths to create or modify, with a note on each.
- **Risks / open questions** — unknowns or trade-offs for the user.
- **Out of scope** — what you're deliberately not doing.

### Step 3 — Present a planned commit list

Commits must be atomic, and the codebase must build/pass tests after each one. For each commit, list its conventional-commit subject, a one-line description, and the files it touches. Flag scaffolding commits.

### Step 4 — Wait for sign off

Stop. Do not implement. Wait for the user to approve, amend, or reject. If they amend, restate the updated plan + commit list and wait again.

### Metadata & orgs — prefer MCP tools over raw `sf` CLI

- **Inspect metadata / object & field schema / query records:** use the `sf-platform` MCP to run SOQL and describe objects against the live org. Prefer this over pulling files down — reach for a retrieve only when you actually need local source to edit or deploy.

For the things `sf-platform` doesn't do — moving source between the org and the local project, and org management — use the metadata MCP tools:

- **Retrieve source to edit:** `retrieve_metadata` — pull components into `src/` (leave `sourceDir`/`manifest` unset to let it compute changes).
- **Deploy source:** `deploy_metadata`.
- **Resolve the target org:** `get_username` (never guess an alias); `list_all_orgs` only when explicitly asked for the full list.
- **Resume a long-running deploy/retrieve:** `resume_tool_operation` with the job id.

## Code Style

- Prettier: 120-char print width, 4-space indent (Apex/HTML)
- JS: single quotes, arrow fn parens always, no trailing commas
- Repo has prettier and eslint

## Core Salesforce Considerations

- Governor limits: strict per-transaction limits (CPU, SOQL, DML, heap)
- Bulkification: always process records in bulk
- All classes, methods and functions should contain documentation. Document Apex with Javadoc, JS with JSDoc. Variables do not require comments provided they are named appropriately
- Prefer class-level sharing settings over "as user"/"WITH SECURITY_ENFORCED"
- Apex Test Standards:
  - Name files [BaseClass]Test, methods itShould[TestCase]
  - Use BDD comments: GIVEN, WHEN, THEN
- Don't add comments (or field descriptions) that refer to changes made during development
- Fail fast: gate expensive work (especially SOQL/DML) behind cheap guard checks placed at the top of the method.
