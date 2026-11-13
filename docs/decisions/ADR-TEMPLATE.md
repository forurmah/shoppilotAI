# ADR NNNN: [Short, Specific Title Describing the Decision]

<!--
Guidance: Use an active, specific title that summarizes the choice (e.g.,
"Adopt Client-Side URL Search State for Catalog Filters"), not a vague topic
header (e.g., "Routing").
-->

## Status

`Proposed` | `Accepted` | `Deprecated` | `Superseded by [ADR-XXXX](./XXXX-example.md)` | `Rejected`

<!--
Guidance: Use `Accepted` only when the decision is implemented, verified, and
established in the repository. Use `Proposed` if implementation or confirmation
is still pending. Never delete a superseded ADR; update its status to point to
the replacement ADR.
-->

## Date

YYYY-MM-DD

<!--
Guidance: Use ISO 8601 date format (YYYY-MM-DD) reflecting when the decision
was proposed or accepted.
-->

## Context

<!--
Guidance: Describe the technical and product forces at play in the repository
today. Answer:
- What concrete problem or constraint are we solving?
- What parts of the existing codebase, data model, or user experience are
  affected?
- What constraints exist (e.g., runtime environment, bundle size, team size,
  testing expectations, backward compatibility)?

Stay strictly factual and neutral. Avoid advocating for the final choice here.
-->

## Decision Drivers

<!--
Guidance: List the prioritized engineering criteria used to evaluate options.
Examples:
- Testability without DOM or network overhead.
- Type safety and strict compile-time contracts.
- Simplicity and low operational overhead for a single-developer SPA.
- Clear migration path toward backend APIs or multi-page routing.
-->

- [Driver 1]
- [Driver 2]
- [Driver 3]

## Options Considered

<!--
Guidance: Document at least two realistic alternatives (including "do nothing"
or keeping the current approach when applicable). For each option, summarize
how it works and objectively compare its advantages and disadvantages.
-->

### Option 1: [Name of Option]

[Brief description of how this option would be implemented in the repository.]

- **Advantages:**
  - [Advantage]
- **Disadvantages:**
  - [Disadvantage]

### Option 2: [Name of Option]

[Brief description of how this option would be implemented in the repository.]

- **Advantages:**
  - [Advantage]
- **Disadvantages:**
  - [Disadvantage]

## Decision

<!--
Guidance: State the chosen option clearly and unambiguously in one or two
paragraphs. Explain exactly what boundary, pattern, or technology is being
adopted and where it applies in the codebase.
-->

## Rationale

<!--
Guidance: Connect the Decision directly back to the Decision Drivers and Context.
Explain why the chosen option outperformed the alternatives given ShopAI's
current scale, constraints, and goals.
-->

## Trade-offs and Consequences

<!--
Guidance: Be honest about what gets harder, slower, or more verbose because of
this decision. Separate immediate effects from longer-term structural
consequences (positive, neutral, and negative).
-->

- **Positive:** [Expected benefit]
- **Negative / Cost:** [Accepted complexity, boilerplate, or limitation]
- **Future Architectural Impact:** [How this constrains or enables future work]

## Risks and Mitigations

<!--
Guidance: Identify specific failure modes, edge cases, or scaling bottlenecks
introduced by this choice, paired with concrete mitigations.
-->

| Risk | Impact | Mitigation |
|---|---|---|
| [Failure mode or drift risk] | [High / Medium / Low] | [Concrete code, test, or process safeguard] |

## Validation

<!--
Guidance: Specify how we verify that this decision works and continues to be
followed (e.g., unit test suites, integration tests, TypeScript compiler checks,
lint rules, or code review criteria). Reference existing commands or test files
where applicable.
-->

## Review Triggers

<!--
Guidance: Define objective, observable conditions that should prompt the team
to revisit or supersede this ADR (e.g., "When product catalog exceeds 500 items",
"When checkout/authentication requires server synchronization", or "When more
than 3 components share cart state").
-->

- [Condition 1]
- [Condition 2]

## References and Evidence

<!--
Guidance: Link directly to actual repository files, types, functions, tests,
and external specifications that support or implement this decision. Never cite
files or behaviors that do not exist.
-->

- `[path/to/file.ts](../../path/to/file.ts)` — [What this file demonstrates]
