# Choice prompt format

Use when asking owner to pick between options. Compact → short reply token (`1a 2b 3c`).

## Rules

- Wrap entire block in fenced code block (renderer collapses list items otherwise).
- Plain text inside block, no markdown list syntax.
- Question on own line: `1.` `2.` …
- Options indented 3 spaces: `a.` `b.` …
- Blank line between questions.
- No bullets (`-`, `*`) for options.
- No inline options (`a. X b. Y`).
- No option on same line as question.

## Recommendation marker

When the AI has a preferred option, mark it with `★` next to the letter. Always include a short reason line under the question block.

Reason line follows reply language (per `tone.md`):

- Vietnamese → `→ Đề xuất X. Lý do: …`
- English → `→ Recommend X. Reason: …`

If the AI presents recommendations for every question, **summarise the full pick string at the end** (e.g. `Tóm tắt đề xuất: 1b 2a 3a` / `Summary: 1b 2a 3a`).

## Reply pattern

- `1a 2b 3c` → ordered picks.
- `1a 2b 4a` + free text for missing number → custom answer for that one.
- `OK` / `ok` / `đồng ý` (alone) → accept all AI recommendations (the `★` picks). Only valid when every question has a `★` and a summary line was provided.

## Template

Note: the block below is what the owner sees rendered. It is not a code block the AI generates with a project path — the wrapping fence is the format itself.

````
```
Confirm choices (★ = AI recommendation):

1. [Question]
   a. [Option]
   b★ [Option]
   → Đề xuất b. Lý do: [short reason]

2. [Question]
   a★ [Option]
   b. [Option]
   → Đề xuất a. Lý do: [short reason]
```

Tóm tắt đề xuất: 1b 2a — reply `OK` to accept all.
````

## Bad

```
1. [Question]
  - a. [Option]
  - b. [Option]

1. [Question] a. [Option] b. [Option]
```
