const mysql = require('./db');

async function migrate() {
  try {
    console.log('Running database schema updates...');

    // 1. Add is_deleted to products if not exists
    const [pCols] = await mysql.query('DESCRIBE products');
    if (!pCols.some(c => c.Field === 'is_deleted')) {
      await mysql.query('ALTER TABLE products ADD COLUMN is_deleted TINYINT(1) DEFAULT 0');
      console.log('Added is_deleted column to products');
    }

    // 2. Add product_name to stock_movements if not exists
    const [sCols] = await mysql.query('DESCRIBE stock_movements');
    if (!sCols.some(c => c.Field === 'product_name')) {
      await mysql.query('ALTER TABLE stock_movements ADD COLUMN product_name VARCHAR(150) DEFAULT NULL AFTER product_id');
      console.log('Added product_name column to stock_movements');
    }

    // 3. Backfill product_name in stock_movements from products
    await mysql.query('UPDATE stock_movements sm JOIN products p ON sm.product_id = p.id SET sm.product_name = p.name WHERE sm.product_name IS NULL');
    console.log('Backfilled existing product_name records');

    // 4. Update foreign key on stock_movements so it NEVER deletes movements
    const [fks] = await mysql.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'ims' 
        AND TABLE_NAME = 'stock_movements' 
        AND COLUMN_NAME = 'product_id' 
        AND REFERENCED_TABLE_NAME = 'products'
    `);

    for (const fk of fks) {
      try {
        await mysql.query(`ALTER TABLE stock_movements DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
        console.log(`Dropped cascade foreign key: ${fk.CONSTRAINT_NAME}`);
      } catch (e) {
        console.log(`Note on drop FK: ${e.message}`);
      }
    }

    await mysql.query('ALTER TABLE stock_movements MODIFY COLUMN product_id INT NULL');
    await mysql.query('ALTER TABLE stock_movements ADD CONSTRAINT fk_stock_movements_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE');
    console.log('Applied ON DELETE SET NULL foreign key constraint to preserve audit history');

    console.log('--- Schema Migration Complete ---');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
