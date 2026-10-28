// ==========================================================================
// IMS Client-side API & UI Utility Library
// Prepared for: Bhumika | Supervisor: Anshul Dogra
// ==========================================================================

// Automatically determine API base URL (relative if hosted via server, else localhost:3000)
const API_URL = window.location.origin.includes('localhost:3000') 
  ? '/api' 
  : 'http://localhost:3000/api';

// Retrieve saved JWT token
function getToken() {
  return localStorage.getItem('ims_token') || localStorage.getItem('token');
}

// Check authentication status and redirect if unauthenticated
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'index.html';
    return null;
  }
  return token;
}

// User logout
function logout() {
  localStorage.removeItem('ims_token');
  localStorage.removeItem('token');
  localStorage.removeItem('ims_user');
  localStorage.removeItem('username');
  window.location.href = 'index.html';
}

// Unified API Fetch Wrapper
async function apiFetch(path, options = {}) {
  const token = getToken();
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('ims_token');
      localStorage.removeItem('token');
      showToast('Session expired. Please log in again.', 'warning');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
      return { ok: false, status: res.status, data: { error: 'Unauthorized' } };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('API Fetch Error:', err);
    showToast('Cannot connect to server. Please ensure the backend is running.', 'error');
    return { ok: false, status: 0, data: { error: err.message } };
  }
}

// Toast Notification Engine
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span>${iconMap[type] || '🔔'}</span>
    <span style="flex:1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  }, 3500);
}

// Modal Helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Inject Shared Persistent Sidebar & Top Header
function renderAppShell(activePageTitle) {
  const username = localStorage.getItem('ims_user') || localStorage.getItem('username') || 'Admin';

  const shellNav = `
    <aside class="sidebar" id="appSidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">📦</div>
        <div class="sidebar-title">
          <h2>IMS Portal</h2>
          <p>Inventory Control</p>
        </div>
      </div>

      <div class="sidebar-nav">
        <div class="nav-label">Main Menu</div>
        <a href="dashboard.html" class="${activePageTitle === 'Dashboard' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </a>
        <a href="products.html" class="${activePageTitle === 'Products' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Products
        </a>
        <a href="categories.html" class="${activePageTitle === 'Categories' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
          Categories
        </a>
        <a href="suppliers.html" class="${activePageTitle === 'Suppliers' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          Suppliers
        </a>

        <div class="nav-label" style="margin-top:10px;">Stock Management</div>
        <a href="stock.html" class="${activePageTitle === 'Stock Ops' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          Stock In / Out
        </a>
        <a href="reports.html" class="${activePageTitle === 'Reports' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Audit Reports
        </a>
      </div>

      <div class="sidebar-footer">
        <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
        <div class="user-info">
          <div class="user-name">${username}</div>
          <div class="user-role">Administrator</div>
        </div>
        <button class="btn-logout" title="Sign Out" onclick="logout()">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </div>
    </aside>
  `;

  const sidebarMount = document.getElementById('sidebar-mount');
  if (sidebarMount) {
    sidebarMount.innerHTML = shellNav;
  }

  // Load and display dynamic low stock alert badge in topbar
  updateAlertBadge();
}

// Fetch low stock count for topbar alert pill
async function updateAlertBadge() {
  const badge = document.getElementById('lowStockPill');
  if (!badge) return;
  const res = await apiFetch('/products/alerts/low');
  if (res && res.ok && res.data && res.data.length > 0) {
    badge.style.display = 'inline-flex';
    badge.innerHTML = `⚠️ ${res.data.length} Low Stock Alert${res.data.length > 1 ? 's' : ''}`;
  } else {
    badge.style.display = 'none';
  }
}

// Mobile sidebar toggle
function toggleMobileMenu() {
  const sidebar = document.getElementById('appSidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}