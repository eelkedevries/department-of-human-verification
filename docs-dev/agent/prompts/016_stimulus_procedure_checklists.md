# Task: Mandatory stimulus procedure checklists

## Goal

Ensure every stimulus procedure ends with a complete, reported check, including set-level variety, so that per-image checks cannot hide set-level failures.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Add `stimuli/CHECKLISTS.md` with checklists for search and selection, rejection, standardisation, AI editing and final sets, plus a closing checklist for every procedure.
2. Add measurable set-level variety targets (view, facing direction, colour, support and backdrop) to the photography guidelines, and make the search step plan and vary searches against them instead of favouring side profiles.
3. Require the checklists in `stimuli/AGENTS.md`, the root `AGENTS.md` (including the final report) and `stimuli/README.md`; record the decision in the specification.

## Do not implement

- No changes to collection records or images; the current selection is not reworked here.
- No validator enforcement of visual judgements.

## Acceptance criteria

The task is complete when:
- Agents are directed to complete and report the matching checklist before finishing any stimulus procedure.
- The variety targets are measurable and linked from the checklists and the search step.
- `npm run check` passes.

## Checks

Run `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`016_stimulus_procedure_checklists.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`.
