/* =========================================
   Cutesy Finds - Application Logic
   ========================================= */

// --- GOOGLE FORM CONFIG ---
const GOOGLE_FORM_ID = '1FAIpQLSd0zZdALDRSoJc-zU1UpLyyoqSm43T1tBCIfTwWRiUmfdOUWA'; // Google Form ID
const GOOGLE_FORM_ENTRY_IDS = {
    name: 'entry.104647828',      // Name
    phone: 'entry.1867044447',     // Phone
    city: 'entry.956879257',       // City
    address: 'entry.2069920131',    // Address
    items: 'entry.274746768',     // Items
    total: 'entry.872776128',     // Total
    notes: 'entry.1770888457'      // Notes
};
const GOOGLE_FORM_URL = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;

// --- DATA ---
const products = [
    {
        id: 1,
        name: "Chinese Jacket",
        price: 200,
        oldPrice: 250,
        cat: "autres",
        badge: "Best",
        img: "ChineseJacket_Purple.jpg", // Default
        desc: "Chinese Jacket Become like a real one.",
        variants: [
            { name: "Mauve", hex: "#d0a2be", img: "ChineseJacket_Purple.jpg" },
            { name: "Rose", hex: "#fdcddd", img: "ChineseJacket_Pink.jpg" },
            { name: "Bleu", hex: "#012d6a", img: "ChineseJacket_Blue.jpg" },
            { name: "Orange", hex: "#c44123", img: "ChineseJacket_Orange.jpg" },
            { name: "Foncé", hex: "#d1738d", img: "ChineseJacket_Darkpink.jpg" },
        ]
    },
    {
        id: 2,
        name: "hello kitty pijama",
        price: 150,
        oldPrice: 180,
        cat: "hellokitty",
        badge: "Best",
        img: "hellokittypijama_White.jpg", // Default
        desc: "hello kitty pijama For The best cozy nights.",
        variants: [
            { name: "Blanc", hex: "#ffffffff", img: "hellokittypijama_White.jpg" },
            { name: "Rose", hex: "#ff4181ff", img: "hellokittypijama_Pink.jpg" },
            { name: "Noir", hex: "#000000ff", img: "hellokittypijama_Black.jpg" },
        ]
    },
    {
        id: 3,
        name: "Pantoufle",
        price: 120,
        cat: "hellokitty",
        badge: "Best",
        img: "Pantofa_Pink.jpg", // Default
        desc: "hello kitty pijama For The best cozy nights.",
        variants: [
            { name: "Rose", hex: "#ffffffff", img: "Pantofa_Pink.jpg" },
            { name: "Maron", hex: "#e47d4d5d", img: "Pantofa_Brown.jpg" },
        ]
    },
    { id: 4, name: "Sac Fluffy", price: 350, oldPrice: 400, cat: "accessoires", badge: "New", img: "bag.jpg", desc: "Sac fourre-tout esthétique avec texture fausse fourrure.", variants: [{ name: "Blanc", hex: "#fff", img: "bag.jpg" }] },
];

// --- CONFIG: HERO SLIDES (Editable) ---
const heroSlides = [
    {
        image: "Background.png", // Using generic bg as requested
        tag: "New Arrival 🔥",
        title: "Trending <br>Chinese Jackets",
        buttons: [
            { text: "Shop Collection", action: "filterShop('autres'); navigate('shop');" }
        ]
    },
    {
        image: "Background.png",
        tag: "Soft & Cute 🎀",
        title: "Cozy Hello Kitty <br>Collection",
        buttons: [
            { text: "Shop Hello Kitty", action: "filterShop('hellokitty'); navigate('shop');" }
        ]
    }
];

// --- STATE ---
let cart = JSON.parse(localStorage.getItem('cart_v23') || '[]'); // New version for schema change
let activeCat = 'all';
let historyStack = ['home'];
let selectedCity = null;
let activeProductId = null;
let activeVariantIndex = 0;

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
    if (viewId === 'checkout') {
        renderCheckoutItems();
        updateCheckoutTotal();
    }
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

    activeProductId = id;
    activeVariantIndex = 0; // Reset to first variant

    const container = document.getElementById('pdpContainer');

    // Initial Render
    renderPDP(p);
    navigate('product');
}

function renderPDP(p) {
    const container = document.getElementById('pdpContainer');
    const currentVariant = p.variants[activeVariantIndex];

    // Fallback if variant doesn't have specific img
    const displayImg = currentVariant.img || p.img;

    const priceHtml = p.oldPrice > 0
        ? `<div class="price-block"><span class="price-now sale-price">${p.price} DH</span> <span class="price-was">${p.oldPrice} DH</span></div>`
        : `<div class="price-block"><span class="price-now">${p.price} DH</span></div>`;

    const swatches = p.variants.map((v, i) => `
    <div class="swatch ${i === activeVariantIndex ? 'selected' : ''}" 
         style="background:${v.hex}" 
         title="${v.name}" 
         onclick="selectSwatch(${i})"></div>
  `).join('');

    container.innerHTML = `
    <div class="pdp-visual">
       <img src="${displayImg}" alt="${p.name}" id="pdpImage" class="fade-in-img">
    </div>
    <div class="pdp-content">
       <h1>${p.name}</h1>
       <div class="pdp-badges">
         ${p.badge ? `<span class="pdp-tag">${p.badge}</span>` : ''}
         <span class="pdp-tag">${p.cat.toUpperCase()}</span>
       </div>
       ${priceHtml}
       <p style="font-size:1.1rem; color:var(--text-gray); margin-bottom:30px; line-height:1.7;">${p.desc}</p>
       
       <label style="font-weight:700; display:block; margin-bottom:12px;">
         Couleur: <span style="font-weight:400; color:var(--color-primary);">${currentVariant.name}</span>
       </label>
       <div class="swatch-group">${swatches}</div>
       
       <div style="display:flex; gap:16px;">
         <button class="btn btn-primary" style="flex:1; padding:18px;" onclick="addToCart(activeProductId, activeVariantIndex); showToast('Added to bag! 🛍️')">Add to Bag</button>
       </div>
    </div>
  `;
}

function selectSwatch(index) {
    activeVariantIndex = index;
    const p = products.find(x => x.id === activeProductId);
    if (p) renderPDP(p);
}

// --- CART LOGIC ---
function addToCart(id, variantIndex = 0) {
    // Check if same product AND same variant exists
    const existing = cart.find(x => x.id === id && x.variantIndex === variantIndex);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, qty: 1, variantIndex });
    }

    saveCart();
    updateCart();
    renderCartList();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCart();
    renderCartList();
}

function updateQty(index, delta) {
    const item = cart[index];
    if (!item) return;

    item.qty += delta;
    if (item.qty < 1) {
        removeFromCart(index);
    } else {
        saveCart();
        updateCart();
        renderCartList();
    }
}

function saveCart() {
    localStorage.setItem('cart_v23', JSON.stringify(cart));
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
    list.innerHTML = cart.map((item, index) => {
        const p = products.find(x => x.id === item.id);
        if (!p) return '';

        const variant = p.variants[item.variantIndex] || p.variants[0];
        const displayImg = variant.img || p.img;

        total += p.price * item.qty;
        return `
      <div class="cart-item">
        <div style="position:relative;">
            <img src="${displayImg}" class="cart-img">
            <div style="position:absolute; bottom:0; right:0; background:${variant.hex}; width:16px; height:16px; border-radius:50%; border:1px solid #fff;"></div>
        </div>
        <div style="flex:1;">
          <h4 style="margin-bottom:4px;">${p.name}</h4>
          <div style="font-size:0.8rem; color:var(--text-gray); margin-bottom:4px;">${variant.name}</div>
          <div style="color:var(--text-gray); font-size:0.9rem;">${p.price} DH</div>
        </div>
        <div class="qty-ctrl">
           <span onclick="updateQty(${index}, -1)" style="cursor:pointer; padding:0 8px;">-</span>
           <span>${item.qty}</span>
           <span onclick="updateQty(${index}, 1)" style="cursor:pointer; padding:0 8px;">+</span>
        </div>
      </div>
    `;
    }).join('');

    document.getElementById('drawerTotal').innerText = `${total} DH`;

    // also update checkout total if visible
    updateCheckoutTotal();

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
        const variant = p.variants[item.variantIndex] || p.variants[0];
        const displayImg = variant.img || p.img;

        return `
            <div style="display:flex; gap:16px; margin-bottom:16px; padding-bottom:16px; border-bottom:1px dashed #eee; align-items:center;">
                <div style="position:relative; flex-shrink:0;">
                    <img src="${displayImg}" style="width:60px; height:60px; border-radius:12px; object-fit:cover; background:#f4f4f6;">
                    <div style="position:absolute; -top:6px; -right:6px; background:var(--text-dark); color:white; width:22px; height:22px; border-radius:50%; font-size:0.8rem; display:flex; align-items:center; justify-content:center; border:2px solid white; font-weight:700;">${item.qty}</div>
                </div>
                <div style="flex:1;">
                   <div style="font-weight:700; font-size:1rem; margin-bottom:4px;">${p.name}</div>
                   <div style="color:var(--text-gray); font-size:0.9rem;">${variant.name}</div>
                </div>
                <div style="font-weight:700; font-size:1.05rem;">${p.price * item.qty} DH</div>
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

    // Event Listener for Trigger (Robust Mobile Handling)
    const trigger = document.getElementById('cityTrigger');
    if (trigger) {
        // Remove old listeners to be safe (if re-run)
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);

        newTrigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents document click from immediately closing it
            toggleCityDropdown();
        });
    }

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

    const cxTotalEl = document.getElementById('cxTotal');
    if (cxTotalEl) {
        if (selectedCity) {
            cxTotalEl.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:flex-end;">
                    <span>${cartTotal} DH <span style="font-weight:400; font-size:0.7em; color:var(--text-gray);"> (Panier)</span></span>
                    <span style="font-weight:400; font-size:0.8em; color:var(--color-primary);">+ ${shipping} DH (Livraison)</span>
                    <span style="border-top:1px solid #ddd; margin-top:4px; padding-top:4px;">${grandTotal} DH</span>
                </div>`;
        } else {
            cxTotalEl.innerText = `${cartTotal} DH`;
        }
    }
}

// --- CHECKOUT SUBMISSION ---
async function submitOrder(event) {
    event.preventDefault();

    // Gather Data
    const name = document.getElementById('cxName').value;
    const phone = document.getElementById('cxPhone').value;
    const cityVal = document.getElementById('cxCityValue').value;
    const address = document.getElementById('cxAddress').value;

    if (!name || !cityVal || !phone || !address) {
        if (!cityVal) showToast("Veuillez sélectionner une ville");
        else showToast("Veuillez remplir tous les champs");
        return;
    }

    // Calculate Total & Items String
    const cartTotal = cart.reduce((sum, item) => {
        const p = products.find(prod => prod.id === item.id);
        return sum + (p ? p.price * item.qty : 0);
    }, 0);
    const shipping = selectedCity ? selectedCity.price : 0;
    const grandTotal = cartTotal + shipping;

    const itemsString = cart.map(item => {
        const p = products.find(prod => prod.id === item.id);
        if (!p) return 'Unknown';
        const variant = p.variants[item.variantIndex] || p.variants[0];
        return `${p.name} [${variant.name}] (x${item.qty})`;
    }).join(', ');

    // Prepare Form Data
    const formData = new FormData();
    formData.append(GOOGLE_FORM_ENTRY_IDS.name, name);
    formData.append(GOOGLE_FORM_ENTRY_IDS.phone, phone);
    formData.append(GOOGLE_FORM_ENTRY_IDS.city, cityVal);
    formData.append(GOOGLE_FORM_ENTRY_IDS.address, address);
    formData.append(GOOGLE_FORM_ENTRY_IDS.items, itemsString);
    formData.append(GOOGLE_FORM_ENTRY_IDS.total, `${grandTotal} DH`);
    formData.append(GOOGLE_FORM_ENTRY_IDS.notes, '');

    // UI Feedback
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Traitement...";
    btn.disabled = true;

    try {
        await fetch(GOOGLE_FORM_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });

        // Success Handling
        showToast(`Commande reçue! Merci ${name.split(' ')[0]} ✨`);
        cart = [];
        saveCart();
        updateCart();
        navigate('thankyou');

    } catch (error) {
        console.error('Order submission failed:', error);
        showToast("Erreur de connexion. Veuillez réessayer.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// --- UTILS ---
function showToast(msg) {
    const t = document.getElementById('toast');
    const tMsg = document.getElementById('toastMsg');
    tMsg.innerText = msg;
    t.classList.add('active');
    setTimeout(() => t.classList.remove('active'), 3000);
}
