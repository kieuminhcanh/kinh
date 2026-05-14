# Git & Safety

## Git

Never run without explicit owner request:

- `git push --force`, `git push -f`
- `git reset --hard`, `git checkout <branch>`
- `git rebase`, `git merge`
- Any destructive or history-rewriting git command (incl. `git stash drop`, `git clean -fd`, `git tag -d`, `git branch -D`, `git reflog expire`, …)

Allowed read-only: `git status`, `git diff`, `git log`, `git branch --show-current`.

### Manual commits (default)

Owner asks to commit → propose message → wait for approval → run.
Never `git add` files owner did not mention unless they say "stage everything".

### Auto commit+push (spec workflow only)

**Scope gate**: ONLY when an active spec exists under `.ai/specs/NNN-slug/` AND the current edit ticks a T-id checkbox in that spec's `tasks.md`. Non-spec edits → manual rule above.

Per ticked T-id:

1. Run `bun run lint:fix` scoped to files changed in that task only, then `bun run format:fix` with the same file list as positional args.
2. `git add` ONLY files the task touched (per spec `## Plan` touch list + the `tasks.md` checkbox flip).
3. Commit with message format:
   ```
   feat(NNN-slug): T<id> <one-line task description>
   ```
   Examples:
   - `feat(001-rewrite-vitepress): T05 add SettingsDrawer locale switcher`
   - `fix(002-search-i18n): T03 keep query placeholder localized`
     Type prefix: `feat` (new behavior), `fix` (bug fix), `refactor` (no behavior change), `test` (test-only), `docs` (spec/AGENTS edits).
4. `git push` to the current branch (no branch switching, no force).

**Fail handling**: commit OR push fails (hook reject, conflict, network) → STOP immediately, report exact error, do NOT retry, do NOT push partial state. Owner resolves manually.

**Branch policy**: push to whichever branch is currently checked out. Do NOT switch, create, or restrict branches. If owner is on `main`, push goes to `main` — owner's responsibility to be on the right branch before starting spec work.

**Pre-flight check** (run once at start of spec impl session): `git status` to confirm clean tree (no unrelated WIP). Dirty tree with unrelated files → ask owner before proceeding (mixing changes risks committing unrelated work).

## Secrets

This is a static site — **no secrets should ever live in the repo**.

Never read/log/echo/print contents of:

- `.env*` (none expected; if found, flag to owner)
- `*.pem`, `*.key`, `id_rsa*`
- GitHub Actions tokens / Pages deploy secrets

If a future feature needs a secret (e.g. analytics API key, error tracking DSN):

- Spec required (`specs.md`).
- Use GitHub Actions secrets injected at build time as `import.meta.env.VITE_*` (Vite convention).
- Never hardcode. Never commit.

Web Speech API (TTS) runs entirely client-side, no keys.

## Terminal — destructive commands

Never run without explicit owner request:

- `rm -rf /`, `rm -rf ~`, `rm -rf *` outside repo working tree
- `format`, `mkfs.*`, `dd of=/dev/*`
- `shutdown`, `reboot`, `Stop-Computer`, `Restart-Computer`
- `taskkill /F /IM` against system processes
- Disabling firewall, antivirus, UAC
- Touching system-wide config (hosts file, registry, system PATH, services)

Allowed: project-scoped commands per `AGENTS.md` §5 (`bun run *`, `git` read-only per above, `bun run scripts/*.ts`).

## Repo-specific cautions

- `scripts/split-chapters.ts` writes to `<slug>/**/*.md` at repo root — owner approval before re-running (overwrites existing chapter files). Script paths in `sources[]` still reference `content/<slug>/` historically; update before re-running.
- `public/images/**` — owner-curated assets; never auto-generate or delete.
- `<slug>/**/*.md` body — sacred source material. Never auto-edit (AGENTS §2 hard rule #6).
- `.vitepress/cache/` and `.vitepress/dist/` — generated, in `.gitignore`. Never edit by hand.

## GitHub Pages

- Deploy workflow auto-runs on push to `main`. No manual `gh-pages` push — Actions handles it.
- Never commit anything from `.vitepress/dist/` to the repo. It's generated.
- Custom domain change → owner-only (`CNAME` file in `public/` + DNS).
