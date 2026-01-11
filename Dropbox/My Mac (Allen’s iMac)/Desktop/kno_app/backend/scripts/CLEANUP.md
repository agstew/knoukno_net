Cleanup notes for untracked files

This repo contained many untracked or stray files (local artifacts, IDE files, large binaries).

Recommended actions:

- Add/update `.gitignore` to exclude local OS and editor files:
  - .DS_Store
  - node_modules/
  - *.log
  - *.pid
  - .env
  - backend/certs/
  - frontend/node_modules/

- Remove large or extraneous files from the working tree (examples):
  ```bash
  # review then remove
  git ls-files --others --exclude-standard | sed -n '1,200p'
  rm -rf backend/admin.html login.html cookies.txt backend/*.log dev-server.pid
  ```

- If you want to remove accidentally added files from history, use `git rm --cached <file>` then commit, or use `git filter-repo` for deep history edits.

Keep sensitive files out of the repo. If `.env` contains real secrets, rotate them now.
