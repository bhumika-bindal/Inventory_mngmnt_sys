# iONE IT Solutions – Enterprise Asset & Inventory Management System (iONE IMS)

[![Company](https://img.shields.io/badge/Company-iONE%20IT%20Solutions-0f2b48.svg)](https://ioneitsolutions.com/en)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.x-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![ISO 27001](https://img.shields.io/badge/ISO-27001%3A2022-brightgreen.svg)](https://ioneitsolutions.com/en)
[![CMMI Level 3](https://img.shields.io/badge/CMMI-Level%203-blue.svg)](https://ioneitsolutions.com/en)

An enterprise-grade, full-stack **Enterprise Asset & Infrastructure Inventory Management System (IMS)** designed for **iONE IT Solutions Pvt. Ltd.** to manage high-value Cloud, AI, Cybersecurity, and Enterprise IT hardware, software licenses, and project deployments.

Developed by **Bhumika** as an internship project under the guidance of **Anshul Dogra** at **iONE IT Solutions** (Noida Development Center).

---

## 🏢 About iONE IT Solutions
**Engineering Digital Nations. Since 2009.**

iONE IT Solutions is a premier enterprise digital transformation partner delivering mission-critical Cloud, ERP, AI, Cybersecurity, and Managed Services to Governments, public utilities, and large enterprises across 3 continents.
- **15+ Years** of Enterprise IT Excellence
- **500+** Mission-Critical Projects Delivered
- **50+** Enterprise & Government Clients
- **100%** Go-Live Success Rate
- **OEM Partnerships:** Oracle Gold Partner, AWS Advanced Partner, Google Cloud Partner, Microsoft Gold Partner, SAP Partner

**Corporate Headquarters:** 16th Floor, Hope Tower, Galaxy Blue Sapphire Plaza, Sector-4, Greater Noida 201309  
**Development Center:** 5th Floor, B-9A, Green Boulevard, Tower B, Sector-62, Noida 201301  

---

## 📋 Table of Contents
1. [Core Features](#-core-features)
2. [Tracked Enterprise Assets](#-tracked-enterprise-assets)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Getting Started & Installation](#-getting-started--installation)
6. [Demo Credentials](#-demo-credentials)
7. [API Endpoints](#-api-endpoints)
8. [Project Milestones](#-project-milestones)

---

## 🌟 Core Features

### 1. Executive Asset Dashboard & Analytics
- **Enterprise KPI Widgets:** Real-time visibility into Total Enterprise Assets, Inventory Valuation (₹4.8+ Crores), Critical Stock Depletion Alerts, OEM Partners, and Deployment Logs.
- **Visual Trend Analytics (Chart.js):**
  - Asset Inward (Procurement) vs. Client Project Deployments.
  - Domain Breakdown: Cloud Servers, SOC Security, Workstations, Licenses, and iTRACE WMS IoT.
- **Instant Restock Action:** 1-click procurement modal triggered directly from low-stock notification alerts.

### 2. Enterprise Hardware & License Catalog
- Comprehensive catalog tracking servers, switches, workstations, licenses, and WMS/HRMS devices.
- Dynamic search filtering by asset name, technology domain, or OEM vendor.
- Multi-dimensional status filtering (`In Stock`, `Low Stock`, `Depleted`).

### 3. Technology Domains & Strategic OEM Partners
- **Technology Domains:** Cloud & Server Infrastructure, Networking & Cybersecurity, Developer Workstations, Enterprise Software Licenses, iTRACE WMS IoT, and iHRMS Biometrics.
- **OEM Directory:** Vendor repository tracking Oracle India, Dell Technologies, Cisco Systems, Fortinet, and Zebra Technologies.

### 4. ACID-Compliant Inward & Deployment Engine
- **Asset Inward (IN):** Logs incoming OEM shipments against Purchase Orders.
- **Project Deployment (OUT):** Tracks equipment issued to Central Ministry e-Governance projects, state PSU utilities, and internal engineering teams with database row-level locking (`SELECT ... FOR UPDATE`).
- **Real-Time Projection Preview:** Instantly calculates projected on-hand stock prior to transaction execution.

### 5. Deployment Audit Trail & 1-Click CSV Export
- Immutable audit ledger supporting ISO 27001 and government asset compliance.
- Filter deployments by date range, asset, or movement classification.
- **Export to CSV:** Generates downloadable Excel/Sheets compatible `.csv` reports.

---

## 🖥️ Tracked Enterprise Assets

| Asset / Hardware Item | Domain | OEM Partner | Initial Valuation (₹) |
|---|---|---|---|
| **Dell PowerEdge R750 Rack Server** (2x Xeon Gold, 128GB RAM) | Cloud & Server Infra | Dell Technologies | ₹4,85,000 |
| **HPE ProLiant DL380 Gen10 Server** (OCI Hybrid Gateway) | Cloud & Server Infra | Dell Technologies | ₹3,95,000 |
| **Cisco Catalyst 9300 48-Port PoE+ Switch** | Networking & Security | Cisco Systems India | ₹2,25,000 |
| **Fortinet FortiGate 100F Next-Gen Firewall** (24x7 SOC) | Networking & Security | Fortinet India | ₹1,85,000 |
| **MacBook Pro 16" M3 Max** (36GB RAM, 1TB SSD) - Tech Lead | Workstations | Apple / Corporate Dist. | ₹3,19,900 |
| **Lenovo ThinkPad T14 Gen 4** (AMD Ryzen 7 PRO, 32GB) | Workstations | Lenovo / Corporate Dist. | ₹1,28,500 |
| **Dell Precision 5820 AI/ML Workstation** (NVIDIA RTX A6000) | Workstations | Dell Technologies | ₹4,20,000 |
| **Oracle Database 19c Enterprise Core License Pack** | Software Licenses | Oracle India | ₹8,50,000 |
| **Red Hat Enterprise Linux (RHEL) Data Center Subscription** | Software Licenses | Oracle / Partner | ₹1,42,000 |
| **iTRACE Industrial Rugged Android Barcode Scanner** (TC52x) | iTRACE WMS & IoT | Zebra Technologies | ₹68,000 |
| **iTRACE Fixed Long-Range RFID Portal Reader** | iTRACE WMS & IoT | Zebra Technologies | ₹1,75,000 |
| **iHRMS Face & Palm Recognition Biometric Device** | iHRMS Smart Devices | Zebra / Partner | ₹45,000 |

---

## 🚀 Getting Started & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/bhumika-bindal/Inventory_mngmnt_sys.git
cd Inventory_mngmnt_sys
```

### 2. Configure Environment (`Backend/.env`)
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=ims
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### 3. Install Backend Dependencies & Seed Data
```bash
cd Backend
npm install
npm run seed
```

### 4. Start Server
```bash
npm start
```
Visit **`http://localhost:3000`** in Google Chrome or Microsoft Edge.

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| **iONE Administrator** | `admin` | `admin123` |

*(Click "Auto-Fill" on the login screen for 1-click access).*

---

## 📄 Deliverable Documentation
- [`IMS_Requirements.md`](IMS_Requirements.md) – Software Requirements Specification (SRS)
- [`IMS_System_Design.md`](IMS_System_Design.md) – Enterprise 3-Tier Architecture & DFDs
- [`IMS_ER_Diagram.md`](IMS_ER_Diagram.md) – Relational Crow's Foot ER Diagram with Mermaid
- [`IMS_UIUX_Design.md`](IMS_UIUX_Design.md) – UI/UX Wireframes & Visual Tokens
- [`IMS_Schema.sql`](IMS_Schema.sql) – MySQL Production Schema & Initial Seed Data

---

## 📄 License
Internal enterprise project developed for **iONE IT Solutions Pvt. Ltd.** All rights reserved.
