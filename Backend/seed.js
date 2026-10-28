const mysql = require('./db');

async function seed() {
  try {
    console.log('--- Starting Database Seeding ---');

    // 1. Ensure Categories
    const categories = [
      [1, 'Stationery', 'Paper products, notebooks, pens, and desk utilities'],
      [2, 'Electronics', 'Computer peripherals, cords, adapters, and devices'],
      [3, 'Furniture', 'Ergonomic chairs, desks, storage racks, and cabinets'],
      [4, 'Hardware', 'Tools, measuring units, cables, and structural fittings'],
      [5, 'Office Supplies', 'Filing trays, staplers, paper shredders, and ink toners']
    ];

    for (const [id, name, desc] of categories) {
      await mysql.query(
        'INSERT INTO categories (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
        [id, name]
      );
    }
    console.log('Categories seeded.');

    // 2. Ensure Suppliers
    const suppliers = [
      [1, 'ABC Traders & Supplies', '+91 98765 43210', 'sales@abctraders.com', 'Plot 44, Okhla Industrial Area, New Delhi'],
      [2, 'Apex Tech Solutions', '+91 98111 22334', 'orders@apextech.in', 'Sector 62, Electronic City, Noida'],
      [3, 'Metro Paper Mills', '+91 98222 33445', 'info@metropaper.com', 'Industrial Area Phase 2, Chandigarh'],
      [4, 'Horizon Ergonomics', '+91 98333 44556', 'contact@horizonfurniture.com', 'Peenya Industrial Estate, Bengaluru']
    ];

    for (const [id, name, phone, email, address] of suppliers) {
      await mysql.query(
        'INSERT INTO suppliers (id, name, phone, email, address) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), email=VALUES(email), address=VALUES(address)',
        [id, name, phone, email, address]
      );
    }
    console.log('Suppliers seeded.');

    // 3. Ensure Products
    const products = [
      [1, 'Executive Hardcover Notebook (A5)', 1, 3, 150.00, 120, 15],
      [2, 'Gel Ink Pens (Pack of 10)', 1, 1, 180.00, 8, 10], // Low stock
      [3, 'Wireless Optical Mouse (2.4GHz)', 2, 2, 650.00, 45, 10],
      [4, 'USB-C Fast Charging Cable (1.5m)', 2, 2, 299.00, 3, 8], // Low stock
      [5, 'Ergonomic Mesh Office Chair', 3, 4, 6499.00, 14, 5],
      [6, 'Adjustable Standing Desk Riser', 3, 4, 8999.00, 6, 4],
      [7, 'Heavy Duty Metal Stapler (24/6)', 5, 1, 240.00, 2, 5], // Low stock
      [8, 'Laserjet Black Toner Cartridge', 5, 2, 1850.00, 18, 5]
    ];

    for (const [id, name, catId, supId, price, qty, limit] of products) {
      await mysql.query(
        `INSERT INTO products (id, name, category_id, supplier_id, price, quantity, low_stock_limit)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), category_id=VALUES(category_id), supplier_id=VALUES(supplier_id), price=VALUES(price), quantity=VALUES(quantity), low_stock_limit=VALUES(low_stock_limit)`,
        [id, name, catId, supId, price, qty, limit]
      );
    }
    console.log('Products seeded.');

    // 4. Clear and seed Stock Movements for rich reports & dashboard charts
    const [existingMovements] = await mysql.query('SELECT COUNT(*) as c FROM stock_movements');
    if (existingMovements[0].c <= 1) {
      const movements = [
        [1, 'IN', 100, 'Initial procurement from Metro Paper Mills', new Date(Date.now() - 10 * 86400000)],
        [1, 'IN', 20, 'Additional replenishment batch', new Date(Date.now() - 5 * 86400000)],
        [2, 'IN', 50, 'Procured 50 packs from ABC Traders', new Date(Date.now() - 8 * 86400000)],
        [2, 'OUT', 42, 'Dispatched for regional branch distribution', new Date(Date.now() - 2 * 86400000)],
        [3, 'IN', 60, 'Initial batch received from Apex Tech', new Date(Date.now() - 7 * 86400000)],
        [3, 'OUT', 15, 'Issued to software engineering department', new Date(Date.now() - 3 * 86400000)],
        [4, 'IN', 20, 'Vendor restock delivery', new Date(Date.now() - 6 * 86400000)],
        [4, 'OUT', 17, 'Sold & issued to development team workstations', new Date(Date.now() - 1 * 86400000)],
        [5, 'IN', 20, 'Corporate office furniture rollout', new Date(Date.now() - 12 * 86400000)],
        [5, 'OUT', 6, 'Allocated to new workstation pods', new Date(Date.now() - 4 * 86400000)],
        [7, 'IN', 15, 'Office supplies order received', new Date(Date.now() - 9 * 86400000)],
        [7, 'OUT', 13, 'Distributed to administrative departments', new Date(Date.now() - 1 * 86400000)]
      ];

      for (const [prodId, type, qty, note, date] of movements) {
        await mysql.query(
          'INSERT INTO stock_movements (product_id, type, quantity, note, date) VALUES (?, ?, ?, ?, ?)',
          [prodId, type, qty, note, date]
        );
      }
      console.log('Stock movements seeded.');
    }

    console.log('--- Seeding Complete Successfully! ---');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
