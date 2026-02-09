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
        name: "Adidas Chinese New Year jacket",
        price: 250,
        cat: "autres",
        inStock: true,
        badge: "Best",
        img: "adidas-chinese-new-year-jacket-purple.jpg", // Default
        desc: "Chinese Jacket Become like a real one.",
        variants: [
            { name: "violet", hex: "#d0a2be", img: "adidas-chinese-new-year-jacket-purple.jpg", stock: { "S/M": 0, "M/L": 0 } },
            { name: "Roseclair", hex: "#fdcddd", img: "adidas-chinese-new-year-jacket-lightpink.jpg", stock: { "S/M": 0, "M/L": 1 } },
            { name: "Bleu", hex: "#012d6a", img: "adidas-chinese-new-year-jacket-blue.jpg", stock: { "S/M": 0, "M/L": 0 } },
            { name: "Orange", hex: "#c44123", img: "adidas-chinese-new-year-jacket-orange.jpg", stock: { "S/M": 0, "M/L": 1 } },
            { name: "Rose", hex: "#d1738d", img: "adidas-chinese-new-year-jacket-pink.jpg", stock: { "S/M": 0, "M/L": 0 } },
        ],
        sizes: ["S/M", "M/L"]
    },
    {
        id: 2,
        name: "Pantalon Hello Kitty",
        price: 150,
        cat: "hellokitty",
        badge: "Best",
        img: "pantalon-hello-kitty-1.jpeg", // Default
        desc: "hello kitty pyjama.",
        variants: [
            { name: "Blanc", hex: "#ffffffff", img: "pantalon-hello-kitty-1.jpeg", stock: { XS: 0, S: 1, M: 0, L: 0 } },
            { name: "Rose", hex: "#ff4181ff", img: "pantalon-hello-kitty-2.jpeg", stock: { XS: 0, S: 0, M: 0, L: 0 } },
            { name: "Noir", hex: "#000000ff", img: "pantalon-hello-kitty-3.jpeg", stock: { XS: 0, S: 0, M: 0, L: 0 } },
        ],
        sizes: ["XS", "S", "M", "L"]
    },
    {
        id: 3,
        name: "Hello Kitty UGGs",
        price: 260,
        cat: "hellokitty",
        badge: "Best",
        img: "hello-kitty-uggs-1.jpeg", // Default
        desc: "hello kitty UGGs.",
        variants: [
            { name: "Rose", hex: "#ffffffff", img: "hello-kitty-uggs-1.jpeg", stock: 0 },
            { name: "Maron", hex: "#ffa379d5", img: "hello-kitty-uggs-2.jpeg", stock: 0 },
            { name: "Noir", hex: "#ec5a058f", img: "hello-kitty-uggs-3.jpeg", stock: 1 },
        ],
        sizes: ["37-38-39"]
    },
    {
        id: 4,
        name: "Pearl Necklace",
        price: 160,
        cat: "accessoires",
        inStock: false,
        images: ["pearl-necklace-1.jpeg", "pearl-necklace-2.jpeg", "pearl-necklace-3.jpeg", "pearl-necklace-4.jpeg", "pearl-necklace-5.jpeg"],
        badge: "Best",
        img: "pearl-necklace-1.jpeg", // Default
        desc: "Pearl Necklace.",
    },
    {
        id: 5,
        name: "Cute Bandana",
        price: 40,
        cat: "accessoires",
        badge: "Best",
        img: "cute-bandana-1.jpeg", // Default
        desc: "Cute Bandana.",
        variants: [
            { name: "1", hex: "#bf1b32", img: "cute-bandana-1.jpeg", stock: 1 },
            { name: "2", hex: "#e2cdb2", img: "cute-bandana-2.jpeg", stock: 1 },
            { name: "3", hex: "#e1b4b4", img: "cute-bandana-3.jpeg", stock: 1 },
            { name: "4", hex: "#9c9443", img: "cute-bandana-4.jpeg", stock: 1 },
            { name: "5", hex: "#587853", img: "cute-bandana-5.jpeg", stock: 1 },
            { name: "6", hex: "#b8bfda", img: "cute-bandana-6.jpeg", stock: 0 },
        ]
    },
    {
        id: 6,
        name: "Mikasa Scarf",
        price: 120,
        cat: "accessoires",
        inStock: true,
        images: ["mikasa-scarf-1.jpeg", "mikasa-scarf-2.jpeg"],
        badge: "Best",
        img: "mikasa-scarf-1.jpeg", // Default
        desc: "Mikasa Scarf.",
    },
    {
        id: 7,
        name: "Lampe Tulip",
        price: 89,
        cat: "deco",
        inStock: false,
        images: ["lampe-tulip-1.jpeg", "lampe-tulip-2.jpeg"],
        badge: "Best",
        img: "lampe-tulip-1.jpeg", // Default
        desc: "Lampe Tulip.",
    },
    {
        id: 8,
        name: "Ceinture Vintage",
        price: 190,
        cat: "accessoires",
        inStock: false,
        badge: "Best",
        img: "ceinture-vintage-1.jpeg", // Default
        desc: "Ceinture Vintage.",
        variants: [
            { name: "1", img: "ceinture-vintage-1.jpeg", stock: 1 },
            { name: "2", img: "ceinture-vintage-2.jpeg", stock: 1 },
        ],
        variantStyle: 'button', // Use buttons for variants
        requireVariantSelection: true // Force selection
    },
    {
        id: 9,
        name: "Lunettes MiuMiu anti-reflets",
        price: 90,
        cat: "accessoires",
        inStock: true,
        images: ["lunettes-miumiu-1.jpeg", "lunettes-miumiu-2.jpeg", "lunettes-miumiu-3.jpeg", "lunettes-miumiu-4.jpeg", "lunettes-miumiu-5.jpeg"],
        badge: "Best",
        img: "lunettes-miumiu-1.jpeg", // Default
        desc: "Lunettes MiuMiu anti-reflets For The best cozy nights.",
    },
    {
        id: 10,
        name: "Tenue Maroc personnalisé",
        price: 360,
        cat: "autres",
        inStock: true,
        images: ["tenue-maroc-personnalisee-1.jpeg", "tenue-maroc-personnalisee-2.jpeg", "tenue-maroc-personnalisee-3.jpeg", "tenue-maroc-personnalisee-4.jpeg", "tenue-maroc-personnalisee-5.jpeg"],
        badge: "Best",
        img: "tenue-maroc-personnalisee-1.jpeg",// Default
        desc: "Tenue Maroc personnalisé.",
    },
    {
        id: 11,
        name: "Collier Hello Kitty en acier inoxydable",
        price: 40,
        cat: "hellokitty",
        inStock: true,
        images: ["collier-hello-kitty-acier-inoxydable-1.jpeg", "collier-hello-kitty-acier-inoxydable-2.jpeg", "collier-hello-kitty-acier-inoxydable-3.jpeg"],
        badge: "Best",
        img: "collier-hello-kitty-acier-inoxydable-1.jpeg",// Default
        desc: "Collier Hello Kitty en acier inoxydable.",
    },
    {
        id: 12,
        name: "Sac Hello Kitty",
        price: 160,
        oldPrice: 199,
        cat: "hellokitty",
        inStock: true,
        images: ["sac-hello-kitty-1.jpeg", "sac-hello-kitty-2.jpeg", "sac-hello-kitty-3.jpeg", "sac-hello-kitty-4.jpeg"],
        badge: "Best",
        img: "sac-hello-kitty-1.jpeg",// Default
        desc: "Sac Hello Kitty. 38cm/31cm/6cm",
    },
    {
        id: 13,
        name: "Waist Chains",
        price: 100,
        oldPrice: 150,
        cat: "accessoires",
        inStock: false,
        badge: "Best",
        img: "waist-chains-1.jpeg", // Default
        desc: "Waist Chains.",
        variants: [
            { name: "1", img: "waist-chains-1.jpeg", stock: 1 },
            { name: "2", img: "waist-chains-2.jpeg", stock: 1 },
            { name: "3", img: "waist-chains-3.jpeg", stock: 1 },
            { name: "4", img: "waist-chains-4.jpeg", stock: 1 },
            { name: "5", img: "waist-chains-5.jpeg", stock: 1 },
        ],
        variantStyle: 'button', // Use buttons for variants
        requireVariantSelection: true // Force selection
    },
    {
        id: 14,
        name: "Pantoufles Hello Kitty",
        price: 150,
        cat: "hellokitty",
        inStock: true,
        images: ["pantoufles-hello-Kitty-1.jpeg", "pantoufles-hello-Kitty-2.jpeg"],
        badge: "Best",
        img: "pantoufles-hello-Kitty-1.jpeg", // Default
        desc: "Pantoufles Hello Kitty.",
        variants: [
            { name: "37-38-39", img: "pantoufles-hello-kitty-1.jpeg", stock: 1 },
        ],
        variantStyle: 'button', // Use buttons for variants
        requireVariantSelection: true // Force selection
    },


];

// --- CONFIG: HERO SLIDES (Editable) ---
const heroSlides = [
    {
        image: "background1.jpeg",
        tag: "New Arrival 🔥",
        title: "Trending <br>Chinese Jackets",
        buttons: [
            { text: "Shop Collection", action: "filterShop('autres'); navigate('shop');" }
        ]
    },
    {
        image: "background2.jpeg",
        tag: "Soft & Cute 🎀",
        title: "Cozy Hello Kitty <br>Collection",
        buttons: [
            { text: "Shop Hello Kitty", action: "filterShop('hellokitty'); navigate('shop');" }
        ]
    }
];

// --- STATE ---
let cart = [];
try {
    cart = JSON.parse(localStorage.getItem('cart_v24') || '[]');
} catch (e) {
    console.error("Cart parse error:", e);
    cart = [];
}
let activeCat = 'all';
let historyStack = ['home'];
let selectedCity = null;
let activeProductId = null;
let activeVariantIndex = 0;
let activeSize = null;
// let inventory = {}; // Removed
let pdpInterval = null; // Store interval ID

// --- DOM CACHE ---
const elements = {}; // Cache for DOM elements

// --- INVENTORY MANAGEMENT ---
// Stock is managed directly in the products array (static).
// No localStorage persistence for inventory.

function getStock(id, variantIndex, size = null) {
    const p = products.find(x => x.id === id);
    if (!p) return 0;

    // Explicitly out of stock at product level
    if (p.inStock === false) return 0;

    // Direct check on product/variant data
    let stockVal = 0;

    if (p.variants && p.variants.length > variantIndex) {
        stockVal = p.variants[variantIndex].stock;
    } else {
        // Fallback for products without variants (e.g. single item)
        stockVal = (typeof p.stock !== 'undefined') ? p.stock : 10;
    }

    // handle varied types
    if (typeof stockVal === 'object') {
        if (size) {
            return stockVal[size] || 0;
        }
        // If no size specific, return sum (if > 0, variant is available)
        return Object.values(stockVal).reduce((a, b) => a + b, 0);
    }

    if (stockVal === true) return 100; // Unlimited
    if (typeof stockVal === 'number') return stockVal;

    return 0; // Default out if not specified properly
}

function reduceStock() {
    // No-op. We do not reduce stock in this static version.
}

// --- INIT ---
window.onload = () => {
    // Cache DOM Elements
    elements.heroSlider = document.getElementById('heroSlider');
    elements.homeGrid = document.getElementById('homeGrid');
    elements.shopGrid = document.getElementById('shopGrid');
    elements.cartBadge = document.getElementById('cartBadge');
    elements.mobBadge = document.getElementById('mobBadge');
    elements.cartList = document.getElementById('cartList');
    elements.drawerTotal = document.getElementById('drawerTotal');
    elements.checkoutBtn = document.getElementById('checkoutBtn');
    elements.pdpContainer = document.getElementById('pdpContainer');
    elements.scrim = document.getElementById('scrim');
    elements.cartDrawer = document.getElementById('cartDrawer');
    elements.toast = document.getElementById('toast');
    elements.toastMsg = document.getElementById('toastMsg');

    // Clear old inventory to avoid confusion if needed
    localStorage.removeItem('inventory_v1');

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('product')) {
        openProduct(parseInt(urlParams.get('product')));
    } else if (localStorage.getItem('lastView') === 'shop') {
        navigate('shop');
    } else {
        navigate('home');
    }

    renderHero();
    startSlider();
    renderProducts();
    renderShop();
    renderCartList();
    updateCart();
    populateCities();
};

// --- SLIDER LOGIC ---
function renderHero() {
    const container = elements.heroSlider;
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

    if (viewId === 'checkout' && cart.length === 0) {
        showToast("Votre panier est vide ! 🛒");
        return;
    }
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        // Optimize: verify classList toggle efficiency
        target.classList.add('active');
        window.scrollTo(0, 0);
    }

    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    const navLink = document.getElementById(`link-${viewId}`);
    if (navLink) navLink.classList.add('active');

    const tabBtn = document.getElementById(`tab-${viewId}`);
    if (tabBtn) tabBtn.classList.add('active');

    if (viewId === 'shop') renderShop();
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
    stopPDPAutoSlide(); // Cleanup when leaving
}

// --- PRODUCT RENDERING ---
function createCard(p) {
    const priceDisplay = p.oldPrice > 0
        ? `<span class="price-sale">${p.price} DH</span> <s style="font-size:0.85em; opacity:0.5; font-weight:400;">${p.oldPrice}</s>`
        : `${p.price} DH`;

    let badgeHtml = '';
    if (p.inStock === false) {
        badgeHtml = `<div class="tag-sale tag-out-of-stock">Rupture</div>`;
    } else if (p.badge) {
        badgeHtml = `<div class="tag-sale">${p.badge}</div>`;
    }

    return `
    <div class="card ${p.inStock === false ? 'out-of-stock' : ''}" onclick="openProduct(${p.id})">
      <div class="card-img-box">
        ${badgeHtml}
        <img src="${p.img}" class="card-img" alt="${p.name}" loading="lazy" decoding="async" width="300" height="330">
      </div>
      <h3>${p.name}</h3>
      <p>${priceDisplay}</p>
    </div>
  `;
}

function renderProducts() {
    const container = elements.homeGrid;
    if (!container) return;

    // Sort products: in-stock first
    const sorted = sortProducts(products);
    const fragment = document.createDocumentFragment();

    // Create temp container to parse HTML string (simplest migration without rewriting creatingCard to return nodes)
    // Or just set innerHTML which is fast enough for small lists, but we can stick to innerHTML for simplicity 
    // if we aren't creating nodes. 
    // Actually, innerHTML on container is fine, but for "shop" with many items, batching string concat is better than loop appends.
    // The current map(...).join('') IS efficient. 
    // To truly optimize, we'd avoid innerHTML re-flow, but with map().join('') it's one reflow.
    // So distinct DocumentFragment isn't strictly necessary unless we create DOM nodes. 
    // I will keep map().join('') but ensure we use cached container.

    container.innerHTML = sorted.slice(0, 4).map(createCard).join('');
}

function renderShop() {
    const container = elements.shopGrid;
    if (!container) return;

    let filtered = products;
    if (activeCat === 'sale') filtered = products.filter(p => p.oldPrice > 0);
    else if (activeCat !== 'all') filtered = products.filter(p => p.cat === activeCat);

    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    const activeChip = document.getElementById(`filt-${activeCat}`);
    if (activeChip) activeChip.classList.add('active');

    // Sort: in-stock first, then out-of-stock
    filtered = sortProducts(filtered);

    // Efficient one-time update
    container.innerHTML = filtered.map(createCard).join('');
}

function sortProducts(list) {
    return [...list].sort((a, b) => {
        // treating undefined inStock as true (default)
        const aStock = (a.inStock !== false);
        const bStock = (b.inStock !== false);

        if (aStock === bStock) return 0;
        return aStock ? -1 : 1; // true comes first
    });
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

    // Find first variant with stock > 0
    let firstAvailableIndex = 0;
    if (p.variants && p.variants.length > 0) {
        // Need to check mapped inventory because stock might be boolean true -> 100
        // But inventory might not be init yet if we just loaded page? 
        // Safer to just check p.variants[i].stock if it's raw from products array? 
        // Actually inventory is the source of truth.

        // Let's iterate and check inventory
        for (let i = 0; i < p.variants.length; i++) {
            // Check real stock using helper (handles objects/sizes/booleans)
            const stock = getStock(p.id, i);
            if (stock > 0) {
                firstAvailableIndex = i;
                break;
            }
        }
    }


    // Default selection logic
    if (p.requireVariantSelection) {
        activeVariantIndex = null; // No default selection
    } else {
        activeVariantIndex = firstAvailableIndex;
    }
    activeSize = null;

    const container = document.getElementById('pdpContainer');
    renderPDP(p);
    navigate('product');
    startPDPAutoSlide(p);
}

function startPDPAutoSlide(p) {
    if (pdpInterval) clearInterval(pdpInterval);
    if (!p.images || p.images.length < 2) return;

    let currentIdx = 0;
    const images = p.images;

    pdpInterval = setInterval(() => {
        currentIdx = (currentIdx + 1) % images.length;
        // Update Image
        const img = document.getElementById('pdpImage');
        if (img) {
            img.style.opacity = '0.5';
            setTimeout(() => {
                img.src = images[currentIdx];
                img.style.opacity = '1';
            }, 200);
        }

        // Update Thumbs
        document.querySelectorAll('.pdp-thumb').forEach((t, i) => {
            t.classList.toggle('selected', i === currentIdx);
        });
    }, 3000); // Change every 3 seconds
}

function stopPDPAutoSlide() {
    if (pdpInterval) clearInterval(pdpInterval);
}

function renderPDP(p) {
    const container = elements.pdpContainer;
    if (!container) return; // Guard clause
    const currentVariant = (p.variants && p.variants.length > 0 && activeVariantIndex !== null)
        ? p.variants[activeVariantIndex]
        : { name: "Sélectionner", hex: "transparent", img: p.img };

    const displayImg = (activeVariantIndex !== null && p.variants && p.variants[activeVariantIndex].img)
        ? p.variants[activeVariantIndex].img
        : p.img;

    const priceHtml = p.oldPrice > 0
        ? `<div class="price-block"><span class="price-now sale-price">${p.price} DH</span> <span class="price-was">${p.oldPrice} DH</span></div>`
        : `<div class="price-block"><span class="price-now">${p.price} DH</span></div>`;

    // Render variants
    let variantsHtml = '';
    if (p.variants && p.variants.length > 0) {
        if (p.variantStyle === 'button') {
            // Render as numbered buttons
            variantsHtml = `<div class="size-group">
                ${p.variants.map((v, i) => {
                const stock = getStock(p.id, i);
                const isOutOfStock = stock <= 0;
                const isSelected = (i === activeVariantIndex);
                return `
                    <button 
                        class="size-btn ${isSelected ? 'selected' : ''}" 
                        ${isOutOfStock ? 'disabled' : ''}
                        onclick="selectSwatch(${i})"
                        title="${v.name}"
                    >${v.name}</button>`;
            }).join('')}
            </div>`;
        } else {
            // Render as color swatches
            variantsHtml = `<div class="swatch-group">
                ${p.variants.map((v, i) => {
                const stock = getStock(p.id, i);
                const isOutOfStock = stock <= 0;
                return `
                    <div class="swatch ${i === activeVariantIndex ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}" 
                         style="background:${v.hex}; ${isOutOfStock ? 'opacity:0.3; cursor:not-allowed;' : ''}" 
                         title="${v.name} ${isOutOfStock ? '(Rupture)' : ''}" 
                         onclick="${isOutOfStock ? '' : `selectSwatch(${i})`}"></div>
                  `;
            }).join('')}
            </div>`;
        }
    }

    let galleryHtml = '';
    // If we have an explicit images array, use it
    const imagesToUse = (p.images && p.images.length > 0) ? p.images : null;

    if (!imagesToUse && p.variants && p.variants.length > 1) {
        // Ideally we would use variant images if unique
    }

    if (imagesToUse) {
        galleryHtml = `<div class="pdp-gallery">
            ${imagesToUse.map((src, i) => `<img src="${src}" class="pdp-thumb ${i === 0 ? 'selected' : ''}" onclick="switchProductImage(this.src, this)">`).join('')}
        </div>`;
    }

    let sizeHtml = '';
    let variantStock = 0;

    if (p.sizes) {
        sizeHtml = `
        <label style="font-weight:700; display:block; margin-bottom:12px; margin-top:24px;">
            Taille: <span style="font-weight:400; color:var(--color-primary);">${activeSize || 'Sélectionner'}</span>
        </label>
        <div class="size-group">
            ${p.sizes.map(size => {
            const qty = getStock(p.id, activeVariantIndex, size);
            variantStock += qty;

            const isAvailable = qty > 0;
            const isSelected = (activeSize === size);

            return `<button 
                    class="size-btn ${isSelected ? 'selected' : ''}" 
                    ${!isAvailable ? 'disabled' : ''}
                    onclick="selectSize('${size}')"
                >${size}</button>`;
        }).join('')}
        </div>`;
    } else {
        // If no sizes, check stock of selected variant or mapped sum
        if (activeVariantIndex !== null) {
            variantStock = getStock(p.id, activeVariantIndex);
        } else {
            // If no variant selected yet, check if *any* variant has stock
            // Only assume available if product itself is inStock
            variantStock = (p.inStock !== false) ? 1 : 0;
        }
    }

    let btnHtml = '';

    // Check if variant selection is required
    const variantRequired = p.requireVariantSelection && activeVariantIndex === null;

    if (p.inStock === false) {
        btnHtml = `<button class="btn btn-primary" disabled style="flex:1; padding:18px; opacity:0.6; cursor:not-allowed; background:var(--text-gray);">Rupture de Stock</button>`;
    } else if (variantStock <= 0 && !variantRequired) {
        // Only show out of stock if we have a valid selection that is out of stock
        // If nothing selected, we don't know it's out of stock yet
        btnHtml = `<button class="btn btn-primary" disabled style="flex:1; padding:18px; opacity:0.6; cursor:not-allowed; background:var(--text-gray);">Rupture de Stock</button>`;
    } else {
        const sizeRequired = p.sizes && !activeSize;

        if (variantRequired) {
            btnHtml = `<button class="btn btn-primary" style="flex:1; padding:18px; opacity:0.8;" onclick="showToast('Veuillez choisir une option ${p.variantStyle === 'button' ? 'numérotée' : 'de couleur'} 👇')">Ajouter au panier</button>`;
        } else if (sizeRequired) {
            btnHtml = `<button class="btn btn-primary" style="flex:1; padding:18px; opacity:0.8;" onclick="showToast('Veuillez choisir une taille 📏')">Ajouter au panier</button>`;
        } else {
            // Check specific variant stock again to be sure
            const finalStock = activeVariantIndex !== null ? getStock(p.id, activeVariantIndex) : 1;
            if (finalStock <= 0) {
                btnHtml = `<button class="btn btn-primary" disabled style="flex:1; padding:18px; opacity:0.6; cursor:not-allowed; background:var(--text-gray);">Rupture de Stock</button>`;
            } else {
                btnHtml = `<button class="btn btn-primary" style="flex:1; padding:18px;" onclick="addToCart(activeProductId, activeVariantIndex, activeSize); showToast('Ajouté au panier ! 🛍️')">Ajouter au panier</button>`;
            }
        }
    }

    container.innerHTML = `
    <div class="pdp-left-col">
        <div class="pdp-visual">
           <img src="${displayImg}" alt="${p.name}" id="pdpImage" class="fade-in-img">
        </div>
        ${galleryHtml}
    </div>
    <div class="pdp-content">
       <h1>${p.name}</h1>
       <div class="pdp-badges">
         ${p.inStock === false ? `<span class="pdp-tag" style="background:#eee; color:#666;">Rupture</span>` : ''}
         ${p.badge ? `<span class="pdp-tag">${p.badge}</span>` : ''}
         <span class="pdp-tag">${p.cat.toUpperCase()}</span>
       </div>
       ${priceHtml}
       <p style="font-size:1.1rem; color:var(--text-gray); margin-bottom:30px; line-height:1.7;">${p.desc}</p>
       
       ${(p.variants && p.variants.length > 0) ? `
       <label style="font-weight:700; display:block; margin-bottom:12px;">
         ${p.variantStyle === 'button' ? 'Modèle' : 'Couleur'}: <span style="font-weight:400; color:var(--color-primary);">${currentVariant.name}</span>
       </label>` : ''}
       ${variantsHtml}
       
       ${sizeHtml}
       
       <div style="display:flex; gap:16px; margin-top:32px;">
         ${btnHtml}
       </div>
    </div>
  `;
}

function selectSize(size) {
    activeSize = size;
    const p = products.find(x => x.id === activeProductId);
    if (p) renderPDP(p);
}

function switchProductImage(src, el) {
    stopPDPAutoSlide(); // Stop auto-play on user interaction
    const img = document.getElementById('pdpImage');
    if (img) {
        img.style.opacity = '0.5';
        setTimeout(() => {
            img.src = src;
            img.style.opacity = '1';
        }, 200);
    }

    if (el) {
        document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('selected'));
        el.classList.add('selected');
    }
}

function selectSwatch(index) {
    stopPDPAutoSlide(); // Stop auto-play so user can see the selected color
    activeVariantIndex = index;
    activeSize = null;
    const p = products.find(x => x.id === activeProductId);
    if (p) renderPDP(p);
}

// --- CART LOGIC ---
function addToCart(id, variantIndex = 0, size = null) {
    const existing = cart.find(x => x.id === id && x.variantIndex === variantIndex && x.size === size);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, qty: 1, variantIndex, size });
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
    localStorage.setItem('cart_v24', JSON.stringify(cart));
}

function updateCart() {
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    if (elements.cartBadge) elements.cartBadge.innerText = count;
    if (elements.mobBadge) elements.mobBadge.innerText = count;

    if (elements.cartBadge) elements.cartBadge.classList.toggle('visible', count > 0);
    if (elements.mobBadge) elements.mobBadge.classList.toggle('visible', count > 0);
}

// --- DRAWER ---
function openCart() {
    if (elements.scrim) elements.scrim.classList.add('open');
    if (elements.cartDrawer) elements.cartDrawer.classList.add('open');
    renderCartList();
}

function closeDrawers() {
    if (elements.scrim) elements.scrim.classList.remove('open');
    document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
}

function renderCartList() {
    const list = elements.cartList;
    if (cart.length === 0) {
        list.innerHTML = `<div style="text-align:center; margin-top:60px; color:#ccc;">
      <span class="material-symbols-rounded" style="font-size:64px; margin-bottom:16px;">shopping_bag</span>
      <p>Your bag is empty.</p>
    </div>`;
        if (elements.drawerTotal) elements.drawerTotal.innerText = '0 DH';
        const btn = elements.checkoutBtn;
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.innerText = "Panier Vide";
        }
        return;
    }

    const btn = elements.checkoutBtn;
    if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.innerText = "Commander";
    }

    let total = 0;
    list.innerHTML = cart.map((item, index) => {
        const p = products.find(x => x.id === item.id);
        if (!p) return '';

        const variant = (p.variants && p.variants.length > 0) ? p.variants[item.variantIndex] : { name: "", hex: "transparent", img: p.img };
        const displayImg = variant.img || p.img;
        const sizeLabel = item.size ? ` - ${item.size} ` : '';

        total += p.price * item.qty;
        return `
      <div class="cart-item">
        <div style="position:relative;">
            <img src="${displayImg}" class="cart-img">
            ${variant.hex !== "transparent" ? `<div style="position:absolute; bottom:0; right:0; background:${variant.hex}; width:16px; height:16px; border-radius:50%; border:1px solid #fff;"></div>` : ''}
        </div>
        <div style="flex:1;">
          <h4 style="margin-bottom:4px;">${p.name}</h4>
          <div style="font-size:0.8rem; color:var(--text-gray); margin-bottom:4px;">${variant.name}${sizeLabel}</div>
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

    if (elements.drawerTotal) elements.drawerTotal.innerText = `${total} DH`;
    updateCheckoutTotal();
    renderCheckoutItems();
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
        const variant = (p.variants && p.variants.length > 0) ? p.variants[item.variantIndex] : { name: "", img: p.img };
        const displayImg = variant.img || p.img;
        const sizeLabel = item.size ? ` - ${item.size}` : '';

        return `
            <div style="display:flex; gap:16px; margin-bottom:16px; padding-bottom:16px; border-bottom:1px dashed #eee; align-items:center;">
                <div style="position:relative; flex-shrink:0;">
                    <img src="${displayImg}" style="width:60px; height:60px; border-radius:12px; object-fit:cover; background:#f4f4f6;">
                    <div style="position:absolute; -top:6px; -right:6px; background:var(--text-dark); color:white; width:22px; height:22px; border-radius:50%; font-size:0.8rem; display:flex; align-items:center; justify-content:center; border:2px solid white; font-weight:700;">${item.qty}</div>
                </div>
                <div style="flex:1;">
                   <div style="font-weight:700; font-size:1rem; margin-bottom:4px;">${p.name}</div>
                   <div style="color:var(--text-gray); font-size:0.9rem;">${variant.name}${sizeLabel}</div>
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

    cities.sort((a, b) => a.name.localeCompare(b.name));

    dropdown.innerHTML = '';
    cities.forEach(c => {
        const div = document.createElement('div');
        div.className = 'select-option';
        div.innerText = c.name;
        div.onclick = () => selectCity(c);
        dropdown.appendChild(div);
    });

    const trigger = document.getElementById('cityTrigger');
    if (trigger) {
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);

        newTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCityDropdown();
        });
    }

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

    document.getElementById('cityTrigger').innerText = city.name;
    document.getElementById('cityTrigger').classList.remove('active');
    document.getElementById('cityOptions').classList.remove('open');
    document.getElementById('cxCityValue').value = city.name;

    document.querySelectorAll('.select-option').forEach(el => {
        el.classList.toggle('selected', el.innerText === city.name);
    });

    const infoBox = document.getElementById('deliveryInfo');
    infoBox.innerHTML = `
        <div style="font-size:0.9rem; margin-top:8px; color:var(--color-primary);">
            Livraison: <strong>${selectedCity.price} DH</strong> <br>
            Délai: <strong>${selectedCity.time}</strong>
        </div>`;

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

    const name = document.getElementById('cxName').value;
    const phone = document.getElementById('cxPhone').value;
    const cityVal = document.getElementById('cxCityValue').value;
    const address = document.getElementById('cxAddress').value;

    if (!name || !cityVal || !phone || !address) {
        if (!cityVal) showToast("Veuillez sélectionner une ville");
        else showToast("Veuillez remplir tous les champs");
        return;
    }

    const cartTotal = cart.reduce((sum, item) => {
        const p = products.find(prod => prod.id === item.id);
        return sum + (p ? p.price * item.qty : 0);
    }, 0);
    const shipping = selectedCity ? selectedCity.price : 0;
    const grandTotal = cartTotal + shipping;

    const itemsString = cart.map(item => {
        const p = products.find(prod => prod.id === item.id);
        if (!p) return 'Unknown';
        const variant = (p.variants && p.variants.length > 0) ? p.variants[item.variantIndex] : { name: "Standard" };
        const sizeLabel = item.size ? ` [${item.size}]` : '';
        return `${p.name} [${variant.name}]${sizeLabel} (x${item.qty})`;
    }).join(', ');

    const formData = new FormData();
    formData.append(GOOGLE_FORM_ENTRY_IDS.name, name);
    formData.append(GOOGLE_FORM_ENTRY_IDS.phone, phone);
    formData.append(GOOGLE_FORM_ENTRY_IDS.city, cityVal);
    formData.append(GOOGLE_FORM_ENTRY_IDS.address, address);
    formData.append(GOOGLE_FORM_ENTRY_IDS.items, itemsString);
    formData.append(GOOGLE_FORM_ENTRY_IDS.total, `${grandTotal} DH`);
    formData.append(GOOGLE_FORM_ENTRY_IDS.notes, '');

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

        showToast(`Commande reçue! Merci ${name.split(' ')[0]} ✨`);

        cart.forEach(item => {
            reduceStock(item.id, item.variantIndex, item.size, item.qty);
        });

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
    const t = elements.toast;
    const tMsg = elements.toastMsg;
    if (!t || !tMsg) return;

    tMsg.innerText = msg;
    t.classList.add('active');
    setTimeout(() => t.classList.remove('active'), 3000);
}

// Cities Data
// Cities are loaded from cities.js

