# MawaHub Authentication & Role Architecture

## Goal
One MawaHub ID for buyers, sellers, donors, students, volunteers, partners and administrators.

## Production rules
- Authentication must be handled by a trusted auth provider/backend.
- Passwords are hashed by the auth provider; never store passwords in frontend code, localStorage or GitHub.
- Require verified email or phone before sensitive actions.
- MFA is required for administrators and recommended for all users.
- Use short-lived access tokens and secure, rotating sessions.
- Authorize every protected backend operation server-side.
- Seller/admin/payment roles must use server-side role checks; never trust a browser-supplied role.
- Payment provider secrets and webhook signing secrets stay in server environment variables.
- Child-protection reports and other sensitive safeguarding records require strict least-privilege access and audit logging.

## Roles
- `buyer`: marketplace purchases and order history.
- `seller`: products, inventory, seller orders and payouts.
- `donor`: donations, receipts and donor updates.
- `student`: courses, progress and certificates.
- `volunteer`: applications and assignments.
- `partner`: partnership workspace and impact reports.
- `moderator`: community moderation.
- `safeguarding`: restricted child-protection case handling.
- `admin`: platform management.

## Data ownership
Users may read/update their own profile. Sellers may manage only their own listings and fulfilment records. Donors may access only their own donation history. Administrators receive only the permissions required by their assigned role.

## Current repository UI
`account.html` is the public entry point and `dashboard.html` is the member workspace. They currently contain demo/local UI only; production authentication must be connected before real credentials or private data are accepted.