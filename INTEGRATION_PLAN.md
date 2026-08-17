# MawaHub Dashboard Integration

This branch starts from the latest `main` and is the safe integration lane for the dashboard work.

## Preserve
- PostgreSQL repository layer
- Password hashing and session authentication
- Payment initiation/webhooks/reconciliation
- Transaction history and receipt APIs
- Existing production work already on `main`

## Bring forward from feature/mawahub-dashboard
- API/session-driven dashboard behavior
- Transactions page
- Receipt page
- Five-language i18n foundation

## Merge gate
1. Compare feature branch against this latest-main branch.
2. Apply only compatible dashboard/i18n/transaction/receipt changes.
3. Run repository build/type checks once project configuration is confirmed.
4. Verify authentication ownership boundaries.
5. Verify payment amount/currency remains database-authoritative.
6. Verify no demo identity/localStorage profile is introduced.
7. Open a clean PR into `main` only after checks pass.
