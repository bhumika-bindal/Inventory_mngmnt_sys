# Inventory Management System (IMS)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.x-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An enterprise-grade, full-stack **Inventory Management System (IMS)** built with **Node.js, Express.js, MySQL 8.0, and modern Vanilla HTML5/CSS3/JavaScript**.

Designed and developed by **Bhumika** as an internship project under the guidance of **Anshul Dogra**.

---

## 📋 Table of Contents
1. [Key Features](#-key-features)
2. [Tech Stack](#-tech-stack)
3. [System Architecture](#-system-architecture)
4. [Database Design](#-database-design)
5. [Getting Started & Installation](#-getting-started--installation)
6. [Demo Credentials](#-demo-credentials)
7. [RESTful API Endpoints](#-restful-api-endpoints)
8. [Project Milestones & Deliverables](#-project-milestones--deliverables)

---

## 🌟 Key Features

### 1. Executive Dashboard & Visual Analytics
- **Live KPI Counters:** Real-time metrics for Total Products, Total Inventory Valuation (₹), Low-Stock Warnings, Registered Suppliers, and Total Movements.
- **Dynamic Charts (Chart.js):** 
  - Stock Movement Trends (Inbound restocks vs. Outbound distribution).
  - Category Volume Distribution (Interactive doughnut chart).
- **Instant Restock Action:** One-click quick restock modal directly from low-stock notification alerts.

### 2. Product Catalog Management
- Full CRUD operations with category and supplier associations.
- Live search filtering by product name, category, or supplier.
- Multi-dimensional status filtering (`In Stock`, `Low Stock`, `Out of Stock`).
- Customizable safety stock threshold (`low_stock_limit`).

### 3. Category & Supplier Management
- Manage product categories with dynamic product count badges.
- Centralized supplier directory tracking contact phone, email, and facility addresses.

### 4. Stock In / Stock Out Engine (ACID Transactions)
- **Stock IN (Procurement):** Increments on-hand stock and logs transaction metadata.
- **Stock OUT (Sales / Issue):** Deducts stock with database row-level locking (`SELECT ... FOR UPDATE`) preventing negative stock counts.
- **Real-Time Projection Preview:** Calculates projected stock before transaction execution.

### 5. Movement Audit Trail & CSV Export
- Chronological immutable ledger of all historical stock adjustments.
- Date range filtering and movement type filtering.
- **One-Click CSV Export:** Generates downloadable Excel/Sheets compatible `.csv` audit spreadsheets.
- Printer-friendly stylesheet for management reports.

### 6. Security & Stateless Authentication
- Salted password hashing with `bcryptjs` (10 rounds).
- Stateless JWT (JSON Web Tokens) with 2-hour session expiration.
- SQL injection prevention via 100% parameterized queries with `mysql2/promise`.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3 (Modern SaaS Design System), JavaScript (ES6+), Chart.js |
| **Backend** | Node.js, Express.js (v5.x), REST API Architecture |
| **Database** | MySQL 8.0, InnoDB Storage Engine, Connection Pooling |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Environment** | `dotenv`, `cors` |

---

## 🏗️ System Architecture

The application adopts a clean **3-Tier Client-Server Architecture**:
```
[Client Browser] <---> [Express.js REST API (:3000)] <---> [MySQL Database ('ims')]
  - HTML5/CSS3           - JWT Auth Middleware              - users
  - Vanilla JS           - Route Handlers                   - products
  - Chart.js             - Centralized Error Handler        - categories
  - Toast & Modals       - Static Asset Hosting             - suppliers
                                                            - stock_movements
```

---

## 📊 Database Design

The relational schema includes referential constraints, composite indexes, and cascading rules:
- **`users`** (`id`, `username`, `password`, `created_at`)
- **`categories`** (`id`, `name`, `description`, `created_at`)
- **`suppliers`** (`id`, `name`, `phone`, `email`, `address`, `created_at`)
- **`products`** (`id`, `name`, `category_id`, `supplier_id`, `price`, `quantity`, `low_stock_limit`, `created_at`, `updated_at`)
- **`stock_movements`** (`id`, `product_id`, `type`, `quantity`, `note`, `date`)

Detailed documentation available in:
- [`IMS_Requirements.md`](IMS_Requirements.md) – Software Requirements Specification (SRS)
- [`IMS_ER_Diagram.md`](IMS_ER_Diagram.md) – Entity-Relationship Diagram with Mermaid
- [`IMS_System_Design.md`](IMS_System_Design.md) – System Architecture, DFDs & Sequence Diagrams
- [`IMS_UIUX_Design.md`](IMS_UIUX_Design.md) – UI/UX Wireframes & Design System
- [`IMS_Schema.sql`](IMS_Schema.sql) – Complete MySQL Schema & Initial Seed Data

---

## 🚀 Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (v8.0+)

### 1. Clone the Repository
```bash
git clone https://github.com/bhumika-bindal/Inventory_mngmnt_sys.git
cd Inventory_mngmnt_sys
```

### 2. Configure Environment Variables
In the `Backend/` directory, create or verify `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=ims
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### 3. Install Backend Dependencies
```bash
cd Backend
npm install
```

### 4. Setup Database & Seed Initial Data
Ensure your MySQL server is running, then run:
```bash
npm run seed
```
*(This automatically creates sample categories, suppliers, products, and movements).*

### 5. Launch the Application
```bash
npm start
```

### 6. View in Browser
Open your web browser and navigate to:
```
http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| **Administrator** | `admin` | `admin123` |

*(A one-click "Auto-Fill" button is also provided directly on the login page).*

---

## 📡 RESTful API Endpoints

### Authentication
- `POST /api/auth/login` – Authenticate administrator & return signed JWT.
- `POST /api/auth/register` – Register an administrator.

### Products
- `GET /api/products` – List products with search & status filters (`?search=&category_id=&supplier_id=&status=`).
- `GET /api/products/:id` – Retrieve product details by ID.
- `POST /api/products` – Create a new product.
- `PUT /api/products/:id` – Update existing product details.
- `DELETE /api/products/:id` – Delete a product.
- `GET /api/products/alerts/low` – Fetch all low-stock items.

### Categories
- `GET /api/categories` – List all categories with product counts.
- `POST /api/categories` – Add a new category.
- `PUT /api/categories/:id` – Update category name.
- `DELETE /api/categories/:id` – Delete category.

### Suppliers
- `GET /api/suppliers` – List suppliers with contact details and product counts.
- `POST /api/suppliers` – Register a new supplier.
- `PUT /api/suppliers/:id` – Update supplier information.
- `DELETE /api/suppliers/:id` – Remove a supplier.

### Stock Movement Operations
- `POST /api/stock` – Atomic stock IN (addition) or stock OUT (deduction) movement.
- `GET /api/stock` – Historical movement audit trail (`?type=&date_from=&date_to=`).

### Dashboard & Analytics
- `GET /api/dashboard/summary` – High-level KPI summary statistics.
- `GET /api/dashboard/charts` – Visual trend datasets for Chart.js.

---

## 📅 Project Milestones & Deliverables

| Phase | Deliverable | Status |
|---|---|---|
| Phase 1: Requirement Gathering & Analysis | `IMS_Requirements.md` (SRS) | ✅ Completed |
| Phase 2: System Design & ERD | `IMS_System_Design.md`, `IMS_ER_Diagram.md` | ✅ Completed |
| Phase 3: UI/UX Design & Wireframes | `IMS_UIUX_Design.md` | ✅ Completed |
| Phase 4: Database Development | `IMS_Schema.sql`, `Backend/seed.js` | ✅ Completed |
| Phase 5: Backend Development | Node/Express REST APIs with JWT & ACID | ✅ Completed |
| Phase 6: Frontend Development | Modern responsive UI, Chart.js, CSV export | ✅ Completed |
| Phase 7: Testing | Postman collections & automated test runs | ⏳ Ready |
| Phase 8: Documentation | System documentation & README | ✅ Completed |

---

## 📄 License
This project is open-source under the MIT License.
