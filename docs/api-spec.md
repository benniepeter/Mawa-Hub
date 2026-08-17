# MawaHub Backend API Contract

Production backend contract for MawaHub ID, marketplace, donations and impact services.

## Authentication
- `POST /api/v1/auth/register` — create account
- `POST /api/v1/auth/login` — authenticate
- `POST /api/v1/auth/refresh` — rotate session token
- `POST /api/v1/auth/logout` — revoke session
- `POST /api/v1/auth/verify-email` — verify email
- `POST /api/v1/auth/verify-phone` — verify phone
- `POST /api/v1/auth/forgot-password` — recovery request

Passwords are hashed server-side. Never log passwords, OTPs, PINs, card data or provider secrets.

## Users
- `GET /api/v1/me` — current authenticated profile
- `PATCH /api/v1/me` — update allowed profile fields
- `GET /api/v1/me/roles` — effective roles/permissions

Roles: `buyer`, `seller`, `donor`, `student`, `volunteer`, `partner`, `admin`.

## Marketplace
- `GET /api/v1/products`
- `POST /api/v1/products` — seller only
- `GET /api/v1/products/:id`
- `PATCH /api/v1/products/:id` — owner/admin
- `DELETE /api/v1/products/:id` — owner/admin
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `POST /api/v1/orders/:id/cancel`

Server validates price, stock, seller status and authorization. Client-submitted totals are never trusted.

## Seller verification
- `POST /api/v1/sellers/apply`
- `GET /api/v1/sellers/me`
- `POST /api/v1/admin/sellers/:id/approve`
- `POST /api/v1/admin/sellers/:id/reject`

## Donations & payments
- `POST /api/v1/donations/checkout`
- `GET /api/v1/donations/:id`
- `GET /api/v1/me/donations`
- `POST /api/v1/webhooks/:provider`

Webhook handlers must verify provider signatures, enforce idempotency, reconcile transaction/reference IDs and only then mark an order/donation as paid.

Supported provider slots: Safaricom M-Pesa Kenya, Airtel Money Kenya, Tigo Pesa/Yas Tanzania, card processor, PayPal, bank transfer and future providers.

## Impact projects
- `GET /api/v1/projects`
- `GET /api/v1/projects/:id`
- `POST /api/v1/admin/projects`
- `PATCH /api/v1/admin/projects/:id`
- `GET /api/v1/projects/:id/impact`

## Security baseline
1. HTTPS only.
2. Secure, HttpOnly, SameSite session cookies or short-lived access tokens with rotation.
3. Role-based access control server-side.
4. Rate-limit login, recovery, OTP and payment endpoints.
5. Validate and sanitize request bodies.
6. Use parameterized queries/ORM protections.
7. Store secrets in environment/secret manager, never Git.
8. Encrypt sensitive data at rest where appropriate.
9. Audit administrator and payment actions.
10. Add CORS allowlist, CSRF protection where cookie auth is used, security headers and centralized error handling.

## Database core entities
`users`, `user_roles`, `seller_profiles`, `products`, `orders`, `order_items`, `payments`, `donations`, `impact_projects`, `courses`, `enrolments`, `audit_logs`.

This document is an implementation contract; it does not itself create a live backend or payment integration.