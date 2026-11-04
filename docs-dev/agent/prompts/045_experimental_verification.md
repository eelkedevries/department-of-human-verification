# Task: Complete Experimental browser verification

## Goal

Resolve issues found by CI for `044_experimental_mode.md` before deployment.

## Required changes

- Make the review test select the actual precedent image by its identifier, independently of its shuffled grid position.
- Let responsive images settle on their source before decoding, including cached images when a shared case is replayed in Firefox. Keep the existing image-failure recovery and start the assessment clock only after decoding.
- Retain the existing Standard, Experimental, phone, keyboard, accessibility and privacy checks.

## Checks and delivery

Run `npm run check` and `git diff --check`, commit and push directly to `main` with `045_experimental_verification.md` as the message, and verify the complete CI suite. Deploy only after the checks pass, using the existing SiteGround workflow. Report its verified result.
