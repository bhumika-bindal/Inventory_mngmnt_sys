# System Design & Architecture Document
## Inventory Management System (IMS)
**Prepared by:** Bhumika  
**Project Phase:** System Design (Phase 2)  
**Target Completion Date:** 30 September 2026  
**Document Version:** 2.0  
**Supervisor / Reviewer:** Anshul Dogra  

---

## 1. System Architecture Overview

The Inventory Management System adopts a robust **3-Tier Client-Server Architecture** designed for high throughput, low latency, and clear separation of concerns.

```mermaid
flowchart TD
    subgraph Tier1["Presentation Tier (Client Browser)"]
        UI["Modern Vanilla JS / HTML5 / CSS3"]
        V1["Dashboard & KPI Cards"]
        V2["Products & Categories View"]
        V3["Stock In/Out & Ledger View"]
        V4["Analytics & Chart.js Visuals"]
        UI --> V1 & V2 & V3 & V4
    end

    subgraph Tier2["Application / API Tier (Node.js + Express.js)"]
        Server["Express.js HTTP Server (:3000)"]
        MW1["CORS & Body Parser Middleware"]
        MW2["JWT Authentication Guard (Bearer Token)"]
        MW3["Centralized Error Handling Middleware"]
        R1["Auth Router (/api/auth)"]
        R2["Products Router (/api/products)"]
        R3["Categories Router (/api/categories)"]
        R4["Suppliers Router (/api/suppliers)"]
        R5["Stock Router (/api/stock)"]
        R6["Dashboard Router (/api/dashboard)"]

        Server --> MW1 --> MW2 --> R1 & R2 & R3 & R4 & R5 & R6 --> MW3
    end

    subgraph Tier3["Data Tier (MySQL 8.0 Database)"]
        Pool["mysql2 Connection Pool (Limit: 10)"]
        DB[(MySQL Database: 'ims')]
        T1["users"]
        T2["products"]
        T3["categories"]
        T4["suppliers"]
        T5["stock_movements"]

        Pool --> DB
        DB --> T1 & T2 & T3 & T4 & T5
    end

    Tier1 --"HTTPS / JSON REST Calls"--> Tier2
    Tier2 --"Parameterized SQL Queries (ACID)"--> Tier3
```

---

## 2. Data Flow Diagrams (DFD)

### 2.1 DFD Level 0 (Context Level Diagram)
The Level 0 DFD illustrates external entities interacting with the boundaries of the IMS.

```mermaid
flowchart LR
    Admin["Admin / Inventory Manager"]
    System[("Inventory Management System")]
    DB[("MySQL Database")]

    Admin --"1. Login Credentials"--> System
    System --"2. Auth Token (JWT) & Dashboard Metrics"--> Admin
    Admin --"3. Product & Stock Transactions"--> System
    System --"4. Real-time Alerts & Reports"--> Admin

    System --"5. SQL Queries / Transactions"--> DB
    DB --"6. Result Sets & Row Counts"--> System
```

### 2.2 DFD Level 1 (Decomposed Functional Processes)

```mermaid
flowchart TD
    User(["Admin User"])

    subgraph Processes["System Subsystems"]
        P1["1.0 User Authentication"]
        P2["2.0 Catalog & Category Engine"]
        P3["3.0 Supplier Management Engine"]
        P4["4.0 Stock Transaction Engine"]
        P5["5.0 Analytics & Reporting Engine"]
    end

    subgraph Storage["Data Stores"]
        D1[("users table")]
        D2[("products table")]
        D3[("categories table")]
        D4[("suppliers table")]
        D5[("stock_movements table")]
    end

    User --"Credentials"--> P1
    P1 --"Verify Hash"--> D1
    P1 --"Issue JWT"--> User

    User --"Product & Category CRUD"--> P2
    P2 <--> D2
    P2 <--> D3

    User --"Supplier Information"--> P3
    P3 <--> D4

    User --"Stock IN / Stock OUT"--> P4
    P4 --"Lock & Update Qty"--> D2
    P4 --"Insert Movement Log"--> D5

    User --"View Metrics & Export"--> P5
    P5 <-- "Read Quantities & Prices" --> D2
    P5 <-- "Read Audit Trail" --> D5
    P5 --"Aggregated KPIs & CSV File"--> User
```

---

## 3. Sequence Diagrams (Key System Interactions)

### 3.1 Authentication & Token Issuance Flow
Illustrates secure administrative authentication using salted bcrypt verification and signed JSON Web Tokens.

```mermaid
sequenceDiagram
    autonumber
    actor User as Admin User (Browser)
    participant Client as Frontend (api.js)
    participant AuthRoute as /api/auth/login
    participant DB as MySQL (users)

    User->>Client: Enters username & password
    Client->>AuthRoute: POST { username, password }
    AuthRoute->>DB: SELECT * FROM users WHERE username = ?
    DB-->>AuthRoute: Return user record (with bcrypt hash)
    
    alt User not found or password mismatch
        AuthRoute-->>Client: HTTP 401 Unauthorized { error: 'Invalid credentials' }
        Client-->>User: Display error message toast
    else Password matches bcrypt.compare()
        AuthRoute->>AuthRoute: Generate JWT (expiresIn: 2h)
        AuthRoute-->>Client: HTTP 200 OK { token: 'jwt...', username: 'admin' }
        Client->>Client: localStorage.setItem('token', token)
        Client-->>User: Redirect to dashboard.html
    end
```

### 3.2 Stock IN / OUT Transaction with ACID Rollback
Guarantees inventory consistency through atomic database transactions.

```mermaid
sequenceDiagram
    autonumber
    actor User as Warehouse Manager
    participant Client as Frontend UI
    participant StockRoute as /api/stock (POST)
    participant DB as MySQL Engine

    User->>Client: Submits Stock Movement (Product, Type: 'OUT', Qty: 25)
    Client->>StockRoute: POST /api/stock with Bearer Token
    StockRoute->>DB: conn.beginTransaction()
    StockRoute->>DB: SELECT quantity FROM products WHERE id = ? FOR UPDATE
    DB-->>StockRoute: Returns current quantity (e.g. 50)

    alt Insufficient Stock (current < requested Qty)
        StockRoute->>DB: conn.rollback()
        StockRoute-->>Client: HTTP 400 Bad Request { error: 'Not enough stock' }
        Client-->>User: Show warning alert toast
    else Stock Available
        StockRoute->>DB: UPDATE products SET quantity = current - 25 WHERE id = ?
        StockRoute->>DB: INSERT INTO stock_movements (product_id, type, quantity, note)
        StockRoute->>DB: conn.commit()
        StockRoute-->>Client: HTTP 200 OK { message: 'Stock updated', newQty: 25 }
        Client-->>User: Show success toast & update stock table in real-time
    end
```

---

## 4. RESTful API Specification

All protected endpoints require an HTTP header:  
`Authorization: Bearer <jwt_token>`

| Method | Endpoint | Access | Request Body / Query Params | Expected Success Response | HTTP Status |
|---|---|---|---|---|---|
| `POST` | `/api/auth/login` | Public | `{ username, password }` | `{ token: "..." }` | 200 |
| `POST` | `/api/auth/register` | Public/Admin | `{ username, password }` | `{ message: "User created" }` | 201 |
| `GET` | `/api/products` | Protected | `?search=&category_id=&supplier_id=` | `[ { id, name, price, quantity, category, supplier, ... } ]` | 200 |
| `GET` | `/api/products/:id` | Protected | None | `{ id, name, price, quantity, ... }` | 200 |
| `POST` | `/api/products` | Protected | `{ name, category_id, supplier_id, price, quantity, low_stock_limit }` | `{ id: 10, message: "Product created" }` | 201 |
| `PUT` | `/api/products/:id` | Protected | `{ name, category_id, supplier_id, price, quantity, low_stock_limit }` | `{ message: "Product updated" }` | 200 |
| `DELETE` | `/api/products/:id` | Protected | None | `{ message: "Product deleted" }` | 200 |
| `GET` | `/api/categories` | Protected | None | `[ { id, name, product_count } ]` | 200 |
| `POST` | `/api/categories` | Protected | `{ name }` | `{ id: 4, message: "Category created" }` | 201 |
| `PUT` | `/api/categories/:id` | Protected | `{ name }` | `{ message: "Category updated" }` | 200 |
| `DELETE` | `/api/categories/:id` | Protected | None | `{ message: "Category deleted" }` | 200 |
| `GET` | `/api/suppliers` | Protected | None | `[ { id, name, phone, email, address, product_count } ]` | 200 |
| `POST` | `/api/suppliers` | Protected | `{ name, phone, email, address }` | `{ id: 2, message: "Supplier created" }` | 201 |
| `PUT` | `/api/suppliers/:id` | Protected | `{ name, phone, email, address }` | `{ message: "Supplier updated" }` | 200 |
| `DELETE` | `/api/suppliers/:id` | Protected | None | `{ message: "Supplier deleted" }` | 200 |
| `POST` | `/api/stock` | Protected | `{ product_id, type: 'IN'\|'OUT', quantity, note }` | `{ message: "Stock updated", newQty: 30 }` | 200 |
| `GET` | `/api/stock` | Protected | `?product_id=&type=` | `[ { id, product_name, type, quantity, note, date } ]` | 200 |
| `GET` | `/api/dashboard/summary` | Protected | None | `{ totalProducts, totalValuation, lowStockCount, totalSuppliers, totalCategories }` | 200 |
| `GET` | `/api/dashboard/charts` | Protected | None | `{ movementsTrend: [...], categoryDistribution: [...] }` | 200 |

---

## 5. Security Architecture & Threat Modeling

1. **Stateless Authentication:** JSON Web Tokens (JWT) signed with `HS256` algorithm and protected by a private secret in `.env`. Tokens expire in 2 hours.
2. **Password Cryptography:** User passwords are never saved in plain text. Hashed with bcrypt utilizing 10 salt rounds.
3. **Defense Against SQL Injection:** Strict parameterized queries across all database drivers (`db.query('... WHERE id = ?', [id])`), preventing arbitrary SQL injection attacks.
4. **Data Concurrency & Race Conditions:** Critical stock deductions use explicit row-level locking (`SELECT ... FOR UPDATE`) inside an ACID transaction block.
5. **Cross-Origin Resource Sharing (CORS):** Express server incorporates `cors()` middleware to regulate permitted client origins.
