# MawaHub ID — Production Authentication Plan

## Account model
One verified account can hold multiple roles: Buyer, Seller, Farmer, Student, Supporter/Donor, Volunteer and Partner/Organisation.

## Required production controls
- Passwords must never be stored in GitHub, browser localStorage or plain text.
- Use a reputable server-side authentication provider with salted password hashing, secure sessions/tokens, email verification and password reset.
- Enable optional MFA for administrators, sellers and partner accounts.
- Enforce role-based access control server-side; hiding a UI button is not authorization.
- Keep private profile, order, donation and safeguarding data in protected databases with least-privilege access.
- Payment card data should be handled by PCI-compliant payment providers; MawaHub should not store raw card details.
- Log security-sensitive actions and provide account deletion/data-access workflows subject to legal retention requirements.

## Suggested roles
### Buyer
Browse, wishlist, checkout, orders, delivery and reviews.
### Seller
Seller verification, products, inventory, orders, payouts and seller analytics.
### Farmer
Farm profile, agriculture learning, produce listings and marketplace orders.
### Student
Courses, progress, assignments, certificates and community.
### Supporter / Donor
Donations, campaigns, receipts and impact updates.
### Volunteer
Applications, opportunities, schedules and participation history.
### Partner / Organisation
Organisation verification, partnership applications, projects and reports.
### Admin / Safeguarding Officer
Separate privileged role with MFA, audit logging and restricted access to safeguarding cases.

## Safeguarding separation
Child-protection reports must never appear in ordinary user dashboards. Case information must be isolated behind dedicated safeguarding permissions and handled only by authorised personnel.

## Launch sequence
1. Choose authentication provider/backend.
2. Create user and role schema.
3. Add email/phone verification.
4. Add secure login/logout/reset/MFA.
5. Connect dashboard to server-side session.
6. Add Marketplace, Education, Donations and Partner permissions.
7. Security testing before production launch.
