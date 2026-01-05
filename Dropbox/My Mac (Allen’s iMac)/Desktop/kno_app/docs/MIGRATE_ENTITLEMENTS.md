# Migrate Entitlements to Users

This script helps link existing `Entitlement` documents to `User` documents.

Usage:

- Dry run (no writes):

```bash
node scripts/migrate_entitlements.js --dry
```

- Actual migration:

```bash
MONGO_URI="mongodb://..." node scripts/migrate_entitlements.js
```

What it does:
- Finds Entitlement docs where `userId` is not set.
- Attempts to find a `User` by `stripeCustomerId` extracted from `ent.meta.session.customer`.
- Falls back to finding `User` by `ent.email`.
- If a user is found:
  - sets `ent.userId` and saves the entitlement
  - pushes the entitlement id into `user.entitlements`
  - if a Stripe customer id is present in the entitlement and the `User` lacks it, saves `stripeCustomerId` on the `User`.

Notes & safety:
- Back up your database before running in production.
- The script is intentionally conservative: use `--dry` first to validate matches.
- Run on a maintenance window if you have high traffic.

