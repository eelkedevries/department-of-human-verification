# Task: Complete source rights checks as part of stimulus search

## Goal

Make individual rights verification an automatic image-search responsibility and finish the current twenty-image selection.

## Scope

Apply the owner's requests to add this rule to agent instructions and the stimulus guidelines, then finish the outstanding individual checks. Preserve the existing game and final G01 snapshot.

## Required changes

1. Require agents to verify the exact photograph, creator, original publisher page, applicable licence and permission for intended game use and later AI edits during every search, without a separate request. Record evidence, conditions, reviewer and date before suitable selection or presentation.
2. Keep unresolved candidates in raw only. Search for verified replacements as needed to deliver twenty ranked suitable photographs, preserving the original discovery and review history.
3. Review the current sources, record supported rights decisions and update catalogue metadata, stage selection, append-only history and explanatory documentation together. Keep descriptions and crop-specific limitations accurate.
4. Update the ranked HTML gallery with exactly twenty verified photographs, clickable publisher/licence links, individual evidence and remaining preparation notes. Replace the saved gallery, preserving its identity.
5. Update the specification version/changelog and current-state notes for the earlier rights gate. Enforce that gate in the collection validator.

## Do not implement

- No image manipulation, standardisation, new final sets, game changes or deployment.
- No committed third-party image bytes or HTML gallery; raw/suitable remain linked.
- No fabricated evidence, guessed publisher identities, retrospective approvals or erased history.
- No new test suite.

## Acceptance criteria

- Root and collection agent instructions and the photography guidelines explicitly require automatic individual rights checks during searches.
- Every image counted in the twenty-image gallery has a matched publisher source and recorded reuse/modification evidence; unresolved originals remain traceable in raw and are excluded from suitable.
- The gallery remains numbered, ranked and self-contained, with sixteen bicycles and the four requested distractors.
- Existing published assets, G01 snapshot and game behaviour are unchanged.

## Checks

Run `npm run validate:collection` and `npm run check`. Inspect source evidence, links, stage membership, append-only history and all gallery image/crop records. Confirm no live assets or final snapshot files change.

## Commit and push

If scope is followed and checks pass, commit directly to main using `010_verify_stimulus_search_rights.md` as the exact commit message and push. Do not create a branch or pull request. Do not deploy.

## Final report

End with the report required by `AGENTS.md`, citing the commit and checks and linking the revised gallery.
