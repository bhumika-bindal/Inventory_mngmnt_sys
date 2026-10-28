# Entity-Relationship (ER) Diagram & Database Architecture
## iONE IT Solutions – Enterprise Asset & Inventory Management (iONE IMS)
**Company:** iONE IT Solutions Pvt. Ltd. (Noida, India)  
**Author:** Bhumika (Full Stack Intern)  
**Supervisor:** Anshul Dogra  
**Phase:** System Design (Phase 2)  
**Version:** 3.0  

---

## 1. Relational ER Diagram (Crow's Foot Notation)

```mermaid
erDiagram
    USERS {
        int id PK "AUTO_INCREMENT"
        varchar username "UNIQUE, NOT NULL"
        varchar password "HASHED (bcrypt), NOT NULL"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    CATEGORIES {
        int id PK "AUTO_INCREMENT (Technology Domain)"
        varchar name "UNIQUE, NOT NULL (e.g. Cloud Infra, WMS IoT)"
        varchar description "VARCHAR(255)"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    SUPPLIERS {
        int id PK "AUTO_INCREMENT (OEM Partner)"
        varchar name "NOT NULL (e.g. Oracle, Cisco, Dell)"
        varchar phone "VARCHAR(20)"
        varchar email "VARCHAR(100)"
        varchar address "VARCHAR(200)"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    PRODUCTS {
        int id PK "AUTO_INCREMENT (Enterprise Asset)"
        varchar name "NOT NULL, INDEXED (e.g. Dell R750 Server)"
        int category_id FK "REFERENCES categories(id)"
        int supplier_id FK "REFERENCES suppliers(id)"
        decimal price "DECIMAL(10,2) Valuation"
        int quantity "DEFAULT 0 (On-hand count)"
        int low_stock_limit "DEFAULT 5 (Safety threshold)"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "DEFAULT CURRENT_TIMESTAMP ON UPDATE"
    }

    STOCK_MOVEMENTS {
        int id PK "AUTO_INCREMENT (Transaction ID)"
        int product_id FK "REFERENCES products(id) ON DELETE CASCADE"
        enum type "'IN' (Procurement) or 'OUT' (Client Deployment)"
        int quantity "Units moved"
        varchar note "Deployment Project / PO reference"
        timestamp date "DEFAULT CURRENT_TIMESTAMP, INDEXED"
    }

    CATEGORIES ||--o{ PRODUCTS : "classifies (1:N)"
    SUPPLIERS ||--o{ PRODUCTS : "supplies OEM hardware (1:N)"
    PRODUCTS ||--o{ STOCK_MOVEMENTS : "tracks deployment history (1:N)"
```

---

## 2. iONE Entity Semantics

- **`categories` (Technology Domains):** Groups assets according to iONE practice areas (Cloud & Server Infrastructure, Networking & Cybersecurity, Developer Workstations, Enterprise Software Licenses, iTRACE WMS IoT, and iHRMS Biometrics).
- **`suppliers` (OEM Partners):** Represents authorized technology partners including Oracle India, Dell Technologies, Cisco Systems India, Fortinet, and Zebra Technologies.
- **`products` (Enterprise Assets):** High-value infrastructure equipment, server blades, licenses, and developer machines tracked with unit prices and quantity.
- **`stock_movements` (Inward & Deployment Logs):** Immutable transactional records logging every inward procurement batch and client deployment to Central Ministries, PSUs, and enterprise go-lives.