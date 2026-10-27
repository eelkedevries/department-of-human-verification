# Task: Search for clear replacement photographs

## Goal

Restore twenty suitable bicycle-theme photographs, all meeting the target clarity standard and individually rights-verified.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Search for like-for-like replacements of the sixteen photographs rejected for clarity: fourteen bicycle targets, a motorcycle and a small car. Screen at thumbnail size, plan a square crop that meets the standard, and verify each shortlisted photograph's publisher page, creator, licence and image identity.
2. Register the replacements as raw and suitable versions, with crop, characteristics, clarity and rights reviews, licence conditions and history. Re-rank the four retained photographs among them.
3. Record the evidence in a dated rights review, and update the collection documentation, current state and the generated gallery.

## Do not implement

- No standardisation, editing, final sets, game changes or deployment.
- No committed third-party image bytes.
- No changes to rejected or withdrawn records.

## Acceptance criteria

The task is complete when:
- Suitable holds twenty photographs that meet the target clarity standard: sixteen bicycles, a motor scooter, a motorcycle, a skateboard and a small car.
- Every new photograph has a matched publisher page, recorded licence evidence and conditions, a proposed crop and a clarity assessment.
- `npm run validate:collection` and `npm run check` pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`015_search_clear_replacements.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`.
