#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="${1:-dist}"

test -d "$BUILD_DIR" || {
  echo "Build directory not found: $BUILD_DIR" >&2
  exit 1
}

echo "Inspecting build output: $BUILD_DIR"

fail=0

matches="$(find "$BUILD_DIR" \( \
    -iname '*docs-dev*' -o \
    -iname '*.env*' -o \
    -iname '*prompt_*_guide*' -o \
    -iname 'AGENTS.md' -o \
    -iname 'CLAUDE.md' \
  \) -print)"
if [[ -n "$matches" ]]; then
  printf 'Potential private files found in build output:\n%s\n' "$matches" >&2
  fail=1
fi

maps="$(find "$BUILD_DIR" -type f -name '*.map' -print)"
if [[ -n "$maps" ]]; then
  printf 'Source maps found in build output and may leak source:\n%s\n' "$maps" >&2
  fail=1
fi

if grep -RIl --binary-files=without-match \
     -e 'docs-dev' \
     -e 'prompt_authoring_guide' \
     -e 'prompt_execution_guide' \
     -e 'prompt_iteration_guide' \
     "$BUILD_DIR" >/dev/null 2>&1; then
  refs="$(grep -RIl --binary-files=without-match \
            -e 'docs-dev' \
            -e 'prompt_authoring_guide' \
            -e 'prompt_execution_guide' \
            -e 'prompt_iteration_guide' \
            "$BUILD_DIR")"
  printf 'Potential private workflow references inside build files:\n%s\n' "$refs" >&2
  fail=1
fi

# Version 1 promises no camera, no tracking and no data leaving the device. These
# APIs have no place in its build; version 2 will replace this rule with a check
# that they appear only in the opt-in eye-tracking chunk.
v1_forbidden='getUserMedia|mediaDevices|webgazer|sendBeacon|XMLHttpRequest|new WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie'
hits="$(grep -RIlE --binary-files=without-match "$v1_forbidden" "$BUILD_DIR" || true)"
if [[ -n "$hits" ]]; then
  printf 'Version 1 build uses camera, tracking, storage or network-submission APIs:\n%s\n' "$hits" >&2
  grep -RIoE --binary-files=without-match "$v1_forbidden" "$BUILD_DIR" | sort | uniq -c >&2
  fail=1
fi

# Every asset reference must resolve under the deploy base path.
BASE_PATH="${BASE_PATH:-/department-of-human-verification/}"
if [[ -f "$BUILD_DIR/index.html" ]] && grep -oE '(src|href)="/[^"]*"' "$BUILD_DIR/index.html" | grep -v "=\"$BASE_PATH" >/dev/null; then
  printf 'index.html references paths outside %s:\n' "$BASE_PATH" >&2
  grep -oE '(src|href)="/[^"]*"' "$BUILD_DIR/index.html" | grep -v "=\"$BASE_PATH" >&2
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "Public build check completed."
