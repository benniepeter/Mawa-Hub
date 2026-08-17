# MawaHub Backend-Ready Architecture

MawaHub is currently deployed as a static frontend. This document defines the production backend contract without exposing secrets in GitHub Pages.

## Core entities
- `users`: id, name, email, phone, country, role, verification_status, created_at
- `profiles`: user_id, avatar_url, bio, organisation, location
- `seller_profiles`: user_id, tier, verification_status, business_name, payout_currency
- `products`: id, seller_id, category, title, description, image_urls, price, currency, stock, status
- `orders`: id, buyer_id, total, currency, status, delivery_status, created_at
- `order_items`: order_id, product_id, seller_id, quantity, unit_price
- `payments`: id, user_id, order_id, donation_id, provider, provider_reference, amount, currency, status, created_at
- `donations`: id, donor_id, fund, amount, currency, frequency, payment_id, status
- `courses`: id, title, category, language, level, price, instructor_id, status
- `enrolments`: user_id, course_id, progress, certificate_status
- `impact_projects`: id, pillar, country, title, status, impact_metrics
- `reports`: id, type, period, file_url, published_at

## Roles
`member`, `buyer`, `seller`, `student`, `donor`, `volunteer`, `partner`, `admin`.

Use server-side role-based access control. Never trust a role supplied by the browser.

## Authentication
Production authentication must provide:
1. Password hashing using a modern password-hashing service.
2. Email and phone verification.
3. Secure, expiring sessions or signed tokens.
4. Password reset and account recovery.
5. Optional MFA for admins.
6. Rate limiting and abuse protection.

## Payment flow
Frontend -> secure backend -> authorised payment provider -> signed webhook -> backend verification -> database reconciliation -> user-visible status.

Never put provider secret keys, mobile-money PINs, OTPs, card CVVs or crypto private keys in frontend files.

## Donation flow
`POST /api/donations` creates a pending donation. The backend creates a provider checkout/session. Only a verified provider callback changes the donation to `paid`.

## Marketplace flow
Seller creates listing -> backend validates seller status -> listing published -> buyer creates order -> payment confirmed -> seller fulfils -> delivery updated -> order completed.

## Admin controls
Payment settings, seller verification, impact counters, reports and published content must be protected by admin RBAC and audit logs.

## Recommended deployment
Keep GitHub Pages as the static frontend if desired. Connect it to a production API/database hosted separately. Configure the API base URL through the frontend build/deployment process, not by committing secrets.
