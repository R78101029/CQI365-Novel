---
name: git_sync
description: Synchronize local dev branch with remote main branch
---

# Git Sync Skill

This skill automates the process of updating the local `dev` branch with the latest changes from the remote `main` branch.

## Usage

To sync your current work with the remote main branch:

```powershell
.agent/skills/git_sync/scripts/sync_dev.ps1
```

## Workflow

1.  Checks for uncommitted changes (aborts if any found).
2.  Switches to `main` branch.
3.  Pulls latest changes from `origin main`.
4.  Switches back to `dev` branch.
5.  Merges `main` into `dev`.

## Requirements

- Git must be installed and configured.
- You must be in the root of the repository.
- Working directory must be clean (no uncommitted changes).
