# Architecture Decision Records (ADRs)

This directory contains the engineering decision log for **ShopAI** (implemented in this repository as **ShopPilot AI**).

## What Are Architecture Decision Records?

An Architecture Decision Record (ADR) is a short, immutable Markdown document that captures a single significant architectural or technical decision, along with its context, the alternatives considered, the rationale behind the chosen approach, and its expected trade-offs and consequences.

Unlike general documentation or READMEs that describe *what* the system currently does, ADRs preserve *why* the system was shaped a particular way at a specific point in time.

## Why ShopAI Uses ADRs

ShopAI is built as an evolving, production-minded e-commerce codebase and engineering portfolio project. Maintaining an ADR log serves four practical goals:

1. **Preserve Architectural Intent:** Prevent future contributors (or future iterations of the author) from accidentally undoing deliberate constraints—such as integer-cents pricing, immutable state helpers, or storage validation boundaries—without understanding why they exist.
2. **Make Trade-offs Explicit:** Every technical choice incurs debt or complexity elsewhere. ADRs force clear documentation of downsides, risks, and review triggers before complexity compounds.
3. **Support Incremental Evolution:** As ShopAI grows from a client-side React SPA into a full-featured storefront (e.g., routing, server APIs, checkout, authentication, or AI shopping assistance), ADRs provide a clear trail of how and when architectural boundaries shift.
4. **Demonstrate Engineering Judgment:** Provide concrete, evidence-backed records of technical reasoning, trade-off analysis, and verification standards.

## When to Create an ADR

Create a new ADR whenever a change introduces, alters, or removes a structurally significant boundary or convention. Examples include:

- Adopting or replacing a core framework, build tool, styling approach, or testing strategy.
- Changing state management architecture (e.g., moving from local `useState` to React Context, URL state, or an external store).
- Introducing client-side persistence, backend APIs, databases, or authentication flows.
- Defining core domain data models or cross-feature contracts (e.g., catalog schemas, pricing units, or cart item structures).
- Establishing repository-wide conventions for folder structure, error handling, or separation of concerns.

Do **not** create an ADR for routine bug fixes, isolated UI copy tweaks, minor CSS adjustments, or straightforward feature additions that follow already-documented patterns.

## Numbering Conventions

- ADRs are numbered sequentially using four zero-padded digits: `0001`, `0002`, `0003`, etc.
- Standard naming pattern for new decisions: `NNNN-short-kebab-case-title.md` (for example, `0002-client-side-routing-strategy.md`).
- Note: The inaugural record (`0001-first-architectural-decision.md`) uses the bootstrap filename established during repository setup.
- ADR numbers are never reused, even if a decision is rejected or later superseded.

## Decision Lifecycle

Every ADR carries one of the following statuses:

| Status | Meaning |
|---|---|
| **Proposed** | Under consideration or partially implemented; key assumptions or validations are still pending confirmation. |
| **Accepted** | Actively in force and evidenced in the codebase. |
| **Deprecated** | No longer recommended for new work, though legacy code may still follow it until migrated. |
| **Superseded** | Replaced by a newer ADR. The original record remains intact for historical traceability and links forward to its replacement. |
| **Rejected** | Evaluated and explicitly not adopted; preserved so the team does not repeatedly re-evaluate the same dead end. |

## How to Supersede an Existing Decision

ADRs are append-only historical records—do not rewrite an accepted ADR to describe a new architecture. Instead:

1. Copy [`ADR-TEMPLATE.md`](./ADR-TEMPLATE.md) to a new sequential file (e.g., `0002-new-decision-title.md`).
2. In the new ADR's **Context** and **References and Evidence** sections, reference the previous ADR and explain what review trigger or new requirement prompted the change.
3. Once the new ADR is **Accepted**, update the **Status** of the older ADR from `Accepted` to `Superseded by [ADR-NNNN](./NNNN-new-decision-title.md)`.
4. Update the status and add a new row in the Decision Log table below.

## Decision Log

*Note: ADRs `0002`–`0004` are retrospective records documenting architectural decisions already established in the codebase prior to future redesign or feature expansion.*

| ADR | Decision | Status | Date |
|---|---|---|---|
| [0001](./0001-first-architectural-decision.md) | Separate Pure Domain Logic and Side-Effect Boundaries from React UI Components | Accepted | 2026-11-12 |
| [0002](./0002-client-side-spa-foundation-and-plain-css.md) | Client-Side React, TypeScript, and Vite SPA Foundation with Plain CSS3 and Local State | Accepted | 2026-11-13 |
| [0003](./0003-versioned-localstorage-cart-persistence-and-reconciliation.md) | Versioned `localStorage` Cart Persistence with Boundary Reconciliation Against Stale Catalog Data | Accepted | 2026-11-13 |
| [0004](./0004-strict-cart-calculations-and-integer-cents-pricing.md) | Strict Fail-Fast Cart Calculations and Integer-Cents Monetary Representation | Accepted | 2026-11-13 |
