// Global state
let isAdmin = false;
let currentOrder = null;
let currentTable = null;
let allTables = [];
let allProducts = [];
let allIngredients = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTables();
    setTodayDates();
});

// Section navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
    
    // Load section data
    switch(sectionId) {
        case 'tables':
            loadTables();
            break;
        case 'products':
            loadProducts();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'recipes':
            loadRecipes();
            break;
        case 'tableManagement':
            loadTableManagement();
            break;
    }
}

// Set today's date for date inputs
function setTodayDates() {
    const today = new Date().toISOString().split('T')[0];
    const inputs = ['reportFromDate', 'reportToDate', 'analyticsFromDate', 'analyticsToDate'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = today;
    });
}

// Admin Login
function showAdminLogin() {
    if (isAdmin) {
        isAdmin = false;
        updateAdminSections();
        alert('Admin çıkışı yapıldı');
    } else {
        document.getElementById('loginModal').classList.add('show');
    }
}

async function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    
    const data = await response.json();
    if (data.ok) {
        isAdmin = true;
        updateAdminSections();
        closeLoginModal();
        alert('Admin girişi başarılı');
    } else {
        document.getElementById('loginError').textContent = data.message || 'Giriş başarısız';
    }
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').textContent = '';
}

function updateAdminSections() {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(s => {
        s.style.display = isAdmin ? 'block' : 'none';
    });
}

// Tables
async function loadTables() {
    const response = await fetch('/api/tables');
    allTables = await response.json();
    
    const grid = document.getElementById('tableGrid');
    grid.innerHTML = allTables.map(table => {
        const isEmpty = !table.open_order_id;
        const statusClass = isEmpty ? 'empty' : 'occupied';
        const statusText = isEmpty ? 'Boş' : `Dolu - ${table.open_total.toFixed(2)} ₺`;
        
        return `
            <div class="table-card ${statusClass}" onclick="openTable(${table.id}, '${table.name}')">
                <h3>${table.name}</h3>
                <div class="status">${statusText}</div>
            </div>
        `;
    }).join('');
}

async function openTable(tableId, tableName) {
    currentTable = { id: tableId, name: tableName };
    
    // Get or create order
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_id: tableId })
    });
    currentOrder = await response.json();
    
    // Load products
    const productsResponse = await fetch('/api/products');
    allProducts = await productsResponse.json();
    
    document.getElementById('orderTableName').textContent = tableName;
    document.getElementById('orderProductList').innerHTML = allProducts.map(p => `
        <div class="product-btn" onclick="addProductToOrder(${p.id})">
            <div><strong>${p.name}</strong></div>
            <div>${p.price.toFixed(2)} ₺</div>
        </div>
    `).join('');
    
    await loadOrderItems();
    document.getElementById('orderModal').classList.add('show');
}

async function loadOrderItems() {
    if (!currentOrder) return;
    
    const response = await fetch(`/api/orders/${currentOrder.id}/items`);
    const items = await response.json();
    
    const orderResponse = await fetch(`/api/orders?status=open`);
    const orders = await orderResponse.json();
    const order = orders.find(o => o.id === currentOrder.id);
    
    document.getElementById('orderItemsList').innerHTML = items.map(item => `
        <div class="order-item">
            <div>
                <strong>${item.product_name}</strong><br>
                ${item.qty} x ${item.price.toFixed(2)} ₺
            </div>
            <button onclick="removeOrderItem(${item.id})">Sil</button>
        </div>
    `).join('');
    
    document.getElementById('orderTotal').textContent = order ? order.total.toFixed(2) : '0.00';
}

async function addProductToOrder(productId) {
    const response = await fetch(`/api/orders/${currentOrder.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, qty: 1 })
    });
    
    if (response.ok) {
        await loadOrderItems();
    }
}

async function removeOrderItem(itemId) {
    const response = await fetch(`/api/orders/${currentOrder.id}/items/${itemId}`, {
        method: 'DELETE'
    });
    
    if (response.ok) {
        await loadOrderItems();
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('show');
    currentOrder = null;
    currentTable = null;
    loadTables();
}

async function printOrder() {
    if (!currentOrder) return;
    
    const response = await fetch(`/api/orders/${currentOrder.id}/print`, {
        method: 'POST'
    });
    
    if (response.ok) {
        alert('Sipariş yazıcıya gönderildi');
    } else {
        alert('Yazdırma başarısız');
    }
}

function payOrder() {
    const total = document.getElementById('orderTotal').textContent;
    document.getElementById('paymentAmount').textContent = `${total} ₺`;
    document.getElementById('paymentModal').classList.add('show');
}

async function processPayment(method) {
    const total = parseFloat(document.getElementById('orderTotal').textContent);
    
    const response = await fetch(`/api/orders/${currentOrder.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, amount: total })
    });
    
    if (response.ok) {
        await fetch(`/api/orders/${currentOrder.id}/close`, { method: 'POST' });
        alert('Ödeme alındı');
        closePaymentModal();
        closeOrderModal();
    }
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('show');
}

// Products
async function loadProducts() {
    const response = await fetch('/api/products');
    allProducts = await response.json();
    
    document.getElementById('productList').innerHTML = allProducts.map(p => `
        <div class="list-item">
            <div class="list-item-info">
                <strong>${p.name}</strong><br>
                <span>${p.price.toFixed(2)} ₺</span>
            </div>
            ${isAdmin ? `
                <div class="list-item-actions">
                    <button onclick="deleteProduct(${p.id})">Sil</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function addProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    
    if (!name || !price) {
        alert('Lütfen tüm alanları doldurun');
        return;
    }
    
    const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price })
    });
    
    if (response.ok) {
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        await loadProducts();
    }
}

async function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (response.ok) {
        await loadProducts();
    }
}

// Inventory
async function loadInventory() {
    const [ingredientsResponse, stocksResponse] = await Promise.all([
        fetch('/api/ingredients'),
        fetch('/api/stocks')
    ]);
    
    allIngredients = await ingredientsResponse.json();
    const stocks = await stocksResponse.json();
    
    // Update stock ingredient select
    document.getElementById('stockIngredientSelect').innerHTML = allIngredients.map(i => 
        `<option value="${i.id}">${i.name} (${i.unit})</option>`
    ).join('');
    
    document.getElementById('stockList').innerHTML = stocks.map(s => `
        <div class="list-item">
            <div class="list-item-info">
                <strong>${s.ingredient_name}</strong><br>
                <span>Stok: ${s.qty} ${s.ingredient_unit}</span>
            </div>
        </div>
    `).join('');
}

async function addIngredient() {
    const name = document.getElementById('ingredientName').value;
    const unit = document.getElementById('ingredientUnit').value;
    
    if (!name || !unit) {
        alert('Lütfen tüm alanları doldurun');
        return;
    }
    
    const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, unit })
    });
    
    if (response.ok) {
        document.getElementById('ingredientName').value = '';
        document.getElementById('ingredientUnit').value = '';
        await loadInventory();
    }
}

async function updateStock() {
    const ingredient_id = parseInt(document.getElementById('stockIngredientSelect').value);
    const qty = parseFloat(document.getElementById('stockQty').value);
    
    if (!ingredient_id || qty == null) {
        alert('Lütfen tüm alanları doldurun');
        return;
    }
    
    const response = await fetch('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient_id, qty })
    });
    
    if (response.ok) {
        document.getElementById('stockQty').value = '';
        await loadInventory();
    }
}

// Recipes
async function loadRecipes() {
    const [productsResponse, ingredientsResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/ingredients')
    ]);
    
    allProducts = await productsResponse.json();
    allIngredients = await ingredientsResponse.json();
    
    // Update selects
    document.getElementById('recipeProductSelect').innerHTML = allProducts.map(p => 
        `<option value="${p.id}">${p.name}</option>`
    ).join('');
    
    document.getElementById('recipeIngredientSelect').innerHTML = allIngredients.map(i => 
        `<option value="${i.id}">${i.name} (${i.unit})</option>`
    ).join('');
    
    // Load recipes for all products
    let recipesHtml = '';
    for (const product of allProducts) {
        const response = await fetch(`/api/recipes/${product.id}`);
        const recipes = await response.json();
        
        if (recipes.length > 0) {
            recipesHtml += `
                <div class="list-item">
                    <div class="list-item-info">
                        <strong>${product.name}</strong><br>
                        ${recipes.map(r => `${r.ingredient_name}: ${r.qty} ${r.ingredient_unit}`).join(', ')}
                    </div>
                </div>
            `;
        }
    }
    
    document.getElementById('recipeList').innerHTML = recipesHtml || '<p>Henüz reçete eklenmedi</p>';
}

async function addRecipeItem() {
    const product_id = parseInt(document.getElementById('recipeProductSelect').value);
    const ingredient_id = parseInt(document.getElementById('recipeIngredientSelect').value);
    const qty = parseFloat(document.getElementById('recipeQty').value);
    
    if (!product_id || !ingredient_id || !qty) {
        alert('Lütfen tüm alanları doldurun');
        return;
    }
    
    const response = await fetch(`/api/recipes/${product_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient_id, qty })
    });
    
    if (response.ok) {
        document.getElementById('recipeQty').value = '';
        await loadRecipes();
    }
}

// Reports
async function generateReport() {
    const from = document.getElementById('reportFromDate').value;
    const to = document.getElementById('reportToDate').value;
    
    if (!from || !to) {
        alert('Lütfen tarih aralığı seçin');
        return;
    }
    
    const [summaryResponse, productsResponse] = await Promise.all([
        fetch(`/api/reports/summary?from=${from}&to=${to}`),
        fetch(`/api/reports/products?from=${from}&to=${to}`)
    ]);
    
    const summary = await summaryResponse.json();
    const products = await productsResponse.json();
    
    document.getElementById('reportSummary').innerHTML = `
        <h3>Özet</h3>
        <p><strong>Toplam Sipariş:</strong> ${summary.order_count || 0}</p>
        <p><strong>Toplam Gelir:</strong> ${(summary.total_revenue || 0).toFixed(2)} ₺</p>
    `;
    
    document.getElementById('reportProducts').innerHTML = products.map(p => `
        <div class="list-item">
            <div class="list-item-info">
                <strong>${p.name}</strong><br>
                <span>Adet: ${p.qty} | Gelir: ${p.revenue.toFixed(2)} ₺</span>
            </div>
        </div>
    `).join('');
}

function exportExcel() {
    const from = document.getElementById('reportFromDate').value;
    const to = document.getElementById('reportToDate').value;
    
    if (!from || !to) {
        alert('Lütfen önce rapor oluşturun');
        return;
    }
    
    window.location.href = `/api/reports/export?from=${from}&to=${to}`;
}

// Analytics
async function generateAnalytics() {
    const from = document.getElementById('analyticsFromDate').value;
    const to = document.getElementById('analyticsToDate').value;
    
    if (!from || !to) {
        alert('Lütfen tarih aralığı seçin');
        return;
    }
    
    const response = await fetch(`/api/reports/products?from=${from}&to=${to}`);
    const products = await response.json();
    
    document.getElementById('analyticsList').innerHTML = products.map((p, idx) => `
        <div class="list-item">
            <div class="list-item-info">
                <strong>#${idx + 1} ${p.name}</strong><br>
                <span>Satış: ${p.qty} adet | Gelir: ${p.revenue.toFixed(2)} ₺ | Ort: ${(p.revenue / p.qty).toFixed(2)} ₺</span>
            </div>
        </div>
    `).join('');
}

// Table Management
async function loadTableManagement() {
    const response = await fetch('/api/tables');
    allTables = await response.json();
    
    // Update rename select
    document.getElementById('renameTableSelect').innerHTML = allTables.map(t => 
        `<option value="${t.id}">${t.name}</option>`
    ).join('');
    
    // Update merge selects
    const mergeOptions = allTables.map(t => 
        `<option value="${t.id}">${t.name}</option>`
    ).join('');
    document.getElementById('mergeSourceTable').innerHTML = mergeOptions;
    document.getElementById('mergeTargetTable').innerHTML = mergeOptions;
    
    document.getElementById('tableManagementList').innerHTML = allTables.map(t => `
        <div class="list-item">
            <div class="list-item-info">
                <strong>${t.name}</strong>
            </div>
            ${isAdmin ? `
                <div class="list-item-actions">
                    <button onclick="deleteTable(${t.id})">Sil</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function addTable() {
    const name = document.getElementById('newTableName').value;
    
    if (!name) {
        alert('Lütfen masa adı girin');
        return;
    }
    
    const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    
    if (response.ok) {
        document.getElementById('newTableName').value = '';
        await loadTableManagement();
        await loadTables();
    }
}

async function deleteTable(id) {
    if (!confirm('Bu masayı silmek istediğinizden emin misiniz?')) return;
    
    const response = await fetch(`/api/tables/${id}`, { method: 'DELETE' });
    if (response.ok) {
        await loadTableManagement();
        await loadTables();
    }
}

async function renameTable() {
    const table_id = parseInt(document.getElementById('renameTableSelect').value);
    const name = document.getElementById('renameTableName').value;
    
    if (!table_id || !name) {
        alert('Lütfen tüm alanları doldurun');
        return;
    }
    
    const response = await fetch(`/api/tables/${table_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    
    if (response.ok) {
        document.getElementById('renameTableName').value = '';
        await loadTableManagement();
        await loadTables();
        alert('Masa ismi değiştirildi');
    }
}

async function mergeTables() {
    const source_id = parseInt(document.getElementById('mergeSourceTable').value);
    const target_id = parseInt(document.getElementById('mergeTargetTable').value);
    
    if (source_id === target_id) {
        alert('Farklı masalar seçin');
        return;
    }
    
    if (!confirm('Bu masaları birleştirmek istediğinizden emin misiniz?')) return;
    
    const response = await fetch(`/api/tables/${source_id}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_table_id: target_id })
    });
    
    const data = await response.json();
    if (response.ok) {
        alert(data.message || 'Masalar birleştirildi');
        await loadTableManagement();
        await loadTables();
    } else {
        alert(data.error || 'Birleştirme başarısız');
    }
}
