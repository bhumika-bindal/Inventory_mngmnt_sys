# UI/UX Design & Wireframe Specifications
## Inventory Management System (IMS)
**Prepared by:** Bhumika  
**Project Phase:** UI/UX Design (Phase 3)  
**Target Completion Date:** 3 October 2026  
**Document Version:** 2.0  

---

## 1. Design System & Visual Tokens

The user interface follows a modern SaaS dashboard aesthetic featuring crisp typography, soft glassmorphism borders, elevation shadows, and color-coded status badges.

### 1.1 Color Palette
- **Primary Brand Color:** Indigo `#4f46e5` (Hover: `#4338ca`) – Used for primary action buttons, active navigation states, and focal elements.
- **Background Slate:** `#0f172a` (Sidebar dark accent) and `#f8fafc` (Canvas background) – Delivers high contrast and clean visual separation.
- **Surface / Card Background:** `#ffffff` with subtle borders (`1px solid #e2e8f0`) and soft shadows (`box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05)`).
- **Semantic Accents:**
  - **Success / Stock IN / In-Stock:** Emerald Green (`#10b981`)
  - **Warning / Low Stock Alert:** Amber (`#f59e0b`)
  - **Danger / Stock OUT / Out-of-Stock:** Rose Crimson (`#ef4444`)
  - **Informational / Counts:** Sky Blue (`#0ea5e9`)

### 1.2 Typography
- **Primary Typeface:** `'Plus Jakarta Sans'`, `'Inter'`, system sans-serif.
- **Scale:**
  - `H1 / Page Title:` 26px / 700 bold
  - `H2 / Section Title:` 18px / 600 semi-bold
  - `Stat Widget Number:` 32px / 800 extra-bold
  - `Body / Table Cells:` 14px / 400 regular
  - `Small / Badges / Subtitles:` 12px / 600 medium

---

## 2. Information Architecture (Sitemap)

```
[IMS Portal]
  │
  ├── Login Portal (index.html)
  │
  └── Protected App Shell (Sidebar + Top Header + Dynamic Content)
        ├── 1. Dashboard (dashboard.html)
        │      ├── Executive KPI Summary (Products, Valuation, Low Stock, Suppliers)
        │      ├── Dynamic Visual Charts (Movement Trend, Category Breakdown)
        │      └── Immediate Low Stock Alert Action Grid
        │
        ├── 2. Products Catalog (products.html)
        │      ├── Live Search & Filter Bar (Category, Supplier, Stock Health)
        │      ├── Add Product Modal
        │      ├── Edit Product Modal
        │      └── Data Table with Badges & Instant Action Controls
        │
        ├── 3. Category Manager (categories.html)
        │      ├── Category List with Associated Product Counts
        │      └── Add / Edit Category Modal
        │
        ├── 4. Supplier Directory (suppliers.html)
        │      ├── Vendor Cards & Contact Grid
        │      └── Add / Edit Supplier Modal
        │
        ├── 5. Stock Operations (stock.html)
        │      ├── Fast In/Out Movement Form with Live Stock Preview
        │      └── Filterable Transaction Ledger
        │
        └── 6. Reports & Audit Trail (reports.html)
               ├── Date Range & Movement Type Filtering
               ├── KPI Summary Counters (Total In, Total Out, Net Balance)
               └── 1-Click CSV Export & Print View
```

---

## 3. Structural Wireframes

### 3.1 Authentication Wireframe (`index.html`)
```
+-----------------------------------------------------------+
|                                                           |
|             [ IMS ] Inventory Management System           |
|                Enterprise Portal - Login                  |
|                                                           |
|       +---------------------------------------------+     |
|       |  Username: [ admin                        ] |     |
|       |  Password: [ **********                   ] |     |
|       |                                             |     |
|       |  [       Sign In to Dashboard  ->       ]   |     |
|       |                                             |     |
|       |  Demo Credential Hint: admin / admin123     |     |
|       +---------------------------------------------+     |
|                                                           |
+-----------------------------------------------------------+
```

### 3.2 Dashboard Wireframe (`dashboard.html`)
```
+---------------------------------------------------------------------------------+
| [LOGO] IMS  |  Search...              | [Alerts: 3] | User: Bhumika (Admin)  [V] |
+-----------+---------------------------------------------------------------------+
| Dashboard |  DASHBOARD OVERVIEW                                                 |
| Products  |  +---------------+ +---------------+ +---------------+ +----------+ |
| Categories|  | Total Products| | Valuation (₹) | | Low Stock     | |Suppliers | |
| Suppliers |  |     142       | |   ₹1,85,400   | |   4 (Alert!)  | |    12    | |
| Stock Ops |  +---------------+ +---------------+ +---------------+ +----------+ |
| Reports   |                                                                     |
|           |  +--------------------------------+ +-----------------------------+ |
| [Logout]  |  | Chart: Stock In vs Out Trend   | | Chart: Category Breakdown   | |
|           |  | [ Jan - Oct Line Graph ]       | | [ Doughnut Chart ]          | |
|           |  +--------------------------------+ +-----------------------------+ |
|           |                                                                     |
|           |  LOW STOCK NOTIFICATIONS                                            |
|           |  +----------------------------------------------------------------+ |
|           |  | Product Name    | Category    | Qty  | Threshold | Action      | |
|           |  | Ballpoint Pens  | Stationery  |  2   |    10     | [+ Restock] | |
|           |  | Desk Organizer  | Furniture   |  1   |     5     | [+ Restock] | |
|           |  +----------------------------------------------------------------+ |
+-----------+---------------------------------------------------------------------+
```

### 3.3 Products Management Wireframe (`products.html`)
```
+---------------------------------------------------------------------------------+
| PRODUCTS DIRECTORY                                   [+ Add New Product Modal]  |
|                                                                                 |
| Filter: [Search product name... ] [Category: All V] [Stock: Low Stock Only V]   |
|                                                                                 |
| +----+----------------------+------------+------------+---------+-----+-------+ |
| | ID | Product Name         | Category   | Supplier   | Price   | Qty |Action | |
| +----+----------------------+------------+------------+---------+-----+-------+ |
| | 01 | Executive Notebook   | Stationery | ABC Supply | ₹150.00 | 120 |[E] [D]| |
| | 02 | Wireless Mouse       | Electronics| Apex Tech  | ₹750.00 |   4 |[E] [D]| |
| +----+----------------------+------------+------------+---------+-----+-------+ |
+---------------------------------------------------------------------------------+
```

### 3.4 Stock Operations Wireframe (`stock.html`)
```
+---------------------------------------------------------------------------------+
| STOCK IN / OUT TRANSACTION ENGINE                                               |
|                                                                                 |
| Record Transaction Form:                                                        |
| +-----------------------------------------------------------------------------+ |
| | Product: [ Wireless Mouse V ] Current Stock: 4 units                        | |
| | Type:    (o) Stock IN (Restock)    ( ) Stock OUT (Sales / Issue)            | |
| | Quantity:[ 25 ]  ==> Projected New Stock: 29 units                          | |
| | Reason:  [ Restocked from Apex Tech delivery order #8841 ]                  | |
| | [ Record Movement Button ]                                                  | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| TRANSACTION AUDIT TRAIL                                                         |
| +----+-----------------+-------+-----+--------------------+-------------------+ |
| | ID | Product         | Type  | Qty | Note / Reference   | Date & Time       | |
| +----+-----------------+-------+-----+--------------------+-------------------+ |
| | 52 | Wireless Mouse  | IN    |  25 | Restocked from PO  | 27 Oct 2026, 11:30| |
| +----+-----------------+-------+-----+--------------------+-------------------+ |
+---------------------------------------------------------------------------------+
```

### 3.5 Reports & Audit Export Wireframe (`reports.html`)
```
+---------------------------------------------------------------------------------+
| INVENTORY AUDIT & REPORTS                            [ Download CSV ] [ Print ] |
|                                                                                 |
| Filter by Date: [ 2026-10-01 ] to [ 2026-10-27 ]   Type: [ All V ]              |
|                                                                                 |
| SUMMARY COUNTERS:                                                               |
| Total IN Movements: 420 units | Total OUT Movements: 185 units | Net: +235 units|
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | ID | Date / Time        | Product Name   | Type | Qty | Reference Note      | |
| +-----------------------------------------------------------------------------+ |
| | ...| ...                | ...            | ...  | ... | ...                 | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+
```

---

## 4. Responsive Breakpoint Standards

- **Desktop (>= 1024px):** Persistent sidebar navigation (240px width), multi-column card grids, full data tables.
- **Tablet (768px - 1023px):** Compact sidebar or collapsible menu, 2-column KPI cards, horizontally scrollable data tables.
- **Mobile (< 768px):** Off-canvas slide-out navigation with backdrop overlay, single-column stacked KPI cards, touch-optimized modal dialogs.
