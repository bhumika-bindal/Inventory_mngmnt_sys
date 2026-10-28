const mysql = require('./db');

async function seed() {
  try {
    console.log('--- Starting iONE IT Solutions Enterprise Seeding ---');

    // 1. Ensure Categories for iONE IT Solutions
    const categories = [
      [1, 'Cloud & Server Infrastructure', 'Rack servers, blade chassis, SAN storage arrays, and hyperconverged infrastructure'],
      [2, 'Networking & Cybersecurity', 'Enterprise switches, core routers, Fortinet SOC firewalls, and hardware security modules'],
      [3, 'Engineering Workstations & Laptops', 'Developer MacBook Pros, AI/ML Precision workstations, and corporate ThinkPads'],
      [4, 'Enterprise Software Licenses', 'Oracle Database Core Packs, RHEL Enterprise subscriptions, VMware, and cloud licenses'],
      [5, 'iTRACE WMS & IoT Hardware', 'Industrial rugged handheld barcode terminals, RFID readers, and warehouse scanners'],
      [6, 'iHRMS Smart Biometric Devices', 'AI-powered facial recognition terminals, fingerprint sensors, and access controllers']
    ];

    for (const [id, name, desc] of categories) {
      await mysql.query(
        'INSERT INTO categories (id, name, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)',
        [id, name, desc]
      );
    }
    console.log('Categories seeded for iONE IT Solutions.');

    // 2. Ensure Suppliers / OEM Technology Partners
    const suppliers = [
      [1, 'Oracle India Pvt. Ltd.', '+91 120 400 5000', 'licensing@oracle.com', 'Oracle Technology Park, Knowledge Boulevard, Sector 62, Noida'],
      [2, 'Dell Technologies Enterprise', '+91 80 2500 3000', 'enterprise_sales@dell.com', 'Dell Campus, Outer Ring Road, Bengaluru, Karnataka'],
      [3, 'Cisco Systems India', '+91 124 456 7000', 'india-orders@cisco.com', 'Cisco Millennium Tower, Cyber City, Gurugram, Haryana'],
      [4, 'Fortinet Technologies India', '+91 11 4988 2000', 'soc-partners@fortinet.com', 'Cyber Hub, DLF Phase 2, Gurugram, Haryana'],
      [5, 'Zebra Technologies (WMS Partner)', '+91 80 6700 8000', 'supplychain@zebra.com', 'Prestige Tech Park, Marathahalli, Bengaluru'],
      [6, 'Apple & Enterprise Device Dist.', '+91 11 4050 9000', 'corporate-devices@redington.in', 'Redington House, Okhla Phase 3, New Delhi']
    ];

    for (const [id, name, phone, email, address] of suppliers) {
      await mysql.query(
        'INSERT INTO suppliers (id, name, phone, email, address) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), email=VALUES(email), address=VALUES(address)',
        [id, name, phone, email, address]
      );
    }
    console.log('OEM Partners & Suppliers seeded.');

    // 3. Clear older generic demo products to provide a fresh enterprise catalog
    await mysql.query('SET FOREIGN_KEY_CHECKS = 0');
    await mysql.query('TRUNCATE TABLE stock_movements');
    await mysql.query('TRUNCATE TABLE products');
    await mysql.query('SET FOREIGN_KEY_CHECKS = 1');

    // 4. Products for iONE IT Solutions
    const products = [
      [1, 'Dell PowerEdge R750 Rack Server (2x Intel Xeon Gold, 128GB RAM)', 1, 2, 485000.00, 12, 3],
      [2, 'HPE ProLiant DL380 Gen10 Server (OCI Hybrid Gateway)', 1, 2, 395000.00, 8, 2],
      [3, 'Cisco Catalyst 9300 48-Port Gigabit PoE+ Managed Switch', 2, 3, 225000.00, 16, 4],
      [4, 'Fortinet FortiGate 100F Next-Gen Firewall (24x7 SOC Appliance)', 2, 4, 185000.00, 3, 4], // Low Stock Alert
      [5, 'YubiKey 5 NFC Enterprise FIDO2 Security Keys (Pack of 50)', 2, 4, 145000.00, 4, 5], // Low Stock Alert
      [6, 'MacBook Pro 16" M3 Max (36GB Unified Memory, 1TB SSD) - Tech Lead', 3, 6, 319900.00, 24, 5],
      [7, 'Lenovo ThinkPad T14 Gen 4 (AMD Ryzen 7 PRO, 32GB) - Engineering', 3, 6, 128500.00, 35, 10],
      [8, 'Dell Precision 5820 Tower AI/Data Science Workstation (RTX A6000)', 3, 2, 420000.00, 6, 3],
      [9, 'Oracle Database 19c Enterprise Edition 4-Core Processor License', 4, 1, 850000.00, 15, 5],
      [10, 'Red Hat Enterprise Linux (RHEL) Data Center Premium Subscription', 4, 1, 142000.00, 20, 5],
      [11, 'iTRACE Industrial Android Barcode Scanner (Zebra TC52x Rugged)', 5, 5, 68000.00, 40, 10],
      [12, 'iTRACE Fixed Long-Range RFID Portal Reader (Warehouse Dock)', 5, 5, 175000.00, 2, 3], // Low Stock Alert
      [13, 'iHRMS Face & Palm Recognition Biometric Device (Cloud Sync)', 6, 5, 45000.00, 18, 5],
      [14, 'CAT6A 10Gbps Shielded Twisted Pair Cable Drum (305m)', 2, 3, 18500.00, 22, 6]
    ];

    for (const [id, name, catId, supId, price, qty, limit] of products) {
      await mysql.query(
        `INSERT INTO products (id, name, category_id, supplier_id, price, quantity, low_stock_limit)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, catId, supId, price, qty, limit]
      );
    }
    console.log('iONE Enterprise Products seeded.');

    // 5. Realistic Stock Movements representing iONE enterprise deliveries & deployments
    const movements = [
      [1, 'IN', 15, 'Received batch of Dell R750 servers from Dell Technologies', new Date(Date.now() - 14 * 86400000)],
      [1, 'OUT', 3, 'Dispatched & deployed for Central Ministry IT modernization project', new Date(Date.now() - 5 * 86400000)],
      [3, 'IN', 20, 'Procured Cisco Catalyst switches for Noida Data Center expansion', new Date(Date.now() - 12 * 86400000)],
      [3, 'OUT', 4, 'Installed at Greater Noida Headquarters Core Network', new Date(Date.now() - 4 * 86400000)],
      [4, 'IN', 5, 'Received FortiGate 100F firewalls for 24x7 SOC team', new Date(Date.now() - 9 * 86400000)],
      [4, 'OUT', 2, 'Deployed at Mumbai BFSI regional branch office', new Date(Date.now() - 2 * 86400000)],
      [6, 'IN', 30, 'Bulk delivery of MacBook Pro 16" M3 Max from Apple Reseller', new Date(Date.now() - 10 * 86400000)],
      [6, 'OUT', 6, 'Allocated to Cloud Architecture & Engineering Leads in Bengaluru', new Date(Date.now() - 3 * 86400000)],
      [7, 'IN', 45, 'Procured Lenovo ThinkPad T14 for newly onboarded DevOps cohort', new Date(Date.now() - 8 * 86400000)],
      [7, 'OUT', 10, 'Issued to Noida Sector-62 Development Center software engineers', new Date(Date.now() - 1 * 86400000)],
      [9, 'IN', 20, 'Procured Oracle Database 19c Enterprise Core licenses via OEM portal', new Date(Date.now() - 15 * 86400000)],
      [9, 'OUT', 5, 'Activated for State Power Utility PSU ERP implementation', new Date(Date.now() - 6 * 86400000)],
      [11, 'IN', 50, 'Zebra TC52x scanners received for iTRACE Smart WMS deployment', new Date(Date.now() - 7 * 86400000)],
      [11, 'OUT', 10, 'Shipped for Manufacturing Enterprise Smart Warehouse roll-out', new Date(Date.now() - 2 * 86400000)],
      [13, 'IN', 25, 'iHRMS Biometric terminals received from manufacturing vendor', new Date(Date.now() - 6 * 86400000)],
      [13, 'OUT', 7, 'Installed at Government Directorate facilities across NCR', new Date(Date.now() - 1 * 86400000)]
    ];

    for (const [prodId, type, qty, note, date] of movements) {
      await mysql.query(
        'INSERT INTO stock_movements (product_id, type, quantity, note, date) VALUES (?, ?, ?, ?, ?)',
        [prodId, type, qty, note, date]
      );
    }
    console.log('iONE Deployment Movements seeded.');

    console.log('--- iONE IT Solutions Seeding Complete Successfully! ---');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
