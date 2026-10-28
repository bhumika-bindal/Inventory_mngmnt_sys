# Software Requirements Specification (SRS)
## iONE IT Solutions – Enterprise Asset & Inventory Management System (iONE IMS)
**Organization:** iONE IT Solutions Pvt. Ltd.  
**Tagline:** Engineering Digital Nations. Since 2009.  
**Headquarters:** 16th Floor, Hope Tower, Galaxy Blue Sapphire Plaza, Sector-4, Greater Noida 201309  
**Development Center:** 5th Floor, B-9A, Green Boulevard, Tower B, Sector-62, Noida 201301  
**Project Author / Intern:** Bhumika  
**Project Mentor / Supervisor:** Anshul Dogra  
**Document Version:** 3.0  
**Target Completion Date (Phase 1):** 26 September 2026  
**Status:** Approved & Enterprise-Ready  

---

## 1. Executive Summary & Organizational Context

### 1.1 About iONE IT Solutions
Founded in 2009, **iONE IT Solutions** is a premier enterprise digital transformation partner delivering mission-critical Cloud, ERP, AI, Cybersecurity, and Managed Services to Governments, public utilities, and Fortune 500 enterprises across 3 continents. With over 15 years of engineering excellence, 500+ successful project deliveries, and a 100% go-live success rate, iONE is an **Oracle Gold Partner, AWS Advanced Partner, Google Cloud Partner, Microsoft Gold Partner, and SAP Partner**, certified under **ISO 27001:2022, ISO 9001:2015, and CMMI Level 3**.

### 1.2 Business Context & Problem Statement
As an enterprise digital transformation partner managing large-scale Government contracts (e.g., Central Ministry modernizations, State PSU power utilities, smart warehouse rollouts), iONE IT Solutions manages a high-value inventory of physical and digital assets across its Noida HQ, Noida Development Center, Mumbai, Bengaluru, Dubai, and Singapore offices:
- **Cloud & Server Infrastructure:** Rackmount Dell/HPE servers, SAN storage arrays, and hybrid cloud gateways.
- **Cybersecurity & Networking Hardware:** Fortinet FortiGate SOC firewalls, Cisco Catalyst managed switches, and FIDO2 YubiKeys.
- **Engineering Workstations:** High-end Apple MacBook Pro M3 laptops and Dell Precision AI/ML workstations issued to software architects and developers.
- **Enterprise Software Licenses:** Core processor licenses for Oracle Database 19c, Red Hat Enterprise Linux (RHEL), and VMware.
- **Proprietary Solution Hardware:** Industrial Zebra handheld barcode terminals and RFID portals for **iTRACE Smart WMS**, and AI facial recognition biometric terminals for **iHRMS**.

Managing these multi-crore enterprise assets across diverse client projects required replacing ad-hoc spreadsheets with an automated, ACID-compliant **Enterprise Asset & Inventory Management System (iONE IMS)**.

---

## 2. Project Scope & User Roles

### 2.1 System Scope
1. **Enterprise Asset Cataloging:** Centralized tracking of server hardware, network gear, developer machines, software licenses, and WMS/HRMS peripherals.
2. **Technology Domain Classification:** Grouping assets into Cloud Infrastructure, Networking & Cybersecurity, Workstations, Enterprise Licenses, and IoT Hardware.
3. **Strategic OEM & Vendor Repository:** Managing technology partnerships with Oracle India, Dell Technologies, Cisco, Fortinet, and Zebra Technologies.
4. **Asset Inward & Project Deployment (ACID Movements):**
   - **Asset Inward (IN):** Logging incoming vendor batches against Purchase Orders (POs).
   - **Project Deployment (OUT):** Tracking deployment to Central Ministry projects, PSU utilities, or internal SOC/engineering teams with row-level locking.
5. **Critical Stock & License Depletion Alerts:** Immediate dashboard notification pills whenever on-hand stock or spare licenses fall below threshold limits.
6. **Executive Analytics Dashboard:** Visual KPI summaries (Total Valuation, Active Hardware, Low Stock) and Chart.js analytics tracking monthly inward vs. outward deployment trends.
7. **Audit Trail & CSV Export:** Downloadable `.csv` spreadsheets for compliance with ISO 27001 and government asset audits.

### 2.2 User Personas
- **IT Infrastructure Director / Admin (e.g., Bhumika / Anshul Dogra):** Full control over asset catalog, vendor contracts, inventory valuation, and security logs.
- **Project Delivery Manager:** Requests equipment for client go-lives, checks available stock, and views deployment histories.

---

## 3. Functional Requirements (FR)

| ID | Module | Feature Description | Acceptance Criteria |
|---|---|---|---|
| **FR-01** | Authentication | Corporate Admin Login | Authenticates administrator via bcrypt password comparison and issues 2-hour JWT token. |
| **FR-02** | Asset Catalog | Enterprise Equipment CRUD | Add, update, view, and retire hardware items with unit valuation, category, and vendor partner. |
| **FR-03** | Domain Taxonomy | Technology Domains | Manage infrastructure domains (Cloud, SOC, AI, Workstations, WMS IoT) with live asset counts. |
| **FR-04** | Vendor Directory | OEM Partners | Track partner details (Oracle, Cisco, Dell, Zebra) with contact info and linked equipment counts. |
| **FR-05** | Movement Engine | Asset Inward (IN) | Atomically increments on-hand stock and logs procurement reference. |
| **FR-06** | Movement Engine | Client Deployment (OUT) | Atomically deducts stock with `SELECT ... FOR UPDATE` lock, preventing negative stock counts. |
| **FR-07** | Alert Engine | Depletion Alerts | Flags items with `quantity <= low_stock_limit` with 1-click replenishment action. |
| **FR-08** | Executive BI | Financial & Volumetric KPIs | Computes total catalog count, total asset valuation ($\sum price \times qty$), and movement counts. |
| **FR-09** | Reporting | CSV Audit Export | Generates downloadable timestamped `.csv` file for internal IT audits and CMMI compliance. |

---

## 4. Technology Stack

- **Client Layer:** Vanilla HTML5, Modern CSS3 (iONE Corporate Theme), JavaScript (ES6+), Chart.js
- **API Server:** Node.js, Express.js (v5.x), REST API architecture
- **Database:** MySQL 8.0 with InnoDB Engine, Connection Pooling (`mysql2/promise`)
- **Security:** JSON Web Tokens (JWT), Salted bcrypt hashing, Parameterized SQL queries
- **Hosting Environment:** Local / Enterprise On-Premises Server at Noida Development Center