# Software Requirements Specification (SRS)
## Inventory Management System (IMS)
**Project Title:** Web-Based Inventory Management & Stock Tracking System  
**Prepared by:** Bhumika  
**Role:** Full Stack Development Intern  
**Project Supervisor / Mentor:** Anshul Dogra  
**Document Version:** 2.0  
**Target Completion Date (Phase 1):** 26 September 2026  
**Status:** Approved & Implemented  

---

## 1. Executive Summary & Objective

### 1.1 Objective
The objective of this project is to develop an enterprise-grade, web-based **Inventory Management System (IMS)** using **Node.js, Express.js, MySQL 8.0, and modern Vanilla JavaScript**. The system enables organizations to digitize and automate end-to-end inventory tracking, stock movements (IN/OUT), supplier interactions, category classifications, and real-time low-stock alerting. It eliminates manual spreadsheet discrepancies, prevents stockout scenarios, and provides actionable business intelligence through analytics and automated reporting.

### 1.2 Business Context & Problem Statement
Traditional inventory control processes often suffer from:
- **Lack of Real-time Visibility:** Stock levels are manually reconciled at the end of the day or week, resulting in overselling or stock depletion.
- **Stock Discrepancy & Theft:** Unlogged stock adjustments lead to inventory shrinkage without an audit trail.
- **Supplier Mismanagement:** Inconsistent supplier records result in delays during procurement and restocking.
- **Delayed Decision Making:** Lack of visual trends (Stock IN vs. Stock OUT, valuation metrics) prevents timely procurement forecasting.

The IMS solves these challenges by offering real-time ACID-compliant stock transactions, automated low-stock warnings, integrated supplier management, and instant CSV audit exports.

---

## 2. Project Scope & Target Users

### 2.1 In-Scope Deliverables (v1.0 & v2.0)
1. **User Authentication & Authorization:** Secure, stateless JWT-based authentication for administrative personnel with bcrypt password hashing.
2. **Product Catalog Management:** Full CRUD (Create, Read, Update, Delete) capability for products, including SKU identification, unit pricing, real-time quantity tracking, and customized low-stock threshold triggers.
3. **Category Management:** Hierarchical categorization of inventory items (e.g., Electronics, Stationery, Furniture, Books, Raw Materials) with automatic product count association.
4. **Supplier Management:** Comprehensive supplier repository recording contact numbers, corporate email addresses, and physical addresses, linking suppliers directly to product catalogs.
5. **Stock Movement Operations (IN / OUT):**
   - **Stock IN (Procurement / Restock):** Records arrival of fresh batches from suppliers and increments inventory.
   - **Stock OUT (Sales / Consumption / Issue):** Deducts stock while strictly validating available quantity to prevent negative stock counts.
6. **Real-time Low-Stock Intelligence:** Dedicated visual indicator pills and dashboard alert feeds triggered whenever `quantity <= low_stock_limit`.
7. **Interactive Analytics Dashboard:** Real-time KPI summary widgets (Total Products, Total Valuation in ₹, Low Stock Count, Active Suppliers, Stock Movements) coupled with dynamic trend charts.
8. **Movement Audit Reports & Export:** Complete transaction logs with date range filters, movement type filters, and one-click export to CSV for auditing.

### 2.2 Out-of-Scope (Future Enhancements)
- Multi-warehouse inventory routing across geographical regions.
- Barcode and QR code mobile camera scanning integrations.
- Integrated payment gateways (e.g., Razorpay/Stripe) for direct customer point-of-sale checkouts.
- Automated vendor email generation via SMTP upon low stock trigger.

### 2.3 User Personas
- **System Administrator (Primary User):** Manages user access, sets low-stock warning limits, reviews high-level inventory valuation, and audits logs.
- **Warehouse / Inventory Officer:** Performs day-to-day operations: logs incoming deliveries (Stock IN), issues goods against sales orders (Stock OUT), and updates catalog items.

---

## 3. Functional Requirements (FR)

| Requirement ID | Module | Description | Acceptance Criteria |
|---|---|---|---|
| **FR-01** | Authentication | Admin Login with username and password | Returns signed JWT token on valid credentials; returns HTTP 401 on invalid credentials. |
| **FR-02** | Authentication | Password Security | Passwords must be hashed using `bcrypt` (salt rounds >= 10) before storage in MySQL. |
| **FR-03** | Authentication | Protected Route Guard | Unauthenticated requests to private endpoints return HTTP 401/403. Client redirects to login page. |
| **FR-04** | Product Management | Create Product | Validates mandatory fields (`name`, `price >= 0`, `quantity >= 0`, `low_stock_limit >= 0`); assigns category and supplier. |
| **FR-05** | Product Management | Update Product | Allows editing name, category, supplier, unit price, quantity, and low-stock threshold. |
| **FR-06** | Product Management | Delete Product | Removes product record and associated cascades/references without database foreign key violation. |
| **FR-07** | Product Management | Search & Filter | Instant client-side or server-side filtering by product name, category, supplier, and stock health status. |
| **FR-08** | Category Management | Category CRUD | Admin can create, view, edit, and remove categories. Deleting a category sets product `category_id` to NULL without data loss. |
| **FR-09** | Supplier Management | Supplier CRUD | Records supplier company name, phone, email, and location. Displays count of products supplied by each vendor. |
| **FR-10** | Stock Operations | Stock IN Transaction | Increments existing product quantity by specified amount. Logs immutable transaction in `stock_movements`. |
| **FR-11** | Stock Operations | Stock OUT Transaction | Verifies current stock >= requested quantity. Decrements stock and logs movement. Rejects transaction if quantity exceeds stock. |
| **FR-12** | Stock Operations | ACID Concurrency | Stock operations must execute inside a MySQL Transaction (`BEGIN ... COMMIT`) with `FOR UPDATE` lock to avoid race conditions. |
| **FR-13** | Low Stock Alerts | Threshold Detection | Automatically surfaces items with `quantity <= low_stock_limit` on the dashboard with a 1-click restock action. |
| **FR-14** | Dashboard | Analytics & Metrics | Calculates total catalog size, total inventory value ($\sum price \times quantity$), total suppliers, and low-stock count. |
| **FR-15** | Reports | Audit Trail & CSV Export | Displays chronological stock movement history with filters and exports data into a downloadable `.csv` file. |

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Scalability
- **API Response Latency:** 95% of API requests (`GET`, `POST`, `PUT`) must respond in under **200 milliseconds** under local network conditions.
- **Database Indexing:** Indexed lookups on `products.name`, `products.category_id`, `products.supplier_id`, and `stock_movements.date` to support efficient pagination and search over thousands of records.
- **Connection Pooling:** MySQL pool configured with `connectionLimit: 10` and `waitForConnections: true` to optimize concurrent database resource allocation.

### 4.2 Security & Data Protection
- **JWT (JSON Web Tokens):** Cryptographically signed tokens with expiration (2 hours) passed via the `Authorization: Bearer <token>` header.
- **SQL Injection Prevention:** 100% of SQL queries utilize parameterized statements (`mysql2/promise` with `?` placeholders). No string concatenation in SQL queries.
- **CORS Protection:** Cross-Origin Resource Sharing enabled specifically for authorized origins.
- **Input Sanitization:** Frontend and backend validation to reject negative values, empty strings, and malformed inputs.

### 4.3 Reliability & Maintainability
- **ACID Compliance:** Financial and physical inventory accuracy maintained via MySQL InnoDB engine transactions for stock movements.
- **Clean Architecture:** Modular directory structure separating database configuration, middleware, and domain routes.
- **Graceful Error Handling:** Centralized Express error handler returning consistent JSON envelopes `{ success: false, error: "message" }`.

### 4.4 Usability & UI/UX Standards
- **Modern Aesthetic:** Clean, modern interface styled with Tailwind-inspired design tokens, typography, glassmorphism cards, and high-contrast status badges.
- **Responsive Layout:** 100% accessible and responsive across Mobile (<768px), Tablet (768px-1024px), and Desktop (>1024px) displays.
- **Instant User Feedback:** Toast notifications for success/error events; interactive modals replacing default browser alerts.

---

## 5. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Structure** | HTML5 | Living Standard | Semantic document structure, accessible input forms |
| **Frontend Styling** | Modern CSS3 (Vanilla) | Modern Spec | Design tokens, flexbox/grid layout, glassmorphic styling, animations |
| **Frontend Logic** | JavaScript (ES6+) | Modern Spec | Asynchronous fetch API, DOM manipulation, client-side routing guards |
| **Data Visualizations** | Chart.js (CDN) | 4.x | Interactive stock trends (IN vs OUT) and category distribution charts |
| **Backend Runtime** | Node.js | v18+ / v24+ | Asynchronous event-driven JavaScript server runtime |
| **API Framework** | Express.js | v5.x | RESTful API routing, middleware chaining, JSON request handling |
| **Database** | MySQL Server | 8.0 / Community | Relational database management system with InnoDB engine |
| **Database Driver** | `mysql2/promise` | ^3.24 | High-performance asynchronous MySQL client with connection pooling |
| **Security & Auth** | `jsonwebtoken`, `bcryptjs` | ^9.0 / ^3.0 | Stateless token generation and salted password hashing |
| **Environment Config** | `dotenv` | ^18.0 | Secure loading of environment variables (.env) |
| **Testing & API Tooling** | Postman | Latest | REST API endpoint testing, automated request collection |

---

## 6. Business Rules & Logic

1. **Negative Stock Prevention:** The system shall strictly prevent stock from dropping below zero (`quantity >= 0`). If an outgoing movement requests more units than currently available, the transaction will be rejected with HTTP 400 (`Not enough stock`).
2. **Low Stock Condition:** A product is classified as "Low Stock" whenever:
   $$\text{quantity} \le \text{low\_stock\_limit}$$
   and classified as "Out of Stock" whenever:
   $$\text{quantity} = 0$$
3. **Inventory Valuation Calculation:** Total inventory valuation represents the sum of product quantities multiplied by unit purchase/selling prices:
   $$\text{Total Valuation} = \sum_{i=1}^{N} (\text{price}_i \times \text{quantity}_i)$$
4. **Audit Immutability:** Once recorded in `stock_movements`, a movement record cannot be directly updated or altered, ensuring a tamper-resistant historical log. Corrective adjustments must be made as a new compensating movement.

---

## 7. Requirement Traceability Matrix (RTM)

| Requirement ID | Module | Database Entity | Backend Route | Frontend View | Verification Status |
|---|---|---|---|---|---|
| **FR-01, FR-02, FR-03** | Auth | `users` | `/api/auth/login`, `/register` | `index.html` | Verified |
| **FR-04, FR-05, FR-06** | Products | `products` | `/api/products` (GET, POST, PUT, DELETE) | `products.html` | Verified |
| **FR-07, FR-13** | Search & Alerts | `products` | `/api/products?search=...`, `/alerts/low` | `products.html`, `dashboard.html` | Verified |
| **FR-08** | Categories | `categories` | `/api/categories` (GET, POST, PUT, DELETE) | `categories.html` | Verified |
| **FR-09** | Suppliers | `suppliers` | `/api/suppliers` (GET, POST, PUT, DELETE) | `suppliers.html` | Verified |
| **FR-10, FR-11, FR-12** | Stock Movement | `stock_movements` | `/api/stock` (POST, GET) | `stock.html` | Verified |
| **FR-14** | Analytics | Aggregate (`SUM`, `COUNT`) | `/api/dashboard/summary` | `dashboard.html` | Verified |
| **FR-15** | Audit & Export | `stock_movements` JOIN `products` | `/api/stock` | `reports.html` | Verified |