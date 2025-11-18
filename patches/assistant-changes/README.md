This folder contains the assistant's edited files exported so you can apply them manually.

Why: the environment used to run the commit script didn't have `git` available, so a local commit couldn't be created here. These files mirror the exact files the assistant changed in the repository root.

How to apply:
1. Inspect each file under this folder.
2. Copy them into your working tree to overwrite the corresponding files in the repository (or use a difftool to apply changes).
3. Run `git add` and `git commit` locally.

Suggested commit message:
chore: add env example, README instructions; tighten user typing across pages

Files included:
- .env.local.example
- README.md
- app/page.tsx
- app/tutor/dashboard/page.tsx
- app/service/[id]/page.tsx
- app/orders/[orderId]/review/page.tsx
- app/orders/[orderId]/page.tsx
- app/dashboard/page.tsx
- app/checkout/[serviceId]/page.tsx
- scripts/commit-changes.ps1
