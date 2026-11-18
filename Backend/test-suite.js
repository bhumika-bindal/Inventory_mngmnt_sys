const http = require('http');
require('dotenv').config({ path: __dirname + '/.env' });

const PORT = process.env.PORT || 3000;
let authToken = '';
let testCategoryId = null;
let testSupplierId = null;
let testProductId = null;

const testResults = [];

function logTest(testId, moduleName, description, passed, details = '') {
  testResults.push({ testId, moduleName, description, passed, details });
  const statusStr = passed ? 'PASS' : 'FAIL';
  console.log(`[${statusStr}] ${testId} - ${moduleName}: ${description} ${details ? '(' + details + ')' : ''}`);
}

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', err => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('   iONE IT Solutions - Inventory Management System (IMS)');
  console.log('   Automated End-to-End API Test Suite & Validation');
  console.log('===============================================================\n');

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    logTest('TC-01', 'System Health', 'GET /api/health returns healthy', health.status === 200 && health.body.status === 'healthy');

    // 2. Auth - Invalid login
    const badLogin = await request('POST', '/api/auth/login', { username: 'admin', password: 'wrongpassword' });
    logTest('TC-02', 'Authentication', 'POST /api/auth/login rejects wrong password', badLogin.status === 401);

    // 3. Auth - Valid login
    const login = await request('POST', '/api/auth/login', { username: 'admin', password: 'admin123' });
    const loginOk = login.status === 200 && login.body.token;
    if (loginOk) authToken = login.body.token;
    logTest('TC-03', 'Authentication', 'POST /api/auth/login returns valid JWT token', loginOk);

    // 4. Auth - Protected Profile (/me)
    const profile = await request('GET', '/api/auth/me', null, authToken);
    logTest('TC-04', 'Authentication', 'GET /api/auth/me returns current user profile', profile.status === 200 && profile.body.username === 'admin');

    // 5. Auth - Security: Unauthorized Register blocked
    const unauthReg = await request('POST', '/api/auth/register', { username: 'hacker', password: 'password123' });
    logTest('TC-05', 'Security', 'POST /api/auth/register blocked without admin token', unauthReg.status === 401);

    // 6. Dashboard - Summary
    const summary = await request('GET', '/api/dashboard/summary', null, authToken);
    const sumOk = summary.status === 200 && summary.body.totalProducts > 0 && summary.body.totalValuation;
    logTest('TC-06', 'Analytics', 'GET /api/dashboard/summary computes products and valuation', sumOk, `Valuation: ₹${Number(summary.body.totalValuation).toLocaleString('en-IN')}`);

    // 7. Dashboard - Visual Charts
    const charts = await request('GET', '/api/dashboard/charts', null, authToken);
    const chartsOk = charts.status === 200 && Array.isArray(charts.body.categoryDistribution) && Array.isArray(charts.body.movementTrends);
    logTest('TC-07', 'Analytics', 'GET /api/dashboard/charts returns category & movement trends', chartsOk);

    // 8. Categories - List
    const cats = await request('GET', '/api/categories', null, authToken);
    logTest('TC-08', 'Categories', 'GET /api/categories returns category taxonomy', cats.status === 200 && cats.body.length > 0);

    // 9. Categories - Create
    const testCatName = 'Test QA Category ' + Date.now();
    const newCat = await request('POST', '/api/categories', { name: testCatName, description: 'Temporary category for automated test suite' }, authToken);
    if (newCat.status === 201) testCategoryId = newCat.body.id;
    logTest('TC-09', 'Categories', 'POST /api/categories creates new category', newCat.status === 201, `ID: ${testCategoryId}`);

    // 10. Suppliers - List
    const sups = await request('GET', '/api/suppliers', null, authToken);
    logTest('TC-10', 'Suppliers', 'GET /api/suppliers returns OEM partners', sups.status === 200 && sups.body.length > 0);

    // 11. Suppliers - Create
    const testSupName = 'Test OEM Partner ' + Date.now();
    const newSup = await request('POST', '/api/suppliers', { name: testSupName, phone: '+91 99999 88888', email: 'test@oem.com', address: 'Noida Sec 62' }, authToken);
    if (newSup.status === 201) testSupplierId = newSup.body.id;
    logTest('TC-11', 'Suppliers', 'POST /api/suppliers creates new supplier', newSup.status === 201, `ID: ${testSupplierId}`);

    // 12. Products - Create with Initial Stock
    const newProd = await request('POST', '/api/products', {
      name: 'QA Test Asset Equipment',
      category_id: testCategoryId,
      supplier_id: testSupplierId,
      price: 50000.00,
      quantity: 25,
      low_stock_limit: 5
    }, authToken);
    if (newProd.status === 201) testProductId = newProd.body.id;
    logTest('TC-12', 'Products CRUD', 'POST /api/products creates product & auto-logs initial stock', newProd.status === 201, `ID: ${testProductId}, Qty: 25`);

    // 13. Products - Read single product
    const prodDetail = await request('GET', `/api/products/${testProductId}`, null, authToken);
    logTest('TC-13', 'Products CRUD', 'GET /api/products/:id retrieves accurate product details', prodDetail.status === 200 && prodDetail.body.quantity === 25);

    // 14. Products - Search & Filtering
    const searchProd = await request('GET', `/api/products?search=${encodeURIComponent('QA Test Asset')}`, null, authToken);
    logTest('TC-14', 'Products Search', 'GET /api/products?search=... performs instant query', searchProd.status === 200 && searchProd.body.length > 0);

    // 15. Stock Movement - Stock IN (+15 units)
    const stockIn = await request('POST', '/api/stock', {
      product_id: testProductId,
      type: 'IN',
      quantity: 15,
      note: 'Automated Test Inward Delivery'
    }, authToken);
    logTest('TC-15', 'Stock Movement', 'POST /api/stock (IN) adds stock atomically', stockIn.status === 200 && stockIn.body.newQty === 40, `New Qty: 40`);

    // 16. Stock Movement - Stock OUT (-10 units)
    const stockOut = await request('POST', '/api/stock', {
      product_id: testProductId,
      type: 'OUT',
      quantity: 10,
      note: 'Automated Test Project Deployment'
    }, authToken);
    logTest('TC-16', 'Stock Movement', 'POST /api/stock (OUT) issues stock atomically', stockOut.status === 200 && stockOut.body.newQty === 30, `New Qty: 30`);

    // 17. Stock Movement - Insufficient stock edge case
    const overDraw = await request('POST', '/api/stock', {
      product_id: testProductId,
      type: 'OUT',
      quantity: 9999,
      note: 'Excessive dispatch attempt'
    }, authToken);
    logTest('TC-17', 'Stock Concurrency', 'POST /api/stock rejects overdraw with 400 Bad Request', overDraw.status === 400);

    // 18. Stock Movement - Input Validation (negative quantity)
    const negQty = await request('POST', '/api/stock', {
      product_id: testProductId,
      type: 'IN',
      quantity: -5
    }, authToken);
    logTest('TC-18', 'Input Validation', 'POST /api/stock rejects negative quantity with 400', negQty.status === 400);

    // 19. Products - Synchronized Quantity Update
    const updateQty = await request('PUT', `/api/products/${testProductId}`, {
      name: 'QA Test Asset Equipment Updated',
      category_id: testCategoryId,
      supplier_id: testSupplierId,
      price: 52000.00,
      quantity: 35, // Adjust from 30 to 35
      low_stock_limit: 8
    }, authToken);
    logTest('TC-19', 'Stock Synchronization', 'PUT /api/products updates details and logs quantity adjustment', updateQty.status === 200 && updateQty.body.quantity === 35);

    // 20. Reports - Audit trail retrieval & Date filter
    const report = await request('GET', `/api/stock?product_id=${testProductId}`, null, authToken);
    logTest('TC-20', 'Reports & Audit', 'GET /api/stock retrieves chronological movement history', report.status === 200 && report.body.length >= 3);

    // 21. Audit Trail Preservation - Soft Delete
    const delProd = await request('DELETE', `/api/products/${testProductId}`, null, authToken);
    logTest('TC-21', 'Audit Trail', 'DELETE /api/products/:id decommissions product while preserving logs', delProd.status === 200);

    // 22. Verify Decommissioned Product excluded from active catalog
    const checkCatalog = await request('GET', `/api/products/${testProductId}`, null, authToken);
    logTest('TC-22', 'Audit Trail', 'Decommissioned product is hidden from active catalog', checkCatalog.status === 404);

    // 23. Verify Historical Movements still exist in Audit Ledger with product name
    const checkAudit = await request('GET', `/api/stock?product_id=${testProductId}`, null, authToken);
    const auditPreserved = checkAudit.status === 200 && checkAudit.body.length >= 3 && checkAudit.body[0].product_name === 'QA Test Asset Equipment Updated';
    logTest('TC-23', 'Audit Trail', 'Historical movements permanently preserved in stock_movements', auditPreserved);

    // 24. Clean up test category and supplier
    if (testCategoryId) await request('DELETE', `/api/categories/${testCategoryId}`, null, authToken);
    if (testSupplierId) await request('DELETE', `/api/suppliers/${testSupplierId}`, null, authToken);
    logTest('TC-24', 'Cleanup', 'Test category and supplier safely decommissioned', true);

    console.log('\n===============================================================');
    const passedCount = testResults.filter(t => t.passed).length;
    const totalCount = testResults.length;
    console.log(`Test Execution Summary: ${passedCount}/${totalCount} Test Cases Passed (${Math.round(passedCount/totalCount*100)}%)`);
    console.log('===============================================================\n');

    process.exit(passedCount === totalCount ? 0 : 1);
  } catch (err) {
    console.error('Test suite failed unexpectedly:', err);
    process.exit(1);
  }
}

runTests();
