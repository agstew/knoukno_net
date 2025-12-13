#!/usr/bin/env bash
set -euo pipefail

# scripts/smoke_csrf.sh
# Quick smoke test to reproduce and debug CSRF token flow against local backend.
# Usage:
#   ./scripts/smoke_csrf.sh [email] [password]
# Defaults: email=you@example.com password=badpassword

EMAIL=${1:-you@example.com}
PASSWORD=${2:-badpassword}
BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)/backend"

cd "$BACKEND_DIR"

echo "Running CSRF smoke test against http://localhost:3000"

echo "1) GET /auth/csrf-token -> save cookies to cookies.txt and JSON to csrf.json"
curl -sS -c cookies.txt http://localhost:3000/auth/csrf-token -o csrf.json

echo
echo "--- csrf.json ---"
cat csrf.json || true
echo
echo "--- cookies.txt ---"
cat cookies.txt || true

echo
# extract token
if command -v jq >/dev/null 2>&1; then
  CSRF=$(jq -r '.csrfToken' csrf.json)
else
  CSRF=$(sed -En 's/.*"csrfToken"[[:space:]]*:[[:space:]]*"([^\"]*)".*/\1/p' csrf.json | sed -n '1p')
fi

if [[ -z "$CSRF" || "$CSRF" == "null" ]]; then
  echo "ERROR: could not extract csrf token (csrf.json contents above). Aborting."
  exit 2
fi

echo "Using CSRF token: $CSRF"

echo
echo "2) POST /auth/login using same cookie jar (will print full HTTP response)"
curl -i -b cookies.txt -c cookies.txt -L -v \
  -X POST http://localhost:3000/auth/login \
  -F "_csrf=$CSRF" \
  -F "email=$EMAIL" \
  -F "password=$PASSWORD" 2>&1 | tee post_response.txt

echo
echo "--- POST response (post_response.txt) ---"
cat post_response.txt || true

echo
echo "If you still see {\"error\":\"Invalid CSRF token\"}, please paste the following files or command outputs into the chat:"
echo "  - backend/server.run.log (or the terminal output where server is running)"
echo "  - scripts output files: csrf.json, cookies.txt, post_response.txt"
echo
echo "To make the script executable (once) run: chmod +x scripts/smoke_csrf.sh"

echo "Done."
