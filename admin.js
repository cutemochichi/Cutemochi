// --- ADMIN LOGIC ---
const API_URL = "https://newcute-api.cutesyfinds-shop.workers.dev"; // Use the same Worker URL
let products = [];
let editingId = null;
let draggedItem = null;

// Render products on load
window.onload = async () => {
    checkLogin();
};

function checkLogin() {
    let key = sessionStorage.getItem('adminKey');
    if (!key) {
        document.getElementById('loginModal').classList.add('open');
    } else {
        fetchProducts();
    }
}

function logout() {
    sessionStorage.removeItem('adminKey');
    location.reload();
}

async function login(e) {
    e.preventDefault();
    const input = document.getElementById('adminPassword');
    const btn = e.target.querySelector('button');
    const err = document.getElementById('loginError');
    const key = input.value;

    if (!key) return;

    btn.innerText = "Checking...";
    btn.disabled = true;
    err.style.display = 'none';

    try {
        const res = await fetch(`${API_URL}/api/check-auth`, {
            headers: { 'X-Admin-Key': key }
        });

        if (res.ok) {
            sessionStorage.setItem('adminKey', key);
            document.getElementById('loginModal').classList.remove('open');
            await fetchProducts();
        } else {
            err.style.display = 'block';
            input.value = '';
            input.focus();
        }
    } catch (error) {
        console.error("Login Error", error);
        alert("Erreur de connexion");
    } finally {
        btn.innerText = "Unlock Dashboard";
        btn.disabled = false;
    }
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-Admin-Key': sessionStorage.getItem('adminKey') || ''
    };
}

async function fetchProducts() {
    try {
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        products = await res.json();
        renderAdminList(products); // Initial Render
    } catch (e) {
        console.error("Error loading products:", e);
        alert("Error loading products. Check console.");
    }
}

// --- RENDER LIST ---

function renderAdminList(list = products) {
    const container = document.getElementById('productList');
    container.innerHTML = '';

    // Update Stats
    document.getElementById('totalProducts').innerText = list.length;

    if (list.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#888; padding:40px;">No products found.</div>';
        return;
    }

    list.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'p-card';
        // Staggered Animation
        div.style.animation = `slideUpFade 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s forwards`;
        div.style.opacity = '0'; // Start hidden

        div.dataset.index = index; // For drag & drop
        div.draggable = true; // Enable drag

        div.innerHTML = `
            <div class="p-img-box">
                <img src="${p.img}" class="p-img" loading="lazy">
                ${p.badge ? `<span class="p-badge">${p.badge}</span>` : (p.isBestSeller ? `<span class="p-badge" style="background:linear-gradient(45deg, #FFD700, #FFA500);">Best Seller</span>` : '')}
                <div class="toggle-stock ${isProductEffectiveOutOfStock(p) ? 'off' : ''}" onclick="toggleStock(${p.id}, ${!p.inStock})">
                    <span class="material-symbols-rounded">${isProductEffectiveOutOfStock(p) ? 'cancel' : 'check_circle'}</span>
                    ${isProductEffectiveOutOfStock(p) ? 'Out' : 'In Stock'}
                </div>
            </div>
            <div class="p-info">
                <h3 class="p-title">${p.name}</h3>
                <div class="p-meta">
                    <span>${p.cat}</span>
                    <span class="p-price">${p.price} DH</span>
                </div>
                <div class="p-actions">
                    <button class="btn-card btn-edit" onclick="editProduct(${p.id})">
                        <span class="material-symbols-rounded">edit</span> Edit
                    </button>
                    <button class="btn-card btn-delete" onclick="deleteProduct(${p.id})">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    setupDragAndDrop(); // Re-apply drag and drop after rendering
}

function filterProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) || p.cat.toLowerCase().includes(term));
    renderAdminList(filtered);
}

function isProductEffectiveOutOfStock(p) {
    // 1. Explicitly disabled by admin
    if (p.inStock === false) return true;

    // 2. Check actual stock levels (sum of all variants/sizes)
    let totalStock = 0;

    if (p.variants && p.variants.length > 0) {
        // Sum all variants
        p.variants.forEach(v => {
            let vQty = 0;
            if (typeof v.stock === 'number') {
                vQty = v.stock;
            } else if (typeof v.stock === 'string') {
                vQty = parseInt(v.stock) || 0;
            } else if (typeof v.stock === 'object') {
                vQty = Object.values(v.stock).reduce((a, b) => a + (parseInt(b) || 0), 0);
            } else {
                // simple 'true' or undefined fallback -> assume stock exists IF not explicitly false
                // But wait, if it's undefined, we might have an issue.
                // Safest to assume 0 if not present, OR 10 if we want default availability?
                // Given the user report "quantity that works", let's assume if it's not a number/object, check for truthiness
                vQty = v.stock ? 10 : 0;
            }
            totalStock += vQty;
        });
    } else {
        // Simple product or no variants defined
        if (typeof p.stock === 'number') {
            totalStock = p.stock;
        } else if (typeof p.stock === 'string') {
            totalStock = parseInt(p.stock) || 0;
        } else if (typeof p.stock === 'object') {
            totalStock = Object.values(p.stock).reduce((a, b) => a + (parseInt(b) || 0), 0);
        } else {
            // Fallback logic matches getStock: if undefined -> 10
            // But if user set it to 0, it should be 0.
            // If p.stock is undefined, maybe it IS out of stock?
            // Let's rely on standard fallback
            totalStock = (typeof p.stock !== 'undefined') ? (parseInt(p.stock) || 0) : 10;
        }
    }

    return totalStock <= 0;
}

// --- TOGGLE STOCK ---
async function toggleStock(id, status) {
    // Optimistic UI update
    const p = products.find(x => x.id === id);
    if (p) {
        p.inStock = status;
        renderAdminList(document.getElementById('searchInput').value ?
            products.filter(x => x.name.toLowerCase().includes(document.getElementById('searchInput').value.toLowerCase()))
            : products);
    }

    try {
        const pCurrent = products.find(x => x.id === id);
        // We need to send full object for PUT usually, but let's see if partial works? 
        // Logic in worker: UPDATE products SET ... takes all fields.
        // So we must send full object.

        // Let's re-use save logic payload construction or just fetch current complete obj + modify
        // Since 'p' is already the object from 'products' array, it should be complete enough EXCEPT if we missed some props in local state.
        // But local state 'products' comes from API 'SELECT *', so it is complete.

        const payload = { ...pCurrent, inStock: status };

        const res = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update stock');

    } catch (err) {
        alert("Error updating stock: " + err.message);
        // Revert
        if (p) p.inStock = !status;
        renderAdminList();
    }
}

// --- DRAG AND DROP ---
function setupDragAndDrop() {
    const cards = document.querySelectorAll('.p-card'); // Changed from .product-card to .p-card
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
    const draggableElements = [...container.querySelectorAll('.p-card:not(.dragging)')]; // Changed from .product-card to .p-card

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
    container.querySelectorAll('.p-card').forEach(card => { // Changed from .product-card to .p-card
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
    container.querySelectorAll('.p-card').forEach(card => { // Changed from .product-card to .p-card
        const originalIndex = parseInt(card.dataset.index);
        reorderedProducts.push(products[originalIndex]);
    });

    // Update global array (mutate in place to keep reference)
    products.length = 0;
    products.push(...reorderedProducts);

    // Re-render to update data-indices
    renderAdminList(products);

    // Sync with Server
    saveOrderToServer();
}

async function saveOrderToServer() {
    const updates = products.map((p, index) => ({
        id: p.id,
        order: index
    }));

    try {
        // Show saving state helper? (Optional, maybe just console for now or toast)
        const toast = document.createElement('div');
        toast.className = 'toast-saving';
        toast.innerText = 'Saving order...';
        document.body.appendChild(toast);

        const res = await fetch(`${API_URL}/api/reorder`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ updates })
        });

        if (!res.ok) throw new Error("Failed to save order");

        toast.innerText = 'Order Saved! ✅';
        setTimeout(() => toast.remove(), 2000);

    } catch (err) {
        console.error(err);
        alert("Failed to save order to server");
    }
}


// --- EDIT / ADD ---

function addNewProduct() {
    editingId = null;
    document.getElementById('modalTitle').innerText = "New Product";
    document.getElementById('productForm').reset();
    document.getElementById('variantsContainer').innerHTML = '';
    document.getElementById('p_images').value = ''; // Clear images
    document.getElementById('p_simpleStock').value = '';
    document.getElementById('simpleStockContainer').style.display = 'block';
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
    document.getElementById('p_desc').value = p.desc || '';
    document.getElementById('p_badge').value = p.badge || '';
    document.getElementById('p_bestSeller').checked = (p.isBestSeller === true);
    document.getElementById('p_inStock').checked = (p.inStock !== false);
    document.getElementById('p_images').value = (p.images && Array.isArray(p.images)) ? p.images.join(', ') : '';

    // Set Sizes
    document.getElementById('p_sizes').value = p.sizes ? p.sizes.join(', ') : '';

    // Variants
    const vContainer = document.getElementById('variantsContainer');
    vContainer.innerHTML = '';

    if (p.variants) {
        // Check if it's a "Standard" variant (simple product stock)
        if (p.variants.length === 1 && p.variants[0].name === 'Standard') {
            document.getElementById('p_simpleStock').value = p.variants[0].stock;
            // Don't add to variants container, keep it hidden in simple stock field
        } else {
            p.variants.forEach(v => {
                addVariantField(v, p.sizes);
            });
            document.getElementById('simpleStockContainer').style.display = 'none'; // Hide simple stock if real variants exist
        }
    } else {
        document.getElementById('simpleStockContainer').style.display = 'block';
    }

    toggleSimpleStockInput(); // Run visibility check

    openModal();
}

function toggleSimpleStockInput() {
    const hasVariants = document.getElementById('variantsContainer').children.length > 0;
    const stockContainer = document.getElementById('simpleStockContainer');

    if (hasVariants) {
        stockContainer.style.display = 'none';
        document.getElementById('p_simpleStock').value = '';
    } else {
        stockContainer.style.display = 'block';
    }
}

async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.status === 401) {
            alert("Mot de passe incorrect ou expiré.");
            sessionStorage.removeItem('adminKey');
            location.reload();
            return;
        }
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
                        <input type="number" value="${val}" class="v-stock-input v-stock" data-size="${size}">
                    </div>
                `;
            });
        } else {
            let val = currentStockMap['__simple'] || Object.values(currentStockMap)[0] || 10;
            html += `<input type="number" value="${val}" class="v-stock-input v-stock" placeholder="Qty">`;
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
                <input type="number" value="${val}" class="v-stock-input v-stock" data-size="${size}">
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
        stockHtml += `<input type="number" value="${val}" class="v-stock-input v-stock" placeholder="Qty">`;
    }

    // State management for color (hasColor vs noColor)
    const hasColor = hex && hex !== 'transparent';
    const displayHex = hasColor ? hex : '#000000'; // Default picker color if adding new

    const div = document.createElement('div');
    div.className = 'variant-item';

    // Cleaner Layout: Name & Image on top, then Stock, then optional Color
    div.innerHTML = `
        <div class="v-group">
            <label>Name</label>
            <input placeholder="e.g. Red / Style A" value="${name}" class="v-input v-name">
        </div>

        <div class="v-group">
            <label>Image (Optional)</label>
            <input placeholder="Paste URL..." value="${img}" class="v-input v-img">
        </div>

        <div class="v-group full-width">
             <label>Stock Control</label>
             <div class="stock-grid">${stockHtml}</div>
        </div>

        <div class="v-group">
            <label>Color / Hex</label>
            
            <!-- Hidden Input to store actual value sent to DB -->
            <input type="hidden" class="v-hex-value" value="${hasColor ? hex : 'transparent'}">

            <div class="v-color-row">
                <!-- Persistent Text Input -->
                <input type="text" class="v-hex-text" 
                       value="${hasColor ? hex : ''}" 
                       placeholder="#RRGGBB" 
                       oninput="handleHexInput(this)"
                       maxlength="7">

                <!-- Color Picker (Hidden if transparent, but we can toggle visibility) -->
                <!-- We wrap picker and remove button -->
                <div class="color-actions ${hasColor ? '' : 'hidden'}" id="activeColorUI">
                     <input type="color" class="v-color-input" value="${displayHex}" oninput="handlePickerInput(this)">
                     <button type="button" class="btn-remove-color" onclick="forceRemoveColor(this)" title="Remove Color">
                        <span class="material-symbols-rounded" style="font-size:16px;">close</span>
                     </button>
                </div>

                <!-- Empty State Action -->
                <div class="color-actions ${!hasColor ? '' : 'hidden'}" id="emptyColorUI">
                     <button type="button" class="btn-add-color" onclick="forceAddColor(this)" title="Open Picker" style="padding:0 12px; height:42px;">
                        <span class="material-symbols-rounded" style="font-size:16px;">palette</span>
                     </button>
                </div>
            </div>
        </div>

        <button type="button" class="btn-delete-variant" onclick="this.closest('.variant-item').remove(); toggleSimpleStockInput();" title="Remove Variant">
            <span class="material-symbols-rounded">close</span>
        </button>
    `;
    document.getElementById('variantsContainer').appendChild(div);
    toggleSimpleStockInput();
}

// --- NEW COLOR HANDLERS ---

function handleHexInput(input) {
    const parent = input.closest('.v-color-row');
    const activeUI = parent.querySelector('#activeColorUI');
    const emptyUI = parent.querySelector('#emptyColorUI');
    const hiddenVal = input.closest('.v-group').querySelector('.v-hex-value');
    const picker = activeUI.querySelector('.v-color-input');

    let val = input.value.trim();

    // Auto-formatting (add #)
    if (val.length > 0 && !val.startsWith('#')) {
        // Don't force it immediately while typing if it messes up cursor?
        // Actually, let's just prepend logic check
        // We won't modify input.value automatically to avoid annoying user, 
        // OR we modifiers ONLY if it looks like a hex char being typed.
    }

    if (val === '') {
        // If cleared: keep UI but set hidden to transparent?
        // Actually, if completely clear, maybe revert to No Color state IF user blurs?
        // For now, let's just update hidden to transparent if empty.
        hiddenVal.value = 'transparent';
        return;
    }

    let checkVal = val.startsWith('#') ? val : '#' + val;

    // Check if full valid hex (3 or 6 chars)
    if (/^#([0-9A-F]{3}){1,2}$/i.test(checkVal)) {
        // Valid Color!
        // 1. Activate UI
        activeUI.classList.remove('hidden');
        emptyUI.classList.add('hidden');

        // 2. Normalize
        if (checkVal.length === 4) {
            checkVal = '#' + checkVal[1] + checkVal[1] + checkVal[2] + checkVal[2] + checkVal[3] + checkVal[3];
        }

        // 3. Sync
        picker.value = checkVal;
        hiddenVal.value = checkVal;
    }
}

function handlePickerInput(picker) {
    const parent = picker.closest('.v-color-row');
    const textInput = parent.querySelector('.v-hex-text');
    const hiddenVal = picker.closest('.v-group').querySelector('.v-hex-value');

    textInput.value = picker.value;
    hiddenVal.value = picker.value;
}

function forceAddColor(btn) {
    const parent = btn.closest('.v-color-row');
    const activeUI = parent.querySelector('#activeColorUI');
    const emptyUI = parent.querySelector('#emptyColorUI');
    const textInput = parent.querySelector('.v-hex-text');
    const picker = activeUI.querySelector('.v-color-input');
    const hiddenVal = btn.closest('.v-group').querySelector('.v-hex-value');

    // Default black/white?
    // Picker defaults to black if not set.
    const def = '#000000';

    activeUI.classList.remove('hidden');
    emptyUI.classList.add('hidden');

    if (!textInput.value) {
        textInput.value = def;
        picker.value = def;
        hiddenVal.value = def;
    } else {
        // If text input had junk, maybe clear it or keep it?
        // If text input was empty, set def.
    }

    // Open picker?
    // picker.click(); // Browsers often block this unless trusted event.
}

function forceRemoveColor(btn) {
    const parent = btn.closest('.v-color-row');
    const activeUI = parent.querySelector('#activeColorUI');
    const emptyUI = parent.querySelector('#emptyColorUI');
    const textInput = parent.querySelector('.v-hex-text');
    const hiddenVal = btn.closest('.v-group').querySelector('.v-hex-value');

    activeUI.classList.add('hidden');
    emptyUI.classList.remove('hidden');

    textInput.value = '';
    hiddenVal.value = 'transparent';
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
    let badge = document.getElementById('p_badge').value;
    const isBestSeller = document.getElementById('p_bestSeller').checked;

    if (!badge) {
        badge = null;
    }
    const inStock = document.getElementById('p_inStock').checked;

    const sizes = getCleanSizes();

    const variantItems = document.querySelectorAll('.variant-item');
    let variants = [];
    variantItems.forEach(item => {
        const vName = item.querySelector('.v-name').value;
        const vImg = item.querySelector('.v-img').value;
        const vHex = item.querySelector('.v-hex-value').value; // Get robust value

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

    const simpleStock = document.getElementById('p_simpleStock').value;

    // If no explicit variants but we have simple stock, create a Standard variant
    if ((!variants || variants.length === 0) && simpleStock) {
        variants = [{
            name: 'Standard',
            img: img, // Use main image
            hex: '#ffffff',
            stock: parseInt(simpleStock) || 0
        }];
    }

    if (variants && variants.length === 0) variants = undefined;

    const productData = {
        name, cat, price, oldPrice, img, desc, badge, inStock,
        sizes: sizes.length > 0 ? sizes : null,
        variants: variants,
        // Images
        images: document.getElementById('p_images').value.split(',').map(s => s.trim()).filter(s => s !== '').length > 0
            ? document.getElementById('p_images').value.split(',').map(s => s.trim()).filter(s => s !== '')
            : null,
        variantStyle: editingId ? products.find(p => p.id === editingId).variantStyle : null,
        requireVariantSelection: editingId ? products.find(p => p.id === editingId).requireVariantSelection : false,
        isBestSeller: isBestSeller
    };

    try {
        let url = `${API_URL}/api/products`;
        let method = 'POST';

        if (editingId) {
            url = `${API_URL}/api/products/${editingId}`;
            method = 'PUT';
        }

        // Optimistic UI Update (Update screen before waiting for server)
        const btn = document.querySelector('#editModal button[type="submit"]');
        const oldText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });

        if (res.status === 401) {
            alert("Mot de passe incorrect !");
            sessionStorage.removeItem('adminKey');
            location.reload();
            return;
        }

        if (!res.ok) throw new Error("API Error");

        await fetchProducts(); // Reload all to get fresh ID/Sync
        // renderAdminList(); // fetchProducts already calls this if function exists

        closeModal();
    } catch (err) {
        alert("Error saving: " + err.message);
    } finally {
        const btn = document.querySelector('#editModal button[type="submit"]');
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


