# MawaHub payment provider setup

MawaHub keeps provider credentials server-side. Never commit API keys, client secrets, signing secrets, PINs, or private certificates.

## Provider slots

- `safaricom_ke` — Kenya / M-PESA. Safaricom's official developer platform is Daraja 3.0.
- `airtel_ke` — Kenya / Airtel Money. Configure the endpoint and credentials supplied for the approved Airtel developer/merchant account.
- `yas_tz` — Tanzania / Mixx by Yas (formerly Tigo Pesa). Configure the endpoint and credentials supplied by Yas for the approved merchant/business integration.
- `manual` — local development only.

## Environment variables

For each provider, configure:

`<PROVIDER>_BASE_URL`
`<PROVIDER>_CLIENT_ID`
`<PROVIDER>_CLIENT_SECRET`
`<PROVIDER>_SHORTCODE`
`<PROVIDER>_CALLBACK_URL`

The exact production URL, credential names, signing requirements and request schema must come from the provider's current merchant/developer documentation or onboarding package. Do not guess these values.

## Required production controls

1. Use HTTPS for all provider callbacks.
2. Store secrets in the deployment secret manager/environment, never in Git.
3. Verify provider signatures/authentication before changing a payment to `paid`.
4. Use idempotency keys for initiation and provider references for reconciliation.
5. Reconcile asynchronous callbacks against the original amount, currency, order/donation and reference.
6. Log transaction IDs and status transitions, but never log PINs, access tokens or full payment secrets.
7. Complete each provider's merchant/business onboarding before enabling live money movement.
