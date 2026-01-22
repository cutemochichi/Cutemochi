// shop.js
// Frontend logic for Cutesy Finds: products from Sanity, cart, and COD checkout.

// === CONFIG (edit these with your own free Sanity project details) ===
// 1. Go to https://www.sanity.io/get-started and create a free project.
// 2. Note your project ID and dataset (often "production").
// 3. In Sanity Studio, create a public dataset or enable public read for products.

const SANITY_PROJECT_ID = "your-sanity-project-id"; // TODO: replace with your project ID
const SANITY_DATASET = "production"; // or your dataset name
const SANITY_API_VERSION = "2021-10-21";

// Products query (Shop: featured)
const SHOP_QUERY = `*[_type == "product" && defined(title)] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  price,
  type,
  isFeatured,
  "imageUrl": image.asset->url
}`;

// Collection query (all products)
const COLLECTION_QUERY = `*[_type == "product" && defined(title)] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  price,
  type,
  isFeatured,
  "imageUrl": image.asset->url
}`;

const CART_STORAGE_KEY = "cutesy_cart_v1";

let cart = [];

function hasValidSanityConfig() {
  return SANITY_PROJECT_ID && SANITY_PROJECT_ID !== "your-sanity-project-id";
}

async function fetchFromSanity(query) {
  if (!hasValidSanityConfig()) {
    console.warn("Sanity project ID is not set. Using empty product list.");
    return [];
  }

  const baseUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;
  const url = `${baseUrl}?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Sanity query failed", await res.text());
      return [];
    }
    const data = await res.json();
    return data.result || [];
  } catch (err) {
    console.error("Error fetching from Sanity", err);
    return [];
  }
}

function createProductCard(product) {
  const { _id, title, price, type, imageUrl } = product;

  const article = document.createElement("article");
  article.className = "product-card";
  article.dataset.id = _id;

  const imgWrapper = document.createElement("div");
  imgWrapper.className = "product-image";

  const img = document.createElement("img");
  img.alt = title || "Product";
  if (imageUrl) {
    img.src = imageUrl;
  } else {
    img.src = "Cutesy Finds_files/FNlMydg8VI14JLS3iGZw1FFhdPM.png"; // fallback
  }
  imgWrapper.appendChild(img);

  const body = document.createElement("div");
  body.className = "product-body";

  const nameEl = document.createElement("h3");
  nameEl.className = "product-name";
  nameEl.textContent = title || "Untitled";

  const typeEl = document.createElement("p");
  typeEl.className = "product-type";
  typeEl.textContent = type || "Product";

  const priceEl = document.createElement("p");
  priceEl.className = "product-price";
  priceEl.textContent = typeof price === "number" ? `${price} DH` : "";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Add to cart";
  btn.style.marginTop = "0.4rem";
  btn.style.alignSelf = "flex-start";
  btn.style.padding = "0.4rem 0.9rem";
  btn.style.borderRadius = "999px";
  btn.style.border = "1px solid #e4e4e7";
  btn.style.background = "#f9fafb";
  btn.style.fontSize = "0.8rem";
  btn.style.cursor = "pointer";

  btn.addEventListener("click", () => {
    addToCart({
      id: _id,
      title,
      price: typeof price === "number" ? price : 0,
      type,
      imageUrl: imageUrl || "Cutesy Finds_files/FNlMydg8VI14JLS3iGZw1FFhdPM.png",
    });
  });

  body.appendChild(nameEl);
  body.appendChild(typeEl);
  body.appendChild(priceEl);
  body.appendChild(btn);

  article.appendChild(imgWrapper);
  article.appendChild(body);

  return article;
}

function renderProducts(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (!products.length) {
    const p = document.createElement("p");
    p.style.fontSize = "0.9rem";
    p.style.color = "var(--text-subtle)";
    p.textContent = hasValidSanityConfig()
      ? "No products available yet."
      : "Connect Sanity to show products.";
    container.appendChild(p);
    return;
  }

  products.forEach((prod) => {
    container.appendChild(createProductCard(prod));
  });
}

// === Cart logic ===

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn("Could not save cart", e);
  }
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartCountBadge() {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = String(getCartCount());
}

function renderCart() {
  const itemsContainer = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const totalEl = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("cart-checkout-btn");

  if (!itemsContainer || !emptyEl || !totalEl || !checkoutBtn) return;

  const checkoutSection = document.getElementById("checkout");

  itemsContainer.innerHTML = "";

  if (!cart.length) {
    emptyEl.style.display = "block";
    checkoutBtn.disabled = true;
    totalEl.textContent = "0 DH";
    if (checkoutSection) checkoutSection.style.display = "none";
    updateCartCountBadge();
    return;
  }

  emptyEl.style.display = "none";

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.dataset.id = item.id;

    const thumb = document.createElement("div");
    thumb.className = "cart-item-thumb";
    const img = document.createElement("img");
    img.src = item.imageUrl;
    img.alt = item.title;
    thumb.appendChild(img);

    const main = document.createElement("div");
    main.className = "cart-item-main";
    const title = document.createElement("div");
    title.className = "cart-item-title";
    title.textContent = item.title;
    const meta = document.createElement("div");
    meta.className = "cart-item-meta";
    meta.textContent = `${item.type || "Product"} · ${item.price} DH`;
    main.appendChild(title);
    main.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const qtyControls = document.createElement("div");
    qtyControls.className = "cart-qty-controls";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "cart-qty-button";
    minus.textContent = "-";
    minus.addEventListener("click", () => changeQuantity(item.id, -1));
    const qty = document.createElement("span");
    qty.textContent = String(item.quantity);
    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "cart-qty-button";
    plus.textContent = "+";
    plus.addEventListener("click", () => changeQuantity(item.id, 1));
    qtyControls.appendChild(minus);
    qtyControls.appendChild(qty);
    qtyControls.appendChild(plus);

    const priceLine = document.createElement("div");
    priceLine.textContent = `${item.price * item.quantity} DH`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "cart-remove";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFromCart(item.id));

    actions.appendChild(qtyControls);
    actions.appendChild(priceLine);
    actions.appendChild(removeBtn);

    row.appendChild(thumb);
    row.appendChild(main);
    row.appendChild(actions);

    itemsContainer.appendChild(row);
  });

  totalEl.textContent = `${getCartTotal()} DH`;
  checkoutBtn.disabled = false;
  updateCartCountBadge();
}

function addToCart(product) {
  const existing = cart.find((it) => it.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((it) => it.id !== id);
  saveCart();
  renderCart();
}

function changeQuantity(id, delta) {
  const item = cart.find((it) => it.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  renderCart();
}

// === Checkout ===

async function submitOrder(event) {
  event.preventDefault();
  const msgEl = document.getElementById("checkout-message");
  if (!msgEl) return;

  msgEl.textContent = "";
  msgEl.className = "checkout-message";

  if (!cart.length) {
    msgEl.textContent = "Your cart is empty.";
    msgEl.classList.add("error");
    return;
  }

  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const city = document.getElementById("customer-city").value.trim();
  const address = document.getElementById("customer-address").value.trim();
  const notes = document.getElementById("customer-notes").value.trim();

  if (!name || !phone || !city || !address) {
    msgEl.textContent = "Please fill in all required fields (name, phone, city, address).";
    msgEl.classList.add("error");
    return;
  }

  const payload = {
    customer: { name, phone, city, address, notes },
    items: cart.map((it) => ({
      id: it.id,
      title: it.title,
      price: it.price,
      quantity: it.quantity,
      type: it.type,
      imageUrl: it.imageUrl,
    })),
    total: getCartTotal(),
  };

  try {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Order failed", err);
      msgEl.textContent = "Something went wrong while placing your order. Please try again.";
      msgEl.classList.add("error");
      return;
    }

    const data = await res.json().catch(() => ({}));
    msgEl.textContent = "Order received! We will contact you soon to confirm your Cash on Delivery.";
    msgEl.classList.add("success");

    // Clear cart
    cart = [];
    saveCart();
    renderCart();
    event.target.reset();
  } catch (e) {
    console.error("Order error", e);
    msgEl.textContent = "Network error. Please check your connection and try again.";
    msgEl.classList.add("error");
  }
}

function initCheckout() {
  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", submitOrder);
  }

  const checkoutBtn = document.getElementById("cart-checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (!cart.length) return;
      const section = document.getElementById("checkout");
      if (section) {
        section.style.display = "block";
        section.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

// === Init ===

async function initShop() {
  cart = loadCart();
  renderCart();

  // Fetch products for shop and collection
  const products = await fetchFromSanity(SHOP_QUERY);

  // Use featured for shop grid if any, else first few
  const shopProducts = products.filter((p) => p.isFeatured) || products.slice(0, 4);
  renderProducts("shop-grid", shopProducts.length ? shopProducts : products.slice(0, 4));

  // Collection shows all
  const collectionProducts = await fetchFromSanity(COLLECTION_QUERY);
  renderProducts("collection-grid", collectionProducts);
}

window.addEventListener("DOMContentLoaded", () => {
  initShop();
  initCheckout();
});
