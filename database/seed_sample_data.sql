USE mini_ecommerce;

-- Utilizadores de teste
INSERT INTO users (name, email, password, role)
SELECT 'Administrador', 'admin@minishop.local', '$2y$10$6XfWfM8dNTmWfR1m3GmFbeY0XvR7j3k6qF3sY0W0wWv3uY9qK7m2C', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@minishop.local');

INSERT INTO users (name, email, password, role)
SELECT 'Cliente Teste', 'cliente@minishop.local', '$2y$10$6XfWfM8dNTmWfR1m3GmFbeY0XvR7j3k6qF3sY0W0wWv3uY9qK7m2C', 'customer'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'cliente@minishop.local');

-- Categorias
INSERT INTO categories (name, slug)
SELECT 'Eletrónica', 'eletronica'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'eletronica');

INSERT INTO categories (name, slug)
SELECT 'Moda', 'moda'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'moda');

INSERT INTO categories (name, slug)
SELECT 'Casa', 'casa'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'casa');

INSERT INTO categories (name, slug)
SELECT 'Beleza', 'beleza'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'beleza');

INSERT INTO categories (name, slug)
SELECT 'Escritório', 'escritorio'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'escritorio');

INSERT INTO categories (name, slug)
SELECT 'Gaming', 'gaming'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'gaming');

-- Produtos relevantes
INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Smartphone X200', 'Smartphone 8GB RAM, 256GB, 5G.', 499.90, 14, NULL, 1
FROM categories c WHERE c.slug = 'eletronica'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Smartphone X200');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Portátil Pro 14', 'Portátil para trabalho e estudo.', 899.00, 8, NULL, 1
FROM categories c WHERE c.slug = 'eletronica'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Portátil Pro 14');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Headset Gamer 7.1', 'Som surround para jogos competitivos.', 79.90, 22, NULL, 1
FROM categories c WHERE c.slug = 'gaming'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Headset Gamer 7.1');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Mouse Gamer RGB', 'Mouse ergonómico com 7 botões programáveis.', 34.90, 30, NULL, 1
FROM categories c WHERE c.slug = 'gaming'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mouse Gamer RGB');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Camisa Slim Fit', 'Camisa social em algodão premium.', 24.99, 40, NULL, 1
FROM categories c WHERE c.slug = 'moda'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Camisa Slim Fit');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Tênis Casual Urbano', 'Confortável para uso diário.', 54.50, 25, NULL, 1
FROM categories c WHERE c.slug = 'moda'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Tênis Casual Urbano');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Air Fryer 5L', 'Fritadeira sem óleo com painel digital.', 119.90, 11, NULL, 1
FROM categories c WHERE c.slug = 'casa'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Air Fryer 5L');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Liquidificador Turbo', 'Motor potente para sucos e massas.', 49.90, 18, NULL, 1
FROM categories c WHERE c.slug = 'casa'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Liquidificador Turbo');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Kit Skincare Diário', 'Limpeza, hidratação e proteção.', 39.90, 20, NULL, 1
FROM categories c WHERE c.slug = 'beleza'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Kit Skincare Diário');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Perfume Essência 100ml', 'Fragrância elegante de longa duração.', 64.00, 16, NULL, 1
FROM categories c WHERE c.slug = 'beleza'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Perfume Essência 100ml');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Cadeira Ergonómica', 'Ajuste lombar para longas jornadas.', 139.90, 9, NULL, 1
FROM categories c WHERE c.slug = 'escritorio'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cadeira Ergonómica');

INSERT INTO products (category_id, name, description, price, stock, image_url, active)
SELECT c.id, 'Mesa Office Compacta', 'Mesa de trabalho 120cm.', 109.90, 7, NULL, 1
FROM categories c WHERE c.slug = 'escritorio'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mesa Office Compacta');
