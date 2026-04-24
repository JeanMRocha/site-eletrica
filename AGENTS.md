# Agent Instructions

Read `docs/governance.md` first, then use the reusable skills:

- `doc-governance-bootstrap`
- `adr-decision-workflow`
- `module-bootstrap-workflow`
- `plan-current-state-lifecycle`

## Project Focus

- Build modern, responsive, production-ready interfaces for the electrical planning product.
- Keep the layout clean, professional, reusable, and accessible by default.
- Prefer mobile-first behavior, explicit loading/error/empty states, and clear visual hierarchy.
- Treat UI work as consolidation-first: primary screens should summarize, secondary flows should open only on explicit action.
- Check layouts against mobile, tablet, laptop, and desktop sizes before closing the task.
- Avoid visual noise; use spacing and hierarchy before decorative effects.
- Use `docs/ui-design.md` as the design reference for spacing, typography, colors, components, and UX.

## Current Stack

- Frontend: `React + TypeScript + Vite`
- Styling: organized CSS in-repo, reusable components, consistent icons
- Backend: `Go`
- Local persistence: `SQLite`
- Target persistence: `PostgreSQL`

## Rules

- Do not introduce a new front-end stack without a documented decision.
- Do not create, switch, rename, or delete Git branches unless the user explicitly asks for that branch operation in the current request.
- Keep `docs/` as the repository truth.
- Keep this file short and avoid repeating the full policy tree here.
