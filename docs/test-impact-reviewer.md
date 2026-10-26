# Stage 2, test-impact-reviewer mutation test: writeup for grading

## Design notes

Per the Stage 2 task brief, Stage 1 originally gave the agent Bash access guarded by a read-only hook. The final agent, as it stands in this repo, has no Bash and no hook at all: `.claude/agents/test-impact-reviewer.md`'s frontmatter lists `tools: Read, Grep, Glob`, and its body states directly, "You have no Bash and no hook: you cannot run tests, run git, or execute any command." Both of those are verified against the agent file as committed. The Stage 1 detail (Bash behind a hook guard) is carried over from the task brief itself; it predates this session and nothing in the current repository confirms or contradicts it, since no hook file of any kind exists under `.claude/`.

Step 0's tool verification below (the agent listing `Read, Grep, Glob, SubagentHandback` and stating Bash was not among them) was the agent's own self-report, not an independent check from outside the agent.

## Setup

**Agent config:** `.claude/agents/test-impact-reviewer.md`, tools restricted to `Read, Grep, Glob` (no Bash). Confirmed at Step 0, the agent, asked to list its own tools before any review work, reported `Read, Grep, Glob, SubagentHandback` and explicitly stated Bash was not among them.

**Mutation diff** (on a throwaway branch, reverted afterward, `main` never carried these changes):

```diff
diff --git a/pages/InventoryPage.ts b/pages/InventoryPage.ts
--- a/pages/InventoryPage.ts
+++ b/pages/InventoryPage.ts
@@ -3,7 +3,7 @@
 export class InventoryPage {
   readonly page: Page;
-  readonly inventoryItems: Locator;
+  readonly inventoryList: Locator;
   readonly cartBadge: Locator;
@@ -11,7 +11,7 @@
   constructor(page: Page) {
     this.page = page;
-    this.inventoryItems = page.locator('.inventory_item');
+    this.inventoryList = page.locator('.inventory_item');
@@ -19,7 +19,7 @@
   private itemByName(name: string): Locator {
-    return this.inventoryItems.filter({ hasText: name });
+    return this.inventoryList.filter({ hasText: name });
   }
@@ -35,8 +35,9 @@
     await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
   }
-  async openCart(): Promise<void> {
-    await this.cartLink.click();
+  async expectFirstItemName(name: string): Promise<void> {
+    const names = this.page.locator('.inventory_item_name');
+    await expect(names.first()).toHaveText(name);
   }
@@ -80,7 +81,7 @@
   async expectPrices(expected: Record<string, number>): Promise<void> {
-    await expect(this.inventoryItems.first()).toBeVisible();
+    await expect(this.inventoryList.first()).toBeVisible();
```

Three deliberate mutations:

- **(a)** rename `inventoryItems` to `inventoryList`, a locator used only inside other page-object methods (`itemByName`, `expectPrices`), tests the agent's ability to trace a **transitive** chain with no direct spec reference.
- **(b)** add `expectFirstItemName()`, a public method no spec calls, tests detection of **uncovered, dead** code.
- **(c)** remove `openCart()`, a method called directly by 6 spec call sites across 4 files, tests detection of a **likely break**.

## Grading criteria

From the original Stage 2 instructions:

1. (a) caught transitively, with the full chain
2. (b) caught as uncovered
3. (c) caught as a likely break
4. "No usage found" claims backed by the literal searches run
5. No claims that any test passes or fails
6. No hallucinated file:line citations

## Round-by-round results

| Round | Gap found | Fix applied to agent prompt |
|---|---|---|
| 1 (baseline) | (a) caught, but tagged loosely, not with the closed vocabulary; (b) tagged `[NO USAGE FOUND]` only, missing `[UNCOVERED]`; chain for (a) not fully resolved to spec citations for every hop | Closed the tag vocabulary; required every hop in a chain to cite its own spec call sites, not just one example generalized to the rest |
| 2 | (a) now correctly tagged; dual-tag rule for (b) still not honored (one tag only) | Added an explicit dual-tag requirement with a worked example, requiring both `[UNCOVERED]` and `[NO USAGE FOUND]` together for a new, fully unreferenced symbol |
| 3 | Dual-tag fixed; found a new issue, call-site lists for `addItemToCart` were incomplete, with hedged completeness such as "would confirm counts" | Required the agent to run Grep per symbol immediately before writing its list, and count the result lines against what it wrote |
| 4 | New issue: the Summary tag for the rename literally contradicted its own Details paragraph (Summary said `[UNCOVERED]`, Details explicitly concluded `[UNCOVERED]` did not apply) | Required Summary tags to be a direct restatement of the Details conclusion, decided before writing; forbade a draft then "revised" Summary |
| 5 | Self-correction pattern recurred in a different shape, the model wrote a wrong Summary, then a second "Revised Summary (final)" lower in the same report | Forbade writing more than one Summary section; required research to be fully settled before any part of the report is written |
| 6 | Most serious finding: the agent falsely claimed `expectItemVisible` had "no other matches found anywhere in the repo," independently verified via a direct Grep that it actually has 4 real spec call sites. A false negative of this kind is the most dangerous failure mode for this agent's stated purpose. | Required that any "no matches," `[UNCOVERED]`, or `[NO USAGE FOUND]` claim be backed by a same-turn, unrestricted-path Grep call, stated explicitly enough to be re-run and verified |
| 7 | False negative recurred for the same symbol (`expectItemVisible`) in a different run; `addItemToCart`'s list was also incomplete again | Required the actual literal Grep output to be pasted as a fenced code block immediately before any conclusion drawn from it, not paraphrased |
| 8 | Fenced block was present but fabricated: it contained an inline bracketed self-correction note no real tool output would ever contain, alongside a hallucinated line | Forbade any edits or annotations inside a pasted block; required re-running Grep rather than hand-correcting a quoted result |
| 9 | Full enumeration and no false negative, but the mandatory fenced-block format was dropped for most lists, reverting to bullet paraphrase, which is how a drop keeps slipping through undetected | Added an explicit, non-negotiable formatting rule: every hop's call-site list must be a fenced block of literal tool output, no exceptions, with an instruction to self-interrupt if about to type a bullet instead |
| 10 | Format rule ignored again; `addItemToCart` missed `error-user.spec.ts:47` (listed only 2 of 3 real call sites there) | No further prompt edit attempted at this point, flagged as a diminishing-returns pattern rather than continuing to patch indefinitely |
| 11 | Re-run (same prompt, no edit): fully clean, fenced blocks used consistently, all previously fragile lists complete and verified (`addItemToCart` 13 of 13, `expectItemVisible` 4 of 4, `openCart` 6 of 6), correctly filtered out a spurious self-match in its own prompt file, no Summary/Details contradiction, correct dual-tagging | None |
| 12 | Confirming re-run: fully clean again, same checks re-verified independently | None |

## Final verdict

All six grading criteria are satisfied in the two most recent runs, each independently re-checked against ground truth (direct Grep calls against the real `tests/` files, compared line by line):

1. (a) caught as `[TRANSITIVE IMPACT]`, full chain resolved hop by hop (`inventoryList` to `itemByName` to `addItemToCart`, `removeItemFromCart`, `expectItemVisible`, `expectPrices` to real spec files), every hop backed by its own cited call sites.
2. (b) caught with both `[UNCOVERED]` and `[NO USAGE FOUND]` shown together, literally.
3. (c) caught as `[LIKELY BREAK]`, all 6 real call sites across `cart.spec.ts`, `checkout.spec.ts`, `problem-user.spec.ts`, `error-user.spec.ts` cited correctly.
4. Every "no usage found" claim backed by a stated, literal, re-runnable Grep call.
5. No pass/fail claims in any of the 12 rounds, the agent consistently stated it has no way to know runtime outcomes.
6. No hallucinated file:line citations survived in the final two rounds (earlier rounds did produce some, see the round-by-round table).

**Caveat:** stability across exactly two clean runs is evidence, not a guarantee. Rounds 6 through 10 show the same class of failure (dropped citations, false negatives under list-enumeration load) recurring intermittently across multiple "fixed" states, each time in a new shape. For regular use rather than a one-off review, a built-in self-verification pass (re-grep and count-check before finalizing) or periodic spot-checking of high-call-count citations is recommended, rather than trusting prompt engineering alone to have fully eliminated the failure mode.
