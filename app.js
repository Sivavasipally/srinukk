// ============================================================
//  ANU'S HOMEMADE KITCHEN — App Logic
//  Shopping cart with WhatsApp + Email checkout
// ============================================================

// --- State -----------------------------------------------------
const state = {
  cart: {},          // { productId: qty }
  activeCat: 'all',
  search: '',
};

// WhatsApp business number — replace with real one
const CONFIG = {
  whatsappNumber: '919515669906', // country code + number, no + or spaces
  emailTo: 'orders@anuskitchen.com',
  shopName: "KK Pickles",
};

// Load from localStorage (session persistence within browser)
try {
  const saved = JSON.parse(sessionStorage.getItem('anu_cart') || '{}');
  state.cart = saved;
} catch(e) {}

function saveCart() {
  try { sessionStorage.setItem('anu_cart', JSON.stringify(state.cart)); } catch(e) {}
}

// --- Utilities -------------------------------------------------
const $  = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

function fmtINR(n) {
  return n.toLocaleString('en-IN');
}

function toast(msg) {
  const t = $('#toast');
  t.querySelector('.msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

// --- Rendering: categories -------------------------------------
function renderCategories() {
  const counts = { all: PRODUCTS.length };
  PRODUCTS.forEach(p => { counts[p.cat] = (counts[p.cat] || 0) + 1; });

  const catNav = document.querySelector('.cat-nav');
  // If only one real category, hide the nav (cleaner for focused shops)
  const realCats = CATEGORIES.filter(c => c.id !== 'all');
  if (realCats.length <= 1) {
    catNav.style.display = 'none';
    return;
  }
  catNav.style.display = '';

  const el = $('#catNav');
  el.innerHTML = CATEGORIES.map(c => `
    <button class="cat-btn ${c.id === state.activeCat ? 'active' : ''}" data-cat="${c.id}">
      <span class="ico">${c.icon}</span>
      <span>${c.label}</span>
      <span class="cat-count">${counts[c.id] || 0}</span>
    </button>
  `).join('');

  $$('.cat-btn', el).forEach(b => {
    b.addEventListener('click', () => {
      state.activeCat = b.dataset.cat;
      renderCategories();
      renderGrid();
      // smooth scroll into catalog
      $('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// --- Rendering: product grid -----------------------------------
function filtered() {
  const q = state.search.trim().toLowerCase();
  return PRODUCTS.filter(p => {
    if (state.activeCat !== 'all' && p.cat !== state.activeCat) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.hi && p.hi.toLowerCase().includes(q)) ||
      (p.tel && p.tel.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  });
}

function catLabel(id) {
  const c = CATEGORIES.find(c => c.id === id);
  return c ? c.label : id;
}

function productCard(p) {
  const qty = state.cart[p.id] || 0;
  const badges = [];
  if (p.tags?.includes('bestseller')) badges.push('<span class="badge bestseller">Bestseller</span>');
  if (p.tags?.includes('signature'))  badges.push('<span class="badge signature">Signature</span>');
  if (p.tags?.includes('luxury'))     badges.push('<span class="badge luxury">Luxury</span>');
  else if (p.tags?.includes('premium')) badges.push('<span class="badge premium">Premium</span>');
  if (p.tags?.includes('organic'))    badges.push('<span class="badge organic">Organic</span>');

  return `
    <article class="product fade-in" data-id="${p.id}">
      <div class="product-media">
        <div class="product-badges">${badges.join('')}</div>
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-body">
        <div class="product-cat">${catLabel(p.cat === 'veg' ? 'veg' : p.cat)}</div>
        <h3 class="product-name">${p.name}</h3>
        ${p.hi ? `<div class="product-hi">${p.hi}</div>` : ''}
        <div class="product-tel">${p.tel || ''}</div>
        <div class="product-foot">
          <div class="price">
            <span class="rupee">₹</span>${fmtINR(p.price)}
            <span class="weight">/ ${p.weight}</span>
          </div>
          <div class="product-action" data-id="${p.id}">
            ${qty > 0
              ? `<div class="qty-control">
                   <button data-act="dec" aria-label="Decrease">−</button>
                   <span class="q">${qty}</span>
                   <button data-act="inc" aria-label="Increase">+</button>
                 </div>`
              : `<button class="add-btn" data-act="add" aria-label="Add to cart">+</button>`}
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderGrid() {
  const list = filtered();
  const head = $('#catalogHead');
  const cat = CATEGORIES.find(c => c.id === state.activeCat);
  const realCats = CATEGORIES.filter(c => c.id !== 'all');
  const isSingleCat = realCats.length <= 1;

  const heading = isSingleCat && state.activeCat === 'all'
    ? 'The <em>Collection</em>'
    : `${cat ? cat.label : 'All Products'} <em>·</em> <em>${list.length}</em>`;
  const meta = isSingleCat
    ? `${list.length} handcrafted ${list.length === 1 ? 'pickle' : 'pickles'}${state.search ? ` matching "${state.search}"` : ''}`
    : (cat?.tagline || 'Handcrafted, ready to ship');

  head.innerHTML = `
    <h2>${heading}</h2>
    <div class="catalog-meta">${meta}</div>
  `;

  const grid = $('#grid');
  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1">
        <div class="em">Nothing matches that search</div>
        <div>Try a different category or spelling.</div>
      </div>`;
    return;
  }
  grid.innerHTML = list.map(productCard).join('');
  attachProductHandlers();
}

function attachProductHandlers() {
  $$('.product-action', $('#grid')).forEach(wrap => {
    const id = wrap.dataset.id;
    wrap.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = b.dataset.act;
        if (act === 'add' || act === 'inc') addToCart(id);
        else if (act === 'dec') decFromCart(id);
      });
    });
  });
}

// --- Cart operations -------------------------------------------
function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  updateCartBadge(true);
  renderGrid();
  renderCartDrawer();
  const p = PRODUCTS.find(p => p.id === id);
  toast(`Added · ${p.name}`);
}
function decFromCart(id) {
  if (!state.cart[id]) return;
  state.cart[id]--;
  if (state.cart[id] <= 0) delete state.cart[id];
  saveCart();
  updateCartBadge();
  renderGrid();
  renderCartDrawer();
}
function removeFromCart(id) {
  delete state.cart[id];
  saveCart();
  updateCartBadge();
  renderGrid();
  renderCartDrawer();
}

function cartTotals() {
  let count = 0, subtotal = 0;
  Object.entries(state.cart).forEach(([id, q]) => {
    const p = PRODUCTS.find(p => p.id === id);
    if (!p) return;
    count += q;
    subtotal += p.price * q;
  });
  return { count, subtotal };
}

function updateCartBadge(pop=false) {
  const { count } = cartTotals();
  const b = $('#cartBadge');
  if (count > 0) {
    b.textContent = count;
    b.classList.add('show');
    if (pop) {
      b.classList.remove('pop');
      void b.offsetWidth; // reflow
      b.classList.add('pop');
    }
  } else {
    b.classList.remove('show');
  }
}

// --- Cart drawer -----------------------------------------------
function renderCartDrawer() {
  const { count, subtotal } = cartTotals();
  const list = $('#cartList');
  const foot = $('#cartFoot');

  if (count === 0) {
    list.innerHTML = `
      <div class="cart-empty">
        <div class="big">Your basket is empty</div>
        <div>Discover our handcrafted pickles, powders, and sweets.</div>
      </div>`;
    foot.style.display = 'none';
    return;
  }

  foot.style.display = 'block';
  list.innerHTML = Object.entries(state.cart).map(([id, q]) => {
    const p = PRODUCTS.find(p => p.id === id);
    if (!p) return '';
    return `
      <div class="cart-item" data-id="${id}">
        <img src="${p.img}" alt="">
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-sub">${p.weight} · ₹${fmtINR(p.price)} each</div>
          <div class="cart-item-price">₹${fmtINR(p.price * q)}</div>
        </div>
        <div class="cart-item-ctrl">
          <div class="qty-control">
            <button data-act="dec">−</button>
            <span class="q">${q}</span>
            <button data-act="inc">+</button>
          </div>
          <button class="cart-remove" data-act="remove">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  // Delivery fee logic — free above ₹2000
  const deliveryFee = subtotal >= 2000 ? 0 : 100;
  const total = subtotal + deliveryFee;
  foot.innerHTML = `
    <div class="total-row"><span>Items (${count})</span><span>₹${fmtINR(subtotal)}</span></div>
    <div class="total-row"><span>Delivery ${subtotal >= 2000 ? '· Free over ₹2,000' : ''}</span><span>${deliveryFee === 0 ? 'Free' : '₹' + fmtINR(deliveryFee)}</span></div>
    <div class="total-row grand"><span>Total</span><span class="amt">₹${fmtINR(total)}</span></div>
    <div class="checkout-btns">
      <button class="cb whatsapp" id="btnWA">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.1-.7.1c-.2.3-.8 1-1 1.2-.2.2-.4.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 5 4.3.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.4 5.1 5.2-1.4A10 10 0 1 0 12 2zm6 16.3a8.3 8.3 0 0 1-11.9.5l-.4-.3-3.1.8.8-3-.3-.4a8.3 8.3 0 1 1 14.9 2.4z"/></svg>
        Order on WhatsApp
      </button>
      <button class="cb email" id="btnEmail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Order by Email
      </button>
    </div>
  `;

  // wire buttons
  list.querySelectorAll('.cart-item').forEach(row => {
    const id = row.dataset.id;
    row.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        const a = b.dataset.act;
        if (a === 'inc') addToCart(id);
        else if (a === 'dec') decFromCart(id);
        else if (a === 'remove') removeFromCart(id);
      });
    });
  });

  $('#btnWA').addEventListener('click', () => openCheckout('whatsapp'));
  $('#btnEmail').addEventListener('click', () => openCheckout('email'));
}

// --- Cart open/close -------------------------------------------
function openCart() {
  $('#cartOverlay').classList.add('open');
  $('#cartDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartDrawer();
}
function closeCart() {
  $('#cartOverlay').classList.remove('open');
  $('#cartDrawer').classList.remove('open');
  document.body.style.overflow = '';
}

// --- Checkout --------------------------------------------------
function openCheckout(method) {
  const { count } = cartTotals();
  if (count === 0) { toast('Cart is empty'); return; }
  $('#modalOverlay').classList.add('open');
  $('#modalOverlay').dataset.method = method;
  $('#modalTitle').textContent = method === 'whatsapp' ? 'Send order on WhatsApp' : 'Send order by Email';
  $('#modalSub').textContent = method === 'whatsapp'
    ? 'Just a few details and we\'ll prep your WhatsApp message.'
    : 'Just a few details and we\'ll prep your email.';
}
function closeCheckout() {
  $('#modalOverlay').classList.remove('open');
}

function buildOrderMessage(customer) {
  const { count, subtotal } = cartTotals();
  const deliveryFee = subtotal >= 2000 ? 0 : 100;
  const total = subtotal + deliveryFee;

  const lines = [];
  lines.push(`*New Order · ${CONFIG.shopName}*`);
  lines.push(`─────────────────────`);
  lines.push(`*Customer:* ${customer.name}`);
  lines.push(`*Phone:* ${customer.phone}`);
  if (customer.address) lines.push(`*Delivery Address:*\n${customer.address}`);
  if (customer.notes) lines.push(`*Notes:* ${customer.notes}`);
  lines.push(`─────────────────────`);
  lines.push(`*Items (${count}):*`);
  Object.entries(state.cart).forEach(([id, q]) => {
    const p = PRODUCTS.find(p => p.id === id);
    if (!p) return;
    lines.push(`• ${p.name} (${p.weight}) × ${q}  —  ₹${fmtINR(p.price * q)}`);
  });
  lines.push(`─────────────────────`);
  lines.push(`Subtotal:  ₹${fmtINR(subtotal)}`);
  lines.push(`Delivery:  ${deliveryFee === 0 ? 'Free' : '₹' + fmtINR(deliveryFee)}`);
  lines.push(`*Total:    ₹${fmtINR(total)}*`);
  lines.push(`─────────────────────`);
  lines.push(`Placed: ${new Date().toLocaleString('en-IN')}`);
  return lines.join('\n');
}

function submitOrder() {
  const customer = {
    name: $('#f_name').value.trim(),
    phone: $('#f_phone').value.trim(),
    address: $('#f_address').value.trim(),
    notes: $('#f_notes').value.trim(),
  };
  if (!customer.name || !customer.phone) {
    toast('Name and phone are required');
    return;
  }
  const method = $('#modalOverlay').dataset.method;
  const msg = buildOrderMessage(customer);

  if (method === 'whatsapp') {
    // wa.me handles encoded text; works on mobile (opens app) and web
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  } else {
    const subject = `Order from ${customer.name} · ${CONFIG.shopName}`;
    const url = `mailto:${CONFIG.emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
    window.location.href = url;
  }

  // Clear form, close modal, show success
  closeCheckout();
  toast('Order sent! We\'ll confirm shortly.');
}

// --- Search ----------------------------------------------------
function onSearch(value) {
  state.search = value;
  renderGrid();
}

// --- Wire up ---------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderGrid();
  updateCartBadge();

  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#cartOverlay').addEventListener('click', closeCart);

  $('#modalClose').addEventListener('click', closeCheckout);
  $('#modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeCheckout();
  });
  $('#modalSubmit').addEventListener('click', submitOrder);

  $('#search').addEventListener('input', (e) => onSearch(e.target.value));
  $('#searchMobile').addEventListener('input', (e) => onSearch(e.target.value));

  $('#searchToggle').addEventListener('click', () => {
    $('#searchWrapMobile').classList.toggle('mobile-show');
    const input = $('#searchMobile');
    if ($('#searchWrapMobile').classList.contains('mobile-show')) {
      setTimeout(() => input.focus(), 50);
    }
  });

  $('#shopNow').addEventListener('click', () => {
    $('#catalog').scrollIntoView({ behavior: 'smooth' });
  });
  $('#viewCart').addEventListener('click', openCart);

  // ESC closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCheckout();
      closeCart();
    }
  });
});
