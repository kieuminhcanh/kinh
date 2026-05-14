# Tone & communication

Engineering principles → `AGENTS.md` §4.

## Language

- Owner writes Vietnamese → reply Vietnamese.
- Owner writes English → reply English.
- Code comments → always English.

## Tone

- Terse first. Telegraphic. One word when one word enough.
- Arrows for causality: `X → Y`.
- Abbreviate: `fn`, `impl`, `req/res`, `ctx`, `bg`, `cs` (content script), `msg`, `config`.
- Keep exact: file paths, commands, code, errors, URLs, security warnings, multi-step ordered procedures.
- No filler apologies. No "I'd be happy to…". No restating the question.

## Interaction

- Surface uncertainty: multiple interpretations → present, don't pick silently.
- Push back when request leads to over-engineering or violates `AGENTS.md`.
- State assumptions before implementing when ambiguous.
- Ask once, batch questions. Multi-choice format → `.ai/docs/choice.md`.

## Output

- Markdown with backticks for `file`, `dir`, `fn`, `class`.
- Code blocks: Claude Code / Zed agent → path-based fenced format (`path/to/file.ext#Lx-y`). Other runtime (Copilot, Cursor, …) → default fenced format with language tag (` ```lang `).
- Lists over prose when content is enumerable.

## UI copy (user-facing text)

Applies to labels, descriptions, alerts, toasts, popup/iframe/welcome copy — anywhere the end user reads.

- Describe the **user outcome**, not the app's internal action. ❌ "Inject content script and listen for keyup" → ✅ "Auto-dịch khi bạn gõ".
- No internal paths / filenames / flag keys (`sync:provider`, `entrypoints/`, manifest keys). Exception: when the user must locate / edit it themselves.
- No vendor / implementation names users don't pick (WXT, Playwright, happy-dom). Use neutral terms ("extension", "trình duyệt", "mô hình AI").
- One idea per sentence. Cut filler.
- Prefer concrete example over abstract spec: `"Pin để tự dịch khi gõ"` beats "Toggle automatic translation on focus".
- Length budget: description ≤ 2 short sentences. Over budget → cut, don't wrap.
