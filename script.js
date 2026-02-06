/* =========================================
   Cutesy Finds - Application Logic
   ========================================= */

// --- DATA ---
const products = [
    { id: 1, name: "Peluche Hello Kitty", price: 450, oldPrice: 550, cat: "plushies", badge: "Best", img: "hellokitty.png", desc: "Peluche premium super douce pour un max de câlins.", variants: [{ name: "Rose", hex: "#ff8fa3" }] },
    { id: 2, name: "Mug Nuage", price: 150, oldPrice: 0, cat: "decor", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800", desc: "Mug en céramique peint à la main en forme de nuage.", variants: [{ name: "Crème", hex: "#fefae0" }] },
    { id: 3, name: "Sac Fluffy", price: 350, oldPrice: 400, cat: "bags", badge: "New", img: "bag.jpg", desc: "Sac fourre-tout esthétique avec texture fausse fourrure.", variants: [{ name: "Blanc", hex: "#fff" }] },
    { id: 4, name: "Pyjama Kuromi", price: 300, oldPrice: 0, cat: "accessories", img: "pijama.jpg", desc: "Ensemble pyjama super confortable et mignon.", variants: [{ name: "Mauve", hex: "#cdb4db" }] },
    { id: 5, name: "Tapis Pastel", price: 220, oldPrice: 0, cat: "decor", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800", desc: "Tapis de bureau imperméable avec base antidérapante.", variants: [{ name: "Pêche", hex: "#ffc8dd" }] },
    { id: 6, name: "Coussin Fleur", price: 280, oldPrice: 350, cat: "decor", badge: "Sale", img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=800", desc: "Coussin d'assise en peluche en forme de fleur.", variants: [{ name: "Jaune", hex: "#ffe5b4" }] },
    { id: 7, name: "Lunettes Cœur", price: 120, oldPrice: 150, cat: "accessories", img: "ndader.jpg", desc: "Lunettes de soleil rétro en forme de cœur.", variants: [{ name: "Noir", hex: "#000" }] },
    { id: 8, name: "Pantoufles Cinnamoroll", price: 250, oldPrice: 0, cat: "decor", img: "pantofa.jpg", desc: "Pantoufles ultra douces pour rester au chaud.", variants: [{ name: "Blanc", hex: "#fff" }] }
];

// --- CONFIG: HERO SLIDES (Editable) ---
const heroSlides = [
    {
        image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000",
        tag: "New Drop! 🌸",
        title: "Making your space <br>soft & dreamy.",
        buttons: [
            { text: "Shop Collection", action: "navigate('shop')" }
        ]
    },
    {
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2000",
        tag: "So Fluffy! 🧸",
        title: "Huggable friends <br>for everyone.",
        buttons: [
            { text: "Shop Plushies", action: "filterShop('plushies'); navigate('shop');" }
        ]
    }
];

// --- STATE ---
let cart = JSON.parse(localStorage.getItem('cart_v22') || '[]');
let activeCat = 'all';
let historyStack = ['home'];
let selectedCity = null;

// --- INIT ---
window.onload = () => {
    navigate('home', false);
    updateCart();
    renderHero();
    startSlider();
    renderProducts();
    renderShop();
    populateCities();
};

// --- SLIDER LOGIC ---
function renderHero() {
    const container = document.getElementById('heroSlider');
    if (!container) return;

    container.innerHTML = heroSlides.map((slide, i) => `
    <div class="slide ${i === 0 ? 'active' : ''}" style="background-image: url('${slide.image}');">
      <div class="slide-overlay">
        <span class="hand" style="font-size:2.5rem; color:var(--color-primary); transform:rotate(-2deg); margin-bottom:12px; display:inline-block;">${slide.tag}</span>
        <h1 style="font-size:clamp(2.5rem, 5vw, 5rem); line-height:1.05; margin-bottom:24px; color:var(--text-dark);">${slide.title}</h1>
        <div style="display:flex; gap:20px;">
          ${slide.buttons.map(btn => `<button class="btn btn-primary" style="padding:16px 36px; font-size:1.1rem;" onclick="${btn.action}">${btn.text}</button>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function startSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length < 2) return;
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
}

// --- NAVIGATION ---
function navigate(viewId, push = true) {
    if (push) historyStack.push(viewId);

    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    // Show target
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Update Nav State
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    const navLink = document.getElementById(`link-${viewId}`);
    if (navLink) navLink.classList.add('active');

    const tabBtn = document.getElementById(`tab-${viewId}`);
    if (tabBtn) tabBtn.classList.add('active');

    // Special logic for shop resets
    if (viewId === 'shop') renderShop();
    // Special logic for checkout
    if (viewId === 'checkout') renderCheckoutItems();
}

function goBack() {
    if (historyStack.length > 1) {
        historyStack.pop();
        navigate(historyStack[historyStack.length - 1], false);
    } else {
        navigate('home', false);
    }
}

// --- PRODUCT RENDERING ---
function createCard(p) {
    const priceDisplay = p.oldPrice > 0
        ? `<span class="price-sale">${p.price} DH</span> <s style="font-size:0.85em; opacity:0.5; font-weight:400;">${p.oldPrice}</s>`
        : `${p.price} DH`;

    const badgeHtml = p.badge ? `<div class="tag-sale">${p.badge}</div>` : '';

    return `
    <div class="card" onclick="openProduct(${p.id})">
      <div class="card-img-box">
        ${badgeHtml}
        <img src="${p.img}" class="card-img" alt="${p.name}" loading="lazy">
        <button class="btn-quick-add" onclick="event.stopPropagation(); addToCart(${p.id})">
          <span class="material-symbols-rounded">add</span>
        </button>
      </div>
      <h3>${p.name}</h3>
      <p>${priceDisplay}</p>
    </div>
  `;
}

function renderProducts() {
    const container = document.getElementById('homeGrid');
    if (!container) return;
    // Show top 4 items for home
    container.innerHTML = products.slice(0, 4).map(createCard).join('');
}

function renderShop() {
    const container = document.getElementById('shopGrid');
    if (!container) return;

    let filtered = products;
    if (activeCat === 'sale') filtered = products.filter(p => p.oldPrice > 0);
    else if (activeCat !== 'all') filtered = products.filter(p => p.cat === activeCat);

    // update chips
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    const activeChip = document.getElementById(`filt-${activeCat}`);
    if (activeChip) activeChip.classList.add('active');

    container.innerHTML = filtered.map(createCard).join('');
}

function filterShop(cat) {
    activeCat = cat;
    renderShop();
}

// --- PDP (Product Details) ---
function openProduct(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;

    const container = document.getElementById('pdpContainer');
    const priceHtml = p.oldPrice > 0
        ? `<div class="price-block"><span class="price-now sale-price">${p.price} DH</span> <span class="price-was">${p.oldPrice} DH</span></div>`
        : `<div class="price-block"><span class="price-now">${p.price} DH</span></div>`;

    const swatches = p.variants.map((v, i) => `
    <div class="swatch ${i === 0 ? 'selected' : ''}" style="background:${v.hex}" title="${v.name}" onclick="selectSwatch(this)"></div>
  `).join('');

    container.innerHTML = `
    <div class="pdp-visual">
       <img src="${p.img}" alt="${p.name}">
    </div>
    <div class="pdp-content">
       <h1>${p.name}</h1>
       <div class="pdp-badges">
         ${p.badge ? `<span class="pdp-tag">${p.badge}</span>` : ''}
         <span class="pdp-tag">${p.cat.toUpperCase()}</span>
       </div>
       ${priceHtml}
       <p style="font-size:1.1rem; color:var(--text-gray); margin-bottom:30px; line-height:1.7;">${p.desc}</p>
       
       <label style="font-weight:700; display:block; margin-bottom:12px;">Color</label>
       <div class="swatch-group">${swatches}</div>
       
       <div style="display:flex; gap:16px;">
         <button class="btn btn-primary" style="flex:1; padding:18px;" onclick="addToCart(${p.id}); showToast('Added to bag! 🛍️')">Add to Bag</button>
       </div>
    </div>
  `;

    navigate('product');
}

function selectSwatch(el) {
    el.parentNode.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
}

// --- CART LOGIC ---
function addToCart(id) {
    const item = cart.find(x => x.id === id);
    if (item) item.qty++;
    else cart.push({ id, qty: 1 });
    saveCart();
    updateCart();
    renderCartList();
}

function removeFromCart(id) {
    cart = cart.filter(x => x.id !== id);
    saveCart();
    updateCart();
    renderCartList();
}

function updateQty(id, delta) {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty < 1) removeFromCart(id);
    else {
        saveCart();
        updateCart();
        renderCartList();
    }
}

function saveCart() {
    localStorage.setItem('cart_v22', JSON.stringify(cart));
}

function updateCart() {
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById('cartBadge').innerText = count;
    document.getElementById('mobBadge').innerText = count;

    document.getElementById('cartBadge').classList.toggle('visible', count > 0);
    document.getElementById('mobBadge').classList.toggle('visible', count > 0);
}

// --- DRAWER ---
function openCart() {
    document.getElementById('scrim').classList.add('open');
    document.getElementById('cartDrawer').classList.add('open');
    renderCartList();
}

function closeDrawers() {
    document.getElementById('scrim').classList.remove('open');
    document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
}

function renderCartList() {
    const list = document.getElementById('cartList');
    if (cart.length === 0) {
        list.innerHTML = `<div style="text-align:center; margin-top:60px; color:#ccc;">
      <span class="material-symbols-rounded" style="font-size:64px; margin-bottom:16px;">shopping_bag</span>
      <p>Your bag is empty.</p>
    </div>`;
        document.getElementById('drawerTotal').innerText = '0 DH';
        return;
    }

    let total = 0;
    list.innerHTML = cart.map(item => {
        const p = products.find(x => x.id === item.id);
        if (!p) return '';
        total += p.price * item.qty;
        return `
      <div class="cart-item">
        <img src="${p.img}" class="cart-img">
        <div style="flex:1;">
          <h4 style="margin-bottom:4px;">${p.name}</h4>
          <div style="color:var(--text-gray); font-size:0.9rem;">${p.price} DH</div>
        </div>
        <div class="qty-ctrl">
           <span onclick="updateQty(${item.id}, -1)" style="cursor:pointer; padding:0 8px;">-</span>
           <span>${item.qty}</span>
           <span onclick="updateQty(${item.id}, 1)" style="cursor:pointer; padding:0 8px;">+</span>
        </div>
      </div>
    `;
    }).join('');

    document.getElementById('drawerTotal').innerText = `${total} DH`;

    // also update checkout total if visible
    if (cxTotal) cxTotal.innerText = `${total} DH`;

    renderCheckoutItems(); // Sync checkout view if open
}

function renderCheckoutItems() {
    const container = document.getElementById('checkoutItems');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p style="color:var(--text-gray); text-align:center;">Votre panier est vide.</p>';
        return;
    }

    container.innerHTML = cart.map(item => {
        const p = products.find(prod => prod.id === item.id);
        if (!p) return '';
        return `
            <div style="display:flex; gap:12px; margin-bottom:12px; align-items:center;">
                <div style="position:relative;">
                    <img src="${p.img}" style="width:50px; height:50px; border-radius:8px; object-fit:cover; background:#f4f4f6;">
                    <div style="position:absolute; -top:5px; -right:5px; background:var(--text-dark); color:white; width:20px; height:20px; border-radius:50%; font-size:0.75rem; display:flex; align-items:center; justify-content:center; font-weight:700;">${item.qty}</div>
                </div>
                <div style="flex:1;">
                   <div style="font-weight:600; font-size:0.95rem;">${p.name}</div>
                   <div style="color:var(--text-gray); font-size:0.85rem;">${p.variants && p.variants[0] ? p.variants[0].name : ''}</div>
                </div>
                <div style="font-weight:700;">${p.price * item.qty} DH</div>
            </div>
        `;
    }).join('');
}

// --- CITIES & CHECKOUT ---
function populateCities() {
    const dropdown = document.getElementById('cityOptions');
    if (!dropdown) return;

    // Sort cities by name
    cities.sort((a, b) => a.name.localeCompare(b.name));

    dropdown.innerHTML = '';
    cities.forEach(c => {
        const div = document.createElement('div');
        div.className = 'select-option';
        div.innerText = c.name;
        div.onclick = () => selectCity(c);
        dropdown.appendChild(div);
    });

    // Outside click closer (only add once)
    if (!window.hasClickCloseListener) {
        document.addEventListener('click', closeDropdownOutside);
        window.hasClickCloseListener = true;
    }
}

function closeDropdownOutside(e) {
    const wrap = document.getElementById('citySelect');
    if (wrap && !wrap.contains(e.target)) {
        document.getElementById('cityOptions').classList.remove('open');
        document.getElementById('cityTrigger').classList.remove('active');
    }
}

function toggleCityDropdown() {
    document.getElementById('cityOptions').classList.toggle('open');
    document.getElementById('cityTrigger').classList.toggle('active');
}

function selectCity(city) {
    selectedCity = city;

    // Update UI
    document.getElementById('cityTrigger').innerText = city.name;
    document.getElementById('cityTrigger').classList.remove('active');
    document.getElementById('cityOptions').classList.remove('open');
    document.getElementById('cxCityValue').value = city.name; // Update hidden input

    // Highlight option
    document.querySelectorAll('.select-option').forEach(el => {
        el.classList.toggle('selected', el.innerText === city.name);
    });

    const infoBox = document.getElementById('deliveryInfo');
    infoBox.innerHTML = `
        <div style="font-size:0.9rem; margin-top:8px; color:var(--color-primary);">
            Livraison: <strong>${selectedCity.price} DH</strong> <br>
            Délai: <strong>${selectedCity.time}</strong>
        </div>
    `;

    updateCheckoutTotal();
}

function updateCheckoutTotal() {
    const cartTotal = cart.reduce((sum, item) => {
        const p = products.find(prod => prod.id === item.id);
        return sum + (p ? p.price * item.qty : 0);
    }, 0);

    const shipping = selectedCity ? selectedCity.price : 0;
    const grandTotal = cartTotal + shipping;

    const cxTotal = document.getElementById('cxTotal');
    if (cxTotal) {
        if (selectedCity) {
            cxTotal.innerHTML = `${cartTotal} DH <span style="font-weight:400; font-size:0.8em;">+ ${shipping} DH (Livraison)</span> <br> = ${grandTotal} DH`;
        } else {
            cxTotal.innerText = `${cartTotal} DH`;
        }
    }
}

// --- CHECKOUT SUBMISSION ---
function submitOrder(event) {
    event.preventDefault();
    const name = document.getElementById('cxName').value;
    const cityVal = document.getElementById('cxCityValue').value;

    if (!name || !cityVal) {
        if (!cityVal) showToast("Veuillez sélectionner une ville");
        return;
    }

    showToast(`Commande reçue! Merci ${name.split(' ')[0]} ✨`);
    // Clear cart
    cart = [];
    saveCart();
    updateCart();
    setTimeout(() => {
        navigate('home');
    }, 2000);
}

// --- UTILS ---
function showToast(msg) {
    const t = document.getElementById('toast');
    const tMsg = document.getElementById('toastMsg');
    tMsg.innerText = msg;
    t.classList.add('active');
    setTimeout(() => t.classList.remove('active'), 3000);
}
