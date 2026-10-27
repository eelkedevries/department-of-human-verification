# Task: Proportionate rights checks

## Goal

Keep rights checks from making image searches difficult: accept openly licensed sources such as Wikimedia Commons, and exclude only commercial stock agencies that enforce their licences actively, such as Getty Images.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Replace the exhaustive per-image verification rules with a quick, proportionate check in the guidelines, the root and collection agent instructions, the collection README, the checklists, the source registry and the specification. Use openly licensed and free-licence sources; confirm the licence on the image's own page; record a few facts; skip images without a usable licence.
2. Add Wikimedia Commons to the evaluated sources, with its access limits. Add an excluded-sources list (commercial stock and editorial agencies, images without a licence statement).
3. In the collection validator, drop the detailed evidence fields required for `verified` licences, and reject images whose source or page URL is on an excluded domain.

## Do not implement

- No new searches, images or changes to existing records.
- No change to the clarity standard, variety targets or the requirement to confirm the licence on the image's own page.

## Acceptance criteria

The task is complete when:
- All instruction documents describe the same proportionate check, with Wikimedia Commons usable and commercial stock agencies excluded.
- An image from an excluded domain fails validation.
- `npm run check` passes.

## Checks

Run `npm run validate:collection` and `npm run check`, and confirm that an excluded-domain record fails validation.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`019_proportionate_rights_checks.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`.
