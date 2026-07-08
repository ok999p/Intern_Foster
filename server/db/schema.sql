CREATE TABLE IF NOT EXISTS category (
  id   INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

INSERT INTO category (id, name) VALUES
  (1, 'Electronic'),
  (2, 'Apparel'),
  (3, 'Sports'),
  (4, 'Other')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS product (
  id          VARCHAR(6) PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  price       FLOAT,
  category_id INT NOT NULL REFERENCES category(id)
);

INSERT INTO product (id, name, price, category_id) VALUES
  ('P00001', 'ABCD123', 100.00, 1),
  ('P00002', 'EFGH123', 98.50, 3),
  ('P00003', 'IJJL789', 29.00, 4)
ON CONFLICT (id) DO NOTHING;
