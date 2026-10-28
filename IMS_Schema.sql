-- =======================================================
-- Inventory Management System (IMS) - Database Schema
-- Prepared by: Bhumika
-- Target Date (Phase 4): 6 October 2026
-- Database: MySQL 8.0 / InnoDB Engine
-- =======================================================

CREATE DATABASE IF NOT EXISTS ims CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ims;

-- 1. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  address VARCHAR(200) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category_id INT DEFAULT NULL,
  supplier_id INT DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 0,
  low_stock_limit INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_product_name (name),
  INDEX idx_product_category (category_id),
  INDEX idx_product_supplier (supplier_id),
  INDEX idx_product_qty (quantity)
) ENGINE=InnoDB;

-- 5. Stock Movements Table (Audit Trail)
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  type ENUM('IN','OUT') NOT NULL,
  quantity INT NOT NULL,
  note VARCHAR(255) DEFAULT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_movement_product (product_id),
  INDEX idx_movement_date (date),
  INDEX idx_movement_type (type)
) ENGINE=InnoDB;

-- =======================================================
-- Seed Initial Sample Data for Demonstration
-- =======================================================

-- Admin user (admin / admin123)
INSERT INTO users (id, username, password) VALUES
(1, 'admin', '$2b$10$XnCvxkKEWUZZ/MNenQkqTOya14Ud593HJupwNq2D9DDob0ayyx0ZK')
ON DUPLICATE KEY UPDATE username='admin';

-- Sample Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Stationery', 'Paper products, notebooks, pens, and desk utilities'),
(2, 'Electronics', 'Computer peripherals, cords, adapters, and devices'),
(3, 'Furniture', 'Ergonomic chairs, desks, storage racks, and cabinets'),
(4, 'Hardware', 'Tools, measuring units, cables, and structural fittings'),
(5, 'Office Supplies', 'Filing trays, staplers, paper shredders, and ink toners')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- Sample Suppliers
INSERT INTO suppliers (id, name, phone, email, address) VALUES
(1, 'ABC Traders & Supplies', '+91 98765 43210', 'sales@abctraders.com', 'Plot 44, Okhla Industrial Area, New Delhi'),
(2, 'Apex Tech Solutions', '+91 98111 22334', 'orders@apextech.in', 'Sector 62, Electronic City, Noida'),
(3, 'Metro Paper Mills', '+91 98222 33445', 'info@metropaper.com', 'Industrial Area Phase 2, Chandigarh'),
(4, 'Horizon Ergonomics', '+91 98333 44556', 'contact@horizonfurniture.com', 'Peenya Industrial Estate, Bengaluru')
ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), email=VALUES(email), address=VALUES(address);

-- Sample Products (mix of healthy, low-stock, and moderate quantities)
INSERT INTO products (id, name, category_id, supplier_id, price, quantity, low_stock_limit) VALUES
(1, 'Executive Hardcover Notebook (A5)', 1, 3, 150.00, 120, 15),
(2, 'Gel Ink Pens (Pack of 10)', 1, 1, 180.00, 8, 10), -- Low Stock Alert
(3, 'Wireless Optical Mouse (2.4GHz)', 2, 2, 650.00, 45, 10),
(4, 'USB-C Fast Charging Cable (1.5m)', 2, 2, 299.00, 3, 8), -- Low Stock Alert
(5, 'Ergonomic Mesh Office Chair', 3, 4, 6499.00, 14, 5),
(6, 'Adjustable Standing Desk Riser', 3, 4, 8999.00, 6, 4),
(7, 'Heavy Duty Metal Stapler (24/6)', 5, 1, 240.00, 2, 5), -- Low Stock Alert
(8, 'Laserjet Black Toner Cartridge', 5, 2, 1850.00, 18, 5)
ON DUPLICATE KEY UPDATE name=VALUES(name), category_id=VALUES(category_id), supplier_id=VALUES(supplier_id), price=VALUES(price), quantity=VALUES(quantity), low_stock_limit=VALUES(low_stock_limit);

-- Sample Stock Movements
INSERT INTO stock_movements (product_id, type, quantity, note, date) VALUES
(1, 'IN', 100, 'Initial procurement from Metro Paper Mills', NOW() - INTERVAL 10 DAY),
(1, 'IN', 20, 'Additional replenishment batch', NOW() - INTERVAL 5 DAY),
(2, 'IN', 50, 'Procured 50 packs from ABC Traders', NOW() - INTERVAL 8 DAY),
(2, 'OUT', 42, 'Dispatched for regional branch distribution', NOW() - INTERVAL 2 DAY),
(3, 'IN', 60, 'Initial batch received from Apex Tech', NOW() - INTERVAL 7 DAY),
(3, 'OUT', 15, 'Issued to software engineering department', NOW() - INTERVAL 3 DAY),
(4, 'IN', 20, 'Vendor restock delivery', NOW() - INTERVAL 6 DAY),
(4, 'OUT', 17, 'Sold & issued to development team workstations', NOW() - INTERVAL 1 DAY),
(5, 'IN', 20, 'Corporate office furniture rollout', NOW() - INTERVAL 12 DAY),
(5, 'OUT', 6, 'Allocated to new workstation pods', NOW() - INTERVAL 4 DAY),
(7, 'IN', 15, 'Office supplies order received', NOW() - INTERVAL 9 DAY),
(7, 'OUT', 13, 'Distributed to administrative departments', NOW() - INTERVAL 1 DAY);