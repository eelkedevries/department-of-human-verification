# Agent instructions

Concise root rules for Claude Code and Codex. Detailed procedures live in the guides under `docs-dev/agent/` — start with `docs-dev/agent/how_to_use.md`. These rules guide behaviour but do not enforce it; safety also relies on checks, hooks, and review.

## Core principles

- One prompt = one reviewable unit. Do only what the prompt or request says; prefer the smallest correct change. No unrequested features, frameworks, tests, or architecture.
- Before editing, briefly state intended files, planned changes, and out-of-scope items.

## Turning intent into prompts

Prompts need not be hand-written. When the user describes a task in plain language, draft the prompt file for them, show the draft, and run it only on approval. For a large or vague goal, first propose a numbered sequence of small prompts and get approval before running any. `scripts/new-prompt.sh <short_name>` scaffolds a prompt manually if preferred.

## Where things live

- `docs-dev/agent/prompts/` — numbered prompt files (work queue and audit trail).
- `docs-dev/agent/` — guides: `how_to_use`, `prompt_authoring_guide`, `prompt_execution_guide`, `prompt_iteration_guide`, `document_contract`, `gpt_author_instructions`.
- `docs-dev/reference/primary_authoritative/specification.md` — binding canon (ground truth).
- `docs-dev/reference/secondary_background/` — non-binding context and examples.
- `docs-dev/planning/current_state.md` — living "where we are"; read at session start.
- `docs/` — user-facing, publishable docs.
- `stimuli/` — the staged stimulus collection, canonical source/version registry, tags and append-only history. Read `stimuli/AGENTS.md` before any stimulus work.
- `.claude/skills/writing-style/` — the personal writing-style skill; it governs prose style for any written output (academic, professional, or essayistic).

If the repository is public, everything in it — including `docs-dev/` — is publicly visible. Never put secrets, tokens, or `.env*` files in the repository. `docs-dev/` must never reach the deployed build output (see `scripts/check-public-build.sh`).

## Ground truth

Treat `primary_authoritative/specification.md` as correct. Never contradict it; if a change would conflict, stop and flag it. Empty or stubbed sections mean "not yet decided" — no constraint. When a decision changes, update the spec and bump its version. `secondary_background/` is informational only.

Update `current_state.md` when a prompt adds a system or a key decision — for genuinely useful orientation, not after routine commits.

## Stimulus collection (mandatory for all AI agents)

Before finding, selecting, generating, standardising, manipulating or publishing any stimulus, read and follow [`stimuli/AGENTS.md`](stimuli/AGENTS.md), [`stimuli/README.md`](stimuli/README.md) and the photography guidelines in `docs/stimuli.md`. All future stimulus work must use this collection; inspect the existing registry before adding duplicates.

Individual rights checks are an automatic part of every image search. Without waiting for a separate request, trace each shortlisted photograph to its original publisher page, match the exact image and creator, check its applicable licence permits the intended game use and later AI manipulation, and record the evidence URLs, conditions, reviewer and date. A stock catalogue's `free` label or a platform's general licence alone is insufficient. Complete these checks before presenting an image as suitable or adding it to `suitable`; retain unresolved candidates only in `raw`, clearly flagged, and continue searching for verified replacements when needed to fulfil the requested selection.

| Level | Organisation and purpose |
|---|---|
| `stimuli/raw/<theme>/` | Linked source candidates with creator, licence evidence, description, tags and original rank |
| `stimuli/suitable/<theme>/` | Reviewed subsets referencing unchanged raw versions, with reasons and unresolved issues |
| `stimuli/standardized/<theme>/` | Committed 512/256 px RGB WebP files ready for selection, with recorded transformations |
| `stimuli/manipulated/<theme>/` | Committed edited masters, including AI instructions, tool/model details, source parents and output hashes |
| `stimuli/final/<theme>/<set-id>/<version>/` | Versioned nine-image selections with actual files, instruction, roles and game-grid mapping |

Use `stimuli/catalogue.json` as the canonical metadata registry, `vocabulary.json` for controlled tags, stage `index.json` manifests for selection and `history.jsonl` for append-only decisions. Keep theme-specific roles separate from actual object type. Preserve source and parent versions. Raw/suitable may remain linked; manipulated/final require repository image files. An edited image must be standardised before final selection. Update the registry, affected stage manifests and history together, verify rights before derivatives or committed third-party bytes, and run `npm run validate:collection` plus `npm run check`. A final set does not by itself change or deploy the game.

## Running and committing (always push directly to `main`)

Default workflow (see `prompt_execution_guide.md` for the full steps):

- Run a prompt: clean tree on `main` → make only that change → run the verify command (Project conventions) and the prompt's checks → if they pass, always push directly to `main`. One commit per prompt; no branch, no pull request.
- **Commit messages:** prompt work uses the exact prompt filename; any other commit uses a conventional prefix (`feat:`, `fix:`, `docs:`, `refactor:`).
- **Always push directly to `main`:** push every commit as soon as it is made. Never a feature branch, never a pull request. `main` and `origin/main` must never diverge, and a task never ends with work committed but unpushed, or edited but uncommitted.
- Do not commit partial or failing work unless a WIP commit is requested. Do not rewrite history or force-push.

## Project conventions

Recorded at setup; these override the defaults above where they differ.

- **Language / locale:** British English in code, comments, and user-facing text.
- **Workflow:** commit and push directly to `main`; no feature branches or pull requests unless explicitly requested.
- **Verify command:** `npm run check` (after the scaffold exists).
- **Testing policy:** no tests unless a prompt asks for them.
- **Deploy base path:** `/department-of-human-verification/`

## Supporting guides

`how_to_use.md` (map + daily loop), `prompt_authoring_guide.md` (writing prompts), `prompt_execution_guide.md` (running them), `prompt_iteration_guide.md` (supersede/revert), `document_contract.md` (what documents the project expects), `reviews/code_review_guide.md` (reviews).

## Final response

Every response must end with this five-section report:

### 1. Work done
`Completed successfully`, `Partially completed`, or `Not completed` — and whether all acceptance criteria were met. Cite the commit hash and the result of the verify command / checks as evidence.

### 2. Files changed
Every file added, modified, or deleted, one line each. `None.` if no changes.

### 3. Scope deviations
Any work outside the prompt's `Required changes`, with a reason. `None.` if scope was followed exactly.

### 4. Open issues
List issues, or `None.`

### 5. Human actions required
List required actions, or `None. You can proceed to the next prompt.`
