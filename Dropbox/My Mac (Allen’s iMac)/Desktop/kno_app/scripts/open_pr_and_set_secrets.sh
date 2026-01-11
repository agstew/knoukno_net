#!/usr/bin/env bash
set -euo pipefail

# Helper: create PR and set ADMIN secrets using the GitHub CLI if available.
# Usage:
# 1) Authenticate: `gh auth login`
# 2) Export secrets as env vars or pass nothing to be prompted:
#    export ADMIN_EMAIL=admin@example.com
#    export ADMIN_PASSWORD=supersecret
# 3) Run: ./scripts/open_pr_and_set_secrets.sh

REPO_OWNER="agstew"
REPO_NAME="allengregorystewart"
BASE_BRANCH="agstew-knoukno"
HEAD_BRANCH="feature/submissions-and-tests"
PR_TITLE="Harden admin verifier, fix backend crash, add tests & CI"
PR_BODY_FILE="PR_BODY.md"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install and authenticate with 'gh auth login' to use this script."
  echo "Alternatively, create the PR and set secrets manually via GitHub settings."
  exit 2
fi

echo "Checking gh authentication..."
if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  echo "You are not authenticated to GitHub via gh. Run: gh auth login" >&2
  exit 3
fi

# Set secrets if env vars present
set_secret_if_present() {
  name="$1"
  value="${!1-}"
  if [ -n "${value-}" ]; then
    echo "Setting secret $name via gh..."
    echo -n "$value" | gh secret set "$name"
  else
    echo "Env $name not set; skipping secret creation for $name."
  fi
}

set_secret_if_present ADMIN_EMAIL
set_secret_if_present ADMIN_PASSWORD

echo "Creating PR from $HEAD_BRANCH into $BASE_BRANCH..."
if [ -f "$PR_BODY_FILE" ]; then
  gh pr create --base "$BASE_BRANCH" --head "$HEAD_BRANCH" --title "$PR_TITLE" --body-file "$PR_BODY_FILE"
else
  gh pr create --base "$BASE_BRANCH" --head "$HEAD_BRANCH" --title "$PR_TITLE" --body "See PR_BODY.md in repo."
fi

echo "Done. If the PR was created, CI will run the verifier in dry-run on PRs." 
