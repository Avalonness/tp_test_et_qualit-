CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  color VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  price_cents INT NOT NULL,
  promo_price_cents INT,
  category_id UUID REFERENCES categories(id),
  stock INT NOT NULL
);

CREATE TYPE order_status AS ENUM ('cart', 'paid', 'canceled', 'shipped');

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  status order_status NOT NULL,
  total_price_cents INT NOT NULL,
  payed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_lines (
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  unit_price_cents INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY(order_id, product_id)
);
