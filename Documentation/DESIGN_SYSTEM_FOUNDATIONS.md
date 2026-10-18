# GALUNG.ID — DESIGN SYSTEM FOUNDATIONS

**Version 1.0 — 2026-10-17 | Proposed brand direction, pending approval of official identity**

## 1. Design principles
- Music is visual, but clarity precedes decoration.
- Inclusive by default: captions, transcripts, keyboard navigation, readable typography, reduced motion.
- Money needs unmistakable numeric hierarchy and explicit status.
- Admin screens optimize accuracy, evidence review and auditability over animation.
- Genuine cultural representation of Angklung: obtain proper imagery and permission; do not imply fictional customers.

## 2. Proposed tokens (must be tested and validated in real UI)

| Token | Value | Usage |
|---|---|---|
| `color.brand.midnight` | `#111827` | Dark hero, dark text |
| `color.brand.slate` | `#1C2738` | Secondary dark backgrounds |
| `color.brand.gold` | `#D7A34E` | Brand accent (not sole signal) |
| `color.brand.ivory` | `#F4F0E8` | Warm section surface |
| `color.brand.teal` | `#3B8C83` | Secondary accent |
| `typography.heading` | `Plus Jakarta Sans` (fallback system) | Headings |
| `typography.body` | `Inter` (fallback system) | Body/form |
| `typography.mono` | `JetBrains Mono` (fallback monospace) | License ID / references |
| `space.scale` | 4px base with 8/12/16/24/32/48/64 increments | Layout |
| `radius.control` | 8px | Fields and buttons |
| `radius.card` | 12–16px | Cards |

Colors alone do not establish accessibility. Test every actual foreground/background pair for WCAG 2.2 AA. Minimum body font recommended 16px. Do not encode payment state solely using green/red.

## 3. Components and behavior

### Buttons
Primary = one dominant per functional zone; secondary = safe alternate; destructive = confirmation and warning. Disabled states describe why; spinner with accessible loading label; minimum touch target guideline 44×44 CSS px where practical.

### Forms
Visible labels, helper text, errors associated by `aria-describedby`, required status explained, error summary at top on submit, field-level hints that do not depend on placeholder. Use numeric `inputmode` but preserve pasted banking formats.

### Status & timeline
Step name, timestamp with timezone, actor category, and current action; approval and license issue separate milestones. Do not display confidential bank review notes to customer.

### Sensitive actions
Finance approval, bank account publishing, license revoke, privileged role assignment require server check + confirmation with affected entity and consequences. Re-authentication for high-risk setting change.

### Responsive
Public page max reading width ~72–80 characters; mobile summary precedes primary action; admin tables become scannable cards when necessary; side panes become sequential review sections without hiding bank-verification checklist.

### Motion
Optional subtle progress cue demo; pause/replay and reduced-motion support. No mandatory flashing content or audio-dependent success cue.

## 4. Definition of Ready for handoff
Each component variant has spec, tokens, keyboard behavior, focus path, error/loading/empty state, responsive example, accessible name, and localization plan.
