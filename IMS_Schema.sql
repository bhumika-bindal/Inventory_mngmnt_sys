-- ============================================================================
-- iONE IT Solutions Pvt. Ltd. - Enterprise Asset & Inventory Management (iONE IMS)
-- Prepared by: Bhumika (Full Stack Intern)
-- Supervisor / Reviewer: Anshul Dogra
-- Corporate HQ: Galaxy Blue Sapphire Plaza, Greater Noida / Green Boulevard, Sec-62, Noida
-- Database: MySQL 8.0 / InnoDB Engine
-- ============================================================================

CREATE DATABASE IF NOT EXISTS ims CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ims;

-- 1. Users Table (Authentication & Access Control)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Categories Table (Technology Domains)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Suppliers Table (OEM Partners & Enterprise Technology Distributors)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  address VARCHAR(200) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Products Table (Enterprise IT Assets, Workstations & Software Licenses)
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

-- 5. Stock Movements Table (Asset Inward / Outward Deployment Ledger)
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

-- ============================================================================
-- iONE IT Solutions Seed Initial Enterprise Data
-- ============================================================================

-- Admin User (admin / admin123)
INSERT INTO users (id, username, password) VALUES
(1, 'admin', '$2b$10$XnCvxkKEWUZZ/MNenQkqTOya14Ud593HJupwNq2D9DDob0ayyx0ZK')
ON DUPLICATE KEY UPDATE username='admin';

-- iONE Technology Domains
INSERT INTO categories (id, name, description) VALUES
(1, 'Cloud & Server Infrastructure', 'Rack servers, blade chassis, SAN storage arrays, and hyperconverged infrastructure'),
(2, 'Networking & Cybersecurity', 'Enterprise switches, core routers, Fortinet SOC firewalls, and hardware security modules'),
(3, 'Engineering Workstations & Laptops', 'Developer MacBook Pros, AI/ML Precision workstations, and corporate ThinkPads'),
(4, 'Enterprise Software Licenses', 'Oracle Database Core Packs, RHEL Enterprise subscriptions, VMware, and cloud licenses'),
(5, 'iTRACE WMS & IoT Hardware', 'Industrial rugged handheld barcode terminals, RFID readers, and warehouse scanners'),
(6, 'iHRMS Smart Biometric Devices', 'AI-powered facial recognition terminals, fingerprint sensors, and access controllers')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- iONE Technology Partners & OEMs
INSERT INTO suppliers (id, name, phone, email, address) VALUES
(1, 'Oracle India Pvt. Ltd.', '+91 120 400 5000', 'licensing@oracle.com', 'Oracle Technology Park, Knowledge Boulevard, Sector 62, Noida'),
(2, 'Dell Technologies Enterprise', '+91 80 2500 3000', 'enterprise_sales@dell.com', 'Dell Campus, Outer Ring Road, Bengaluru, Karnataka'),
(3, 'Cisco Systems India', '+91 124 456 7000', 'india-orders@cisco.com', 'Cisco Millennium Tower, Cyber City, Gurugram, Haryana'),
(4, 'Fortinet Technologies India', '+91 11 4988 2000', 'soc-partners@fortinet.com', 'Cyber Hub, DLF Phase 2, Gurugram, Haryana'),
(5, 'Zebra Technologies (WMS Partner)', '+91 80 6700 8000', 'supplychain@zebra.com', 'Prestige Tech Park, Marathahalli, Bengaluru'),
(6, 'Apple & Enterprise Device Dist.', '+91 11 4050 9000', 'corporate-devices@redington.in', 'Redington House, Okhla Phase 3, New Delhi')
ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), email=VALUES(email), address=VALUES(address);

-- Enterprise Products & Assets
INSERT INTO products (id, name, category_id, supplier_id, price, quantity, low_stock_limit) VALUES
(1, 'Dell PowerEdge R750 Rack Server (2x Intel Xeon Gold, 128GB RAM)', 1, 2, 485000.00, 12, 3),
(2, 'HPE ProLiant DL380 Gen10 Server (OCI Hybrid Gateway)', 1, 2, 395000.00, 8, 2),
(3, 'Cisco Catalyst 9300 48-Port Gigabit PoE+ Managed Switch', 2, 3, 225000.00, 16, 4),
(4, 'Fortinet FortiGate 100F Next-Gen Firewall (24x7 SOC Appliance)', 2, 4, 185000.00, 3, 4),
(5, 'YubiKey 5 NFC Enterprise FIDO2 Security Keys (Pack of 50)', 2, 4, 145000.00, 4, 5),
(6, 'MacBook Pro 16" M3 Max (36GB Unified Memory, 1TB SSD) - Tech Lead', 3, 6, 319900.00, 24, 5),
(7, 'Lenovo ThinkPad T14 Gen 4 (AMD Ryzen 7 PRO, 32GB) - Engineering', 3, 6, 128500.00, 35, 10),
(8, 'Dell Precision 5820 Tower AI/Data Science Workstation (RTX A6000)', 3, 2, 420000.00, 6, 3),
(9, 'Oracle Database 19c Enterprise Edition 4-Core Processor License', 4, 1, 850000.00, 15, 5),
(10, 'Red Hat Enterprise Linux (RHEL) Data Center Premium Subscription', 4, 1, 142000.00, 20, 5),
(11, 'iTRACE Industrial Android Barcode Scanner (Zebra TC52x Rugged)', 5, 5, 68000.00, 40, 10),
(12, 'iTRACE Fixed Long-Range RFID Portal Reader (Warehouse Dock)', 5, 5, 175000.00, 2, 3),
(13, 'iHRMS Face & Palm Recognition Biometric Device (Cloud Sync)', 6, 5, 45000.00, 18, 5),
(14, 'CAT6A 10Gbps Shielded Twisted Pair Cable Drum (305m)', 2, 3, 18500.00, 22, 6)
ON DUPLICATE KEY UPDATE name=VALUES(name), category_id=VALUES(category_id), supplier_id=VALUES(supplier_id), price=VALUES(price), quantity=VALUES(quantity), low_stock_limit=VALUES(low_stock_limit);