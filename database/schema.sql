-- Script de criação da base de dados do mini-ecommerce

CREATE DATABASE IF NOT EXISTS mini_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mini_ecommerce;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(255) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  shipping_name VARCHAR(120) NOT NULL,
  shipping_email VARCHAR(150) NOT NULL,
  shipping_phone VARCHAR(40) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  shipping_city VARCHAR(120) NOT NULL,
  shipping_postal_code VARCHAR(40) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_resets_email (email)
);

-- ------------------------------------------------------------------
-- Migração defensiva para bases já existentes (evita bugs em runtime)
-- ------------------------------------------------------------------
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS slug VARCHAR(120) NOT NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS active TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS user_id INT NULL;
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(120) NOT NULL DEFAULT 'Cliente';
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_email VARCHAR(150) NOT NULL DEFAULT 'cliente@example.com';
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(40) NOT NULL DEFAULT '-';
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(255) NOT NULL DEFAULT 'Sem morada';
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(120) NOT NULL DEFAULT 'N/D';
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(40) NOT NULL DEFAULT 'N/D';
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS notes TEXT NULL;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'customer';
