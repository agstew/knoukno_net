Verifier scripts

- `verify_admin_links.sh` — the active verifier (node-based extraction). Logs in (CSRF-aware), fetches `/admin`, extracts anchor `href`s using Node (avoids shell/Perl quoting issues), and HEADs each link to record HTTP results. Saved output paths are printed when run.

Backups / alternates

- `verify_admin_links.sh.bak` — original perl-based verifier (kept as backup).
- `verify_admin_links_fixed.sh` — intermediate attempted fix (kept for reference).
- `verify_admin_links_node.sh` — alternate node-based script (functionally equivalent to the active script).

Usage

Make executable and run from `backend`:

```bash
chmod +x scripts/verify_admin_links.sh
./scripts/verify_admin_links.sh
```

Notes

- The scripts use local dev credentials stored in the development DB. They require the backend to be running on `https://localhost:3000` with valid dev certs (or `curl -k`).
- Programmatic POSTs require extracting the page-specific CSRF token (the scripts extract the CSRF meta tag from pages). Be careful with destructive endpoints.
