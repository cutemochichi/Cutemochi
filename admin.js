// --- ADMIN LOGIC ---
const API_URL = "https://newcute-api.cutesyfinds-shop.workers.dev"; // Use the same Worker URL
let products = [];
let editingId = null;
let draggedItem = null;

// Render products on load
window.onload = async () => {
    await fetchProducts();
    renderAdminList();
};

async function fetchProducts() {
    try {
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        products = await res.json();
    } catch (e) {
        console.error("Error loading products:", e);
        alert("Error loading products. Check console.");
    }
}

function renderAdminList() {
    const list = document.getElementById('productList');
    if (!products || products.length === 0) {
        list.innerHTML = `<p style="text-align:center;">No products found.</p>`;
        return;
    }

    list.innerHTML = products.map((p, index) => `
        <div class="product-card" draggable="true" data-index="${index}">
            <span class="material-symbols-rounded drag-handle">drag_indicator</span>
            <img src="${p.img}" class="product-img" alt="img" onerror="this.src='https://via.placeholder.com/60'">
            <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <div class="product-meta">
                    <span class="tag">${p.cat}</span>
                    <span style="font-weight:700;">${p.price} DH</span>
                    ${p.inStock === false ? '<span class="tag out-of-stock">Out of Stock</span>' : ''}
                    ${p.sizes ? `<span style="font-size:0.8rem; color:#888;">Size: ${p.sizes.join(', ')}</span>` : ''}
                </div>
            </div>
            <div class="product-actions">
                <button class="btn-icon btn-edit" onclick="editProduct(${p.id})" title="Edit">
                    <span class="material-symbols-rounded">edit</span>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteProduct(${p.id})" title="Delete">
                    <span class="material-symbols-rounded">delete</span>
                </button>
            </div>
        </div>
    `).join('');

    setupDragAndDrop();
}

// --- DRAG AND DROP ---
function setupDragAndDrop() {
    const cards = document.querySelectorAll('.product-card');
    const container = document.getElementById('productList');

    cards.forEach(card => {
        card.addEventListener('dragstart', e => {
            draggedItem = card;
            setTimeout(() => card.style.opacity = '0.5', 0);
        });

        card.addEventListener('dragend', () => {
            setTimeout(() => {
                draggedItem.style.opacity = '1';
                draggedItem = null;
                // Re-sync products array order based on DOM
                updateProductOrder();
            }, 0);
        });

        card.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            if (afterElement == null) {
                container.appendChild(draggedItem);
            } else {
                container.insertBefore(draggedItem, afterElement);
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.product-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateProductOrder() {
    // Read DOM order to re-sort 'products' array
    const newOrder = [];
    const container = document.getElementById('productList');
    container.querySelectorAll('.product-card').forEach(card => {
        const index = parseInt(card.dataset.index);
        newOrder.push(products[index]);
    });

    // We can't just push(products[index]) because indices shift during drag if using this logic blindly,
    // but here we are mapping old index to object reference.
    // Actually, mapping existing objects by their original index is safe IF we don't mutate products array in-place during the loop.

    // Wait, the DOM cards have data-index from the *render time*.
    // If I drag card #0 to position #1, I now have card[data-index=0] at pos 1.
    // So if I iterate DOM and pick objects, I get the right new order.

    // Create new array based on DOM order
    const reorderedProducts = [];
    container.querySelectorAll('.product-card').forEach(card => {
        const originalIndex = parseInt(card.dataset.index);
        reorderedProducts.push(products[originalIndex]);
    });

    // Update global array (mutate in place to keep reference)
    products.length = 0;
    products.push(...reorderedProducts);

    // Re-render to update data-indices
    renderAdminList();
}


// --- EDIT / ADD ---

function addNewProduct() {
    editingId = null;
    document.getElementById('modalTitle').innerText = "New Product";
    document.getElementById('productForm').reset();
    document.getElementById('variantsContainer').innerHTML = '';
    document.getElementById('p_inStock').checked = true;
    openModal();
}

function editProduct(id) {
    editingId = id;
    const p = products.find(x => x.id === id);
    if (!p) return;

    document.getElementById('modalTitle').innerText = "Edit " + p.name;

    document.getElementById('p_id').value = p.id;
    document.getElementById('p_name').value = p.name;
    document.getElementById('p_cat').value = p.cat;
    document.getElementById('p_price').value = p.price;
    document.getElementById('p_oldPrice').value = p.oldPrice || '';
    document.getElementById('p_img').value = p.img;
    document.getElementById('p_desc').value = p.desc || '';
    document.getElementById('p_badge').value = p.badge || '';
    document.getElementById('p_inStock').checked = (p.inStock !== false);

    // Set Sizes
    document.getElementById('p_sizes').value = p.sizes ? p.sizes.join(', ') : '';

    // Variants
    const vContainer = document.getElementById('variantsContainer');
    vContainer.innerHTML = '';

    if (p.variants) {
        p.variants.forEach(v => {
            addVariantField(v, p.sizes);
        });
    }

    openModal();
}

async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error("Failed to delete");

        // Remove locally immediately for speed, then refresh
        products = products.filter(p => p.id !== id);
        renderAdminList();

        await fetchProducts(); // Full sync
    } catch (err) {
        alert("Error deleting: " + err.message);
    }
}

// --- VARIANT FIELDS ---

function getCleanSizes() {
    const val = document.getElementById('p_sizes').value;
    if (!val.trim()) return [];
    return val.split(',').map(s => s.trim()).filter(s => s !== '');
}

function refreshVariantStockInputs() {
    const currentSizes = getCleanSizes();
    const rows = document.querySelectorAll('.variant-item');

    rows.forEach(row => {
        const stockContainer = row.querySelector('.stock-grid');
        const currentInputs = row.querySelectorAll('.v-stock');
        let currentStockMap = {};

        if (currentInputs.length === 1 && !currentInputs[0].dataset.size) {
            currentStockMap['__simple'] = currentInputs[0].value;
        } else {
            currentInputs.forEach(input => {
                const size = input.dataset.size;
                currentStockMap[size] = input.value;
            });
        }

        let html = '';
        if (currentSizes.length > 0) {
            currentSizes.forEach(size => {
                const val = currentStockMap[size] || currentStockMap['__simple'] || 0;
                html += `
                    <div class="stock-cell">
                        <label>${size}</label>
                        <input type="number" value="${val}" class="v-stock" data-size="${size}">
                    </div>
                `;
            });
        } else {
            let val = currentStockMap['__simple'] || Object.values(currentStockMap)[0] || 10;
            html += `<input type="number" value="${val}" class="v-stock" style="width:100%; border-radius:8px;" placeholder="Qty">`;
        }
        stockContainer.innerHTML = html;
    });
}

function addVariantField(vData = null, sizesOverride = null) {
    const name = vData ? vData.name : '';
    const img = vData ? vData.img : '';
    const hex = vData ? vData.hex : '#000000';

    const sizes = sizesOverride || getCleanSizes();
    let stockHtml = '';

    if (sizes && sizes.length > 0) {
        sizes.forEach(size => {
            let val = 0;
            if (vData) {
                if (typeof vData.stock === 'object') {
                    val = vData.stock[size] || 0;
                } else if (typeof vData.stock === 'number') {
                    val = vData.stock;
                }
            }
            stockHtml += `
            <div class="stock-cell">
                <label>${size}</label>
                <input type="number" value="${val}" class="v-stock" data-size="${size}">
            </div>`;
        });
    } else {
        let val = 10;
        if (vData) {
            if (typeof vData.stock === 'number') val = vData.stock;
            else if (typeof vData.stock === 'object') {
                val = Object.values(vData.stock).reduce((a, b) => a + b, 0);
            }
        }
        stockHtml += `<input type="number" value="${val}" class="v-stock" style="width:100%; border-radius:8px;" placeholder="Qty">`;
    }

    const div = document.createElement('div');
    div.className = 'variant-item';
    div.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column; gap:8px; min-width:150px;">
            <label style="font-size:0.75rem; margin:0; color:#888;">Name</label>
            <input placeholder="e.g. Red" value="${name}" class="v-name" style="padding:8px;">
        </div>
        <div style="flex:1; display:flex; flex-direction:column; gap:8px; min-width:150px;">
            <label style="font-size:0.75rem; margin:0; color:#888;">Image</label>
            <input placeholder="Image" value="${img}" class="v-img" style="padding:8px;">
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <label style="font-size:0.75rem; margin:0; color:#888;">Color</label>
            <input value="${hex}" type="color" class="v-hex" style="width:40px; padding:0; height:40px; border-radius:50%; overflow:hidden; border:none; cursor:pointer;">
        </div>
        <div style="flex:2;">
             <label style="font-size:0.75rem; margin:0 0 4px 0; color:#888; display:block;">Stock</label>
             <div class="stock-grid">${stockHtml}</div>
        </div>
        <button type="button" class="btn-icon btn-delete" style="align-self:center;" onclick="this.closest('.variant-item').remove()">
            <span class="material-symbols-rounded">delete</span>
        </button>
    `;
    document.getElementById('variantsContainer').appendChild(div);
}

// --- SAVE ---

async function saveProduct(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('p_name').value;
    const cat = document.getElementById('p_cat').value;
    const price = parseInt(document.getElementById('p_price').value);
    const oldPrice = document.getElementById('p_oldPrice').value ? parseInt(document.getElementById('p_oldPrice').value) : null;
    const img = document.getElementById('p_img').value;
    const desc = document.getElementById('p_desc').value;
    const badge = document.getElementById('p_badge').value;
    const inStock = document.getElementById('p_inStock').checked;

    const sizes = getCleanSizes();

    const variantItems = document.querySelectorAll('.variant-item');
    let variants = [];
    variantItems.forEach(item => {
        const vName = item.querySelector('.v-name').value;
        const vImg = item.querySelector('.v-img').value;
        const vHex = item.querySelector('.v-hex').value;

        let stockData;
        if (sizes.length > 0) {
            stockData = {};
            item.querySelectorAll('.v-stock').forEach(input => {
                const s = input.dataset.size;
                stockData[s] = parseInt(input.value) || 0;
            });
        } else {
            const input = item.querySelector('.v-stock');
            stockData = parseInt(input.value) || 0;
        }

        variants.push({
            name: vName,
            img: vImg,
            hex: vHex,
            stock: stockData
        });
    });

    if (variants.length === 0) variants = undefined;

    const productData = {
        name, cat, price, oldPrice, img, desc, badge, inStock,
        sizes: sizes.length > 0 ? sizes : null,
        variants: variants,
        // Preserve existing images/style if editing (simpler logic for now)
        images: editingId ? products.find(p => p.id === editingId).images : null,
        variantStyle: editingId ? products.find(p => p.id === editingId).variantStyle : null,
        requireVariantSelection: editingId ? products.find(p => p.id === editingId).requireVariantSelection : false
    };

    try {
        let url = `${API_URL}/api/products`;
        let method = 'POST';

        if (editingId) {
            url = `${API_URL}/api/products/${editingId}`;
            method = 'PUT';
        }

        // Optimistic UI Update (Update screen before waiting for server)
        const btn = document.querySelector('#editModal .btn-success');
        const oldText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (!res.ok) throw new Error("API Error");

        await fetchProducts(); // Reload all to get fresh ID/Sync

        closeModal();
    } catch (err) {
        alert("Error saving: " + err.message);
    } finally {
        const btn = document.querySelector('#editModal .btn-success');
        if (btn) {
            btn.innerText = "Save Product";
            btn.disabled = false;
        }
    }
}

function openModal() {
    document.getElementById('editModal').classList.add('open');
}
function closeModal() {
    document.getElementById('editModal').classList.remove('open');
}

// Export function removed (API is now used)
