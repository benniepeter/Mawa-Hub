# MawaHub Production Backend

MawaHub's GitHub Pages frontend is static. This backend layer is designed to connect the public website and the protected admin/seller/donor sides without putting secrets in the browser.

## Recommended architecture
- Frontend: GitHub Pages / static hosting
- Auth + database: Supabase or equivalent managed backend
- Payments: authorised M-Pesa/Airtel/Yas/Tigo/card/PayPal providers via server-side functions
- Webhooks: server-side payment confirmation only
- Storage: private buckets for reports and protected documents
- Admin: role-based access + MFA

## Core data model
See `backend/schema.sql` for the starting schema covering profiles, sellers, products, orders, payments, donations, payment methods, impact projects, reports and safeguarding reports.

## Environment variables
Never commit real credentials. Configure them in the backend host's secret manager:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
AIRTEL_CLIENT_ID=
AIRTEL_CLIENT_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
STRIPE_SECRET_KEY=
WEBHOOK_SIGNING_SECRET=
```

## Production rules
1. Browser code never receives service-role keys or payment secrets.
2. Payment success is accepted only after a verified provider callback/webhook.
3. Admin, finance and safeguarding roles use least privilege and MFA.
4. Child-protection case information is private and excluded from public analytics.
5. Keep audit logs for privileged actions.
6. Use backups, rate limits, bot protection and monitoring before launch.
