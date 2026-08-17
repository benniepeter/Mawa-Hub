-- MawaHub production database blueprint
-- PostgreSQL-oriented. Apply through a migration system; do not run blindly in production.

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  PRIMARY KEY (user_id, role)
);

CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'community',
  business_name TEXT,
  category TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price_minor BIGINT NOT NULL CHECK (price_minor >= 0),
  currency CHAR(3) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  currency CHAR(3) NOT NULL,
  total_minor BIGINT NOT NULL CHECK (total_minor >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_minor BIGINT NOT NULL CHECK (unit_price_minor >= 0),
  currency CHAR(3) NOT NULL
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  donation_id UUID,
  provider TEXT NOT NULL,
  provider_reference TEXT,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency CHAR(3) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE donations (
  id UUID PRIMARY KEY,
  donor_id UUID REFERENCES users(id),
  fund TEXT NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency CHAR(3) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE impact_projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  pillar TEXT NOT NULL,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_payments_reference ON payments(provider, provider_reference);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);

-- Production requirements:
-- 1. Use migrations and least-privilege DB roles.
-- 2. Keep provider secrets outside the database and repository.
-- 3. Encrypt backups and sensitive fields where required.
-- 4. Enforce authorization in the API, not only in the UI.
-- 5. Add retention/deletion policies and privacy controls before launch.