# Checks

```
node tests/run-all.js          # everything; exits non-zero if anything fails
node tests/run-all.js answers  # one suite
npm test                       # same as run-all
```

No dependencies and no framework — plain Node, and the app's own files loaded
into a `vm` context by `tests/lib/harness.js`. The app has no build step, so
every top-level `const` (`QUESTIONS`, `CONFIG`, `RESULTS_STORAGE_KEY`) has to be
pulled across by name after evaluation; the harness does that, and forgetting it
is the usual reason a new check reports `undefined`.

## The suites

| suite | what it holds the bank to |
| --- | --- |
| `bank-integrity` | every question's answer points at one of its options, no option repeats, money never goes negative or past two decimals, no probability outside 0–1, fraction answers in lowest terms |
| `answers` | answers re-derived from each question's own wording, by a route the generator does not use |
| `hints` | every sum written out inside a hint balances |
| `figures` | drawn figures carry their data in alt text, no label off-canvas or on top of another |
| `variety` | templates still produce genuinely different questions |
| `papers` | length, 60/40 difficulty mix, topic spread, no repeated question or template, passages intact |

## The one rule worth keeping

**A check must reach the answer by a different route from the code it checks.**

`numSmallestEvenFromDigits` shipped wrong in all fifty of its questions. It put
the smallest even digit in the units place and sorted the rest in front — which
reads like a rule, and would have satisfied any check written from the same
idea. It took a child sitting the paper to notice that 4, 8, 1, 7, 9 makes
14,798 and not the 17,894 on offer.

So the checks in `answers.js` do this instead:

- **brute force** where the space is small — every one of the 120 arrangements
  of five digits, every unit cube in an *n*×*n*×*n* solid
- **search** where the question states a relationship — try ages until
  `now + years === 2 × (now − gap)` holds, rather than rearranging it
- **round-trip** where there is a figure — rebuild the net from its alt text and
  answer from that, or measure the angle of a labelled region off the drawn line
  coordinates
- **a different statistic** — Pearson's *r* against a template that decides
  correlation by comparing first and last points
- **evaluation, not string shape** — expand-brackets answers are checked by
  evaluating both sides at six values of *x*

## Traps that have caught me more than once

- `([\d.]+)` swallows a sentence's full stop, and `Number("1.96.")` is `NaN` —
  which surfaces as "cannot read", not as a wrong answer. Use `(\d+(?:\.\d+)?)`.
- Keying a duplicate check on the question stem alone flags every figure-bearing
  template: NVRT reuses 111 stems across 3,956 image variants, and
  `geoNetOppositeSum` prints one sentence and varies only the net. The picture
  belongs in the key — that is what `questionKey()` is for.
- A check that examines zero items must fail, not pass. `hints.js` asserts it
  found sums before reporting that none were wrong.
- When a check fires, find out whether the check or the code is wrong before
  changing either. Several failures here were the check being too crude —
  5-option spelling questions, `meaEstimateSize` comparing metres against
  centimetres, `fracAdd` printing `5/10` on purpose.

## What this does not cover

Rebuilt after the originals were lost, so it is not a restoration. Known gaps:

- Only about 40 of the 376 maths templates have an independent answer check.
  The rest are covered for shape and formatting but not for correctness.
- English is checked for shape only, plus two consistency checks on the newer
  Literary Devices templates. There is no equivalent of `answers.js` for
  comprehension, spelling or grammar, and no check that quoted fragments appear
  in their passage. "Which technique is this" has no independent recomputation —
  the answer is a judgment, and a second judgment written into a test would only
  be the same opinion twice — so those checks confirm the questions are well
  formed and that no single answer dominates the set.
- NVRT is checked for shape only, and cannot take part in the template-spread
  check at all: its questions carry no `template` field, and its images carry no
  alt text.
