# System Design & Architecture Document
## iONE IT Solutions – Enterprise Asset & Inventory Management System (iONE IMS)
**Company:** iONE IT Solutions Pvt. Ltd. (Noida, India)  
**Author:** Bhumika (Full Stack Intern)  
**Supervisor / Mentor:** Anshul Dogra  
**Phase:** System Design (Phase 2)  
**Document Version:** 3.0  

---

## 1. 3-Tier Enterprise Architecture

The iONE IMS adopts a resilient 3-Tier architecture engineered to support high-value infrastructure management across iONE's Noida HQ, development centers, and client project deployments.

```mermaid
flowchart TD
    subgraph Tier1["Presentation Tier (Client Browser / Web Interface)"]
        UI["iONE Corporate UI (HTML5 / Modern CSS3 / Vanilla JS)"]
        V1["Executive Dashboard & Visual KPIs"]
        V2["Enterprise Assets & Equipment Catalog"]
        V3["Technology Domains & OEM Directory"]
        V4["Asset Inward & Client Deployments Engine"]
        V5["Interactive Chart.js Visualizations"]
        UI --> V1 & V2 & V3 & V4 & V5
    end

    subgraph Tier2["Application / API Tier (Node.js + Express.js :3000)"]
        Server["Express.js Server Engine"]
        MW1["CORS & JSON Body Parser"]
        MW2["JWT Authentication Guard (Bearer Token)"]
        MW3["Centralized Error Handling Middleware"]
        R1["Auth Router (/api/auth)"]
        R2["Products / Assets Router (/api/products)"]
        R3["Categories / Domains Router (/api/categories)"]
        R4["OEM Partners Router (/api/suppliers)"]
        R5["Stock Movements Router (/api/stock)"]
        R6["Executive Dashboard Router (/api/dashboard)"]

        Server --> MW1 --> MW2 --> R1 & R2 & R3 & R4 & R5 & R6 --> MW3
    end

    subgraph Tier3["Data Tier (MySQL 8.0 Database)"]
        Pool["mysql2 Connection Pool (Limit: 10)"]
        DB[(MySQL Database: 'ims')]
        T1["users (Admin Credentials)"]
        T2["categories (Technology Domains)"]
        T3["suppliers (OEM Partners)"]
        T4["products (Enterprise Hardware & Licenses)"]
        T5["stock_movements (Deployment Audit Trail)"]

        Pool --> DB
        DB --> T1 & T2 & T3 & T4 & T5
    end

    Tier1 --"HTTPS / JSON REST Calls"--> Tier2
    Tier2 --"Parameterized SQL Queries (ACID)"--> Tier3
```

---

## 2. DFD Level 1 (iONE Deployment Flow)

```mermaid
flowchart TD
    Admin(["iONE IT Officer / Bhumika"])

    subgraph Processes["System Subsystems"]
        P1["1.0 JWT Authentication Engine"]
        P2["2.0 Enterprise Asset & Domain Catalog"]
        P3["3.0 OEM Partner Directory"]
        P4["4.0 ACID Deployment & Inward Engine"]
        P5["5.0 Executive BI & Audit Reporting"]
    end

    subgraph Storage["MySQL Relational Stores"]
        D1[("users table")]
        D2[("products (Assets)")]
        D3[("categories (Domains)")]
        D4[("suppliers (OEMs)")]
        D5[("stock_movements (Audit)")]
    end

    Admin --"Login Credentials"--> P1
    P1 --"Verify Hash"--> D1
    P1 --"Issue JWT Token"--> Admin

    Admin --"Manage Hardware & Licenses"--> P2
    P2 <--> D2 & D3

    Admin --"Manage Partners (Oracle, Dell, Cisco)"--> P3
    P3 <--> D4

    Admin --"Inward / Client Deployment"--> P4
    P4 --"Lock Row & Adjust Stock"--> D2
    P4 --"Record Deployment Log"--> D5

    Admin --"View Dashboard & Export CSV"--> P5
    P5 <-- "Read Valuations & Counts" --> D2 & D5
    P5 --"Aggregated Metrics & CSV File"--> Admin
```

---

## 3. Sequence Diagram (Client Project Deployment with ACID Lock)

```mermaid
sequenceDiagram
    autonumber
    actor DeliveryMgr as Delivery Lead / Admin
    participant UI as iONE Frontend
    participant Route as /api/stock (POST)
    participant DB as MySQL InnoDB Engine

    DeliveryMgr->>UI: Submits Deployment (Dell R750, Type: 'OUT', Qty: 3, Project: 'Central Ministry')
    UI->>Route: POST /api/stock with JWT Bearer Token
    Route->>DB: conn.beginTransaction()
    Route->>DB: SELECT quantity, name FROM products WHERE id = 1 FOR UPDATE
    DB-->>Route: Returns current quantity (e.g. 15)

    alt Insufficient Inventory
        Route->>DB: conn.rollback()
        Route-->>UI: HTTP 400 Bad Request { error: 'Insufficient stock...' }
        UI-->>DeliveryMgr: Display warning toast
    else Adequate Stock
        Route->>DB: UPDATE products SET quantity = 15 - 3 WHERE id = 1
        Route->>DB: INSERT INTO stock_movements (product_id, type: 'OUT', qty: 3, note: 'Central Ministry')
        Route->>DB: conn.commit()
        Route-->>UI: HTTP 200 OK { message: 'Stock issued successfully', newQty: 12 }
        UI-->>DeliveryMgr: Show success toast & live update data table
    end
```

---

## 4. RESTful API Specification

All protected endpoints require: `Authorization: Bearer <jwt_token>`

- `POST /api/auth/login` – Corporate admin authentication.
- `GET /api/products` – Retrieve enterprise equipment with filtering (`?search=&category_id=&supplier_id=&status=`).
- `POST /api/products` – Add new hardware / license asset.
- `PUT /api/products/:id` – Modify asset details.
- `DELETE /api/products/:id` – Decommission an asset.
- `GET /api/categories` – List technology domains with asset counts.
- `GET /api/suppliers` – List OEM partners (Oracle, Cisco, Dell, Zebra, etc.).
- `POST /api/stock` – Atomic asset inward (IN) or client project deployment (OUT).
- `GET /api/stock` – Historical deployment trail with date range filters.
- `GET /api/dashboard/summary` – Enterprise KPI aggregates ($\sum price \times qty$, low stock, supplier counts).
- `GET /api/dashboard/charts` – Inward vs deployment trends for Chart.js.
