// script.js - shop 20
let products = [];
let sliders = [];
let orders = [];
const adminPassword = '6242';

// সাইড মেনু টগল
function toggleSideMenu() {
    document.getElementById('side-menu')?.classList.toggle('show');
}

// সার্চ মডাল
function openSearchModal() {
    document.getElementById('search-modal')?.classList.add('show');
    document.getElementById('modal-search-input')?.focus();
}
function closeSearchModal() {
    document.getElementById('search-modal')?.classList.remove('show');
}
function goToSearchResults() {
    const query = document.getElementById('modal-search-input')?.value.trim();
    if (!query) return alert('কিছু লিখুন');
    localStorage.setItem('searchQuery', query);
    window.location.href = 'search-results.html';
}

// অ্যাডমিন লগইন
function loginAdmin() {
    const pass = document.getElementById('admin-password')?.value;
    if (pass === adminPassword) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        showSection('add-product');
    } else {
        alert('ভুল পাসওয়ার্ড');
    }
}
function togglePassword() {
    const input = document.getElementById('admin-password');
    const icon = document.querySelector('.toggle-password');
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

// সেকশন সুইচ
function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';
    if (sectionId === 'products-list') refreshProductList();
    if (sectionId === 'sliders-list') refreshSliderList();
    if (sectionId === 'orders') renderOrders();
}

// প্রোডাক্ট যোগ
document.getElementById('product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = document.getElementById('product-images')?.files || [];
    if (files.length > 3) return alert('সর্বোচ্চ ৩টা ছবি');
    const base64Images = [];
    for (let file of files) {
        base64Images.push(await fileToBase64(file));
    }
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('product-name')?.value.trim(),
        price: Number(document.getElementById('product-price')?.value),
        oldPrice: Number(document.getElementById('product-old-price')?.value) || 0,
        stock: Number(document.getElementById('product-stock')?.value),
        description: document.getElementById('product-description')?.value.trim(),
        images: base64Images
    };
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    alert('প্রোডাক্ট যোগ হয়েছে!');
    e.target.reset();
    document.getElementById('product-preview').innerHTML = '';
    refreshProductList();
});
function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

// প্রিভিউ
document.getElementById('product-images')?.addEventListener('change', (e) => {
    const preview = document.getElementById('product-preview');
    preview.innerHTML = '';
    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `<img src="${ev.target.result}" alt="preview">`;
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
});

// সকল প্রোডাক্ট (এডিট + ডিলিট)
function refreshProductList() {
    const container = document.getElementById('all-products-list');
    const count = document.getElementById('product-count');
    if (!container || !count) return;
    container.innerHTML = '';
    count.textContent = products.length;

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#777;">কোনো প্রোডাক্ট যোগ করা হয়নি</p>';
        return;
    }

    products.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'admin-product-item';
        const img = p.images?.[0] || 'placeholder.jpg';
        div.innerHTML = `
            <img src="${img}" alt="${p.name}">
            <div>
                <strong>${p.name}</strong><br>
                দাম: ${p.price} টাকা<br>
                স্টক: ${p.stock} পিস
            </div>
            <div class="admin-actions">
                <button onclick="editProduct(${i})">এডিট</button>
                <button onclick="deleteProduct(${i})">ডিলিট</button>
            </div>
        `;
        container.appendChild(div);
    });
}

let editingProductIndex = -1;

function editProduct(index) {
    editingProductIndex = index;
    const p = products[index];

    document.getElementById('product-name').value = p.name;
    document.getElementById('product-price').value = p.price;
    document.getElementById('product-old-price').value = p.oldPrice || '';
    document.getElementById('product-stock').value = p.stock;
    document.getElementById('product-description').value = p.description || '';

    // প্রিভিউতে পুরোনো ছবি দেখানো
    const preview = document.getElementById('product-preview');
    preview.innerHTML = '';
    if (p.images && p.images.length > 0) {
        p.images.forEach(src => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `<img src="${src}" alt="existing">`;
            preview.appendChild(div);
        });
    }

    document.querySelector('#product-form button[type="submit"]').textContent = 'আপডেট করুন';
    showSection('add-product');
}

function deleteProduct(i) {
    if (confirm('প্রোডাক্ট ডিলিট করবেন?')) {
        products.splice(i, 1);
        localStorage.setItem('products', JSON.stringify(products));
        refreshProductList();
    }
}

// স্লাইডার যোগ
document.getElementById('slider-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = document.getElementById('slider-images')?.files || [];
    const newImages = [];
    for (let file of files) {
        newImages.push(await fileToBase64(file));
    }
    sliders.push(...newImages);
    localStorage.setItem('sliders', JSON.stringify(sliders));
    alert('ছবি যোগ হয়েছে!');
    e.target.reset();
    document.getElementById('slider-preview').innerHTML = '';
    refreshSliderList();
});
function refreshSliderList() {
    const container = document.getElementById('all-sliders-list');
    const count = document.getElementById('slider-count');
    if (!container || !count) return;
    container.innerHTML = '';
    count.textContent = sliders.length;
    sliders.forEach((img, i) => {
        const div = document.createElement('div');
        div.className = 'admin-slider-item';
        div.innerHTML = `
            <img src="${img}" alt="Slide ${i+1}">
            <button class="delete-btn" onclick="deleteSlider(${i})">ডিলিট</button>
        `;
        container.appendChild(div);
    });
}
function deleteSlider(i) {
    if (confirm('ছবি ডিলিট করবেন?')) {
        sliders.splice(i, 1);
        localStorage.setItem('sliders', JSON.stringify(sliders));
        refreshSliderList();
    }
}

// ইউজার পেজে প্রোডাক্ট দেখানো
function renderProducts() {
    const container = document.getElementById('products-list');
    if (!container) return;
    container.innerHTML = '';
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#777;">কোনো প্রোডাক্ট এখনো যোগ করা হয়নি</p>';
        return;
    }
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const img = p.images?.[0] || '';
        card.innerHTML = `
            ${img ? `<img src="${img}" alt="${p.name}">` : '<div class="no-image">No image</div>'}
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div>
                    <span class="product-price">${p.price} টাকা</span>
                    ${p.oldPrice > 0 ? `<span class="product-old-price">${p.oldPrice} টাকা</span>` : ''}
                </div>
                <div class="product-stock">স্টক: ${p.stock}</div>
                <button class="order-btn" onclick="goToOrder(${p.id})">অর্ডার করুন</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// স্লাইডশো
function renderSlideshow() {
    const el = document.getElementById('slideshow');
    if (!el || sliders.length === 0) return;
    el.innerHTML = '';
    sliders.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'slide' + (i === 0 ? ' active' : '');
        slide.innerHTML = `<img src="${src}" alt="Slide ${i+1}">`;
        el.appendChild(slide);
    });
    let idx = 0;
    setInterval(() => {
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        idx = (idx + 1) % sliders.length;
        document.querySelectorAll('.slide')[idx].classList.add('active');
    }, 4000);
}

// অর্ডার পেজ
let currentQuantity = 1;
let currentProductPrice = 0;
function renderOrderProduct() {
    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);
    if (!product) return;
    document.getElementById('product-preview').innerHTML = product.images?.[0]
        ? `<img src="${product.images[0]}" alt="${product.name}">`
        : '<p>ছবি নেই</p>';
    document.getElementById('product-name-display').textContent = product.name;
    document.getElementById('product-price-display').textContent = product.price;
    currentProductPrice = product.price;
    currentQuantity = 1;
    document.getElementById('quantity-display').textContent = 1;
    updateTotalPrice();
}
function changeQuantity(change) {
    let newQty = currentQuantity + change;
    if (newQty < 1) newQty = 1;
    currentQuantity = newQty;
    document.getElementById('quantity-display').textContent = newQty;
    updateTotalPrice();
}
function updateTotalPrice() {
    const total = currentProductPrice * currentQuantity;
    document.getElementById('total-price-display').textContent = total + " টাকা";
}

// অর্ডার সাবমিট
document.getElementById('order-details')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(localStorage.getItem('currentProductId'));
    const product = products.find(p => p.id === id);
    if (!product) return alert("প্রোডাক্ট পাওয়া যায়নি");
    const method = document.getElementById('payment-method').value;
    let transactionId = '';
    if (['bKash','Nagad','Rocket','Upay'].includes(method)) {
        transactionId = document.getElementById('transaction-id')?.value.trim();
        if (!transactionId) return alert('ট্রানজেকশন আইডি দিন!');
    }
    const newOrder = {
        productId: id,
        productName: product.name,
        quantity: currentQuantity,
        userName: document.getElementById('user-name')?.value.trim(),
        mobile: document.getElementById('mobile')?.value.trim(),
        email: document.getElementById('email')?.value.trim() || 'N/A',
        address: document.getElementById('address')?.value.trim(),
        payment: method,
        transactionId,
        totalAmount: currentProductPrice * currentQuantity,
        status: 'pending',
        orderDate: new Date().toLocaleString('bn-BD')
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    alert('অর্ডার কনফার্ম হয়েছে!');
    window.location.href = 'order-confirmation.html';
});

// অর্ডার লিস্ট দেখানো (অ্যাডমিন প্যানেলে)
function renderOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;

    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:30px; color:#777;">কোনো অর্ডার এখনো নেই</p>';
        return;
    }

    orders.forEach((order, index) => {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <p><strong>অর্ডার #${index + 1}</strong></p>
            <p>তারিখ: ${order.orderDate}</p>
            <p>নাম: ${order.userName}</p>
            <p>মোবাইল: ${order.mobile}</p>
            <p>প্রোডাক্ট: ${order.productName} × ${order.quantity}</p>
            <p>মোট: ${order.totalAmount} টাকা</p>
            <p>পেমেন্ট: ${order.payment} ${order.transactionId ? `(${order.transactionId})` : ''}</p>
            <p>স্ট্যাটাস: ${order.status === 'pending' ? 'পেন্ডিং' : 'সফল'}</p>
        `;
        container.appendChild(card);
    });
}

// পেজ লোড
document.addEventListener('DOMContentLoaded', () => {
    products = JSON.parse(localStorage.getItem('products')) || [];
    sliders = JSON.parse(localStorage.getItem('sliders')) || [];
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    renderSlideshow();
    renderProducts();
    if (window.location.pathname.includes('order.html')) {
        renderOrderProduct();
    }
    if (document.getElementById('admin-panel')) {
        refreshProductList();
        refreshSliderList();
        renderOrders();
    }
});

// অন্যান্য ফাংশন
function goToOrder(productId) {
    localStorage.setItem('currentProductId', productId);
    window.location.href = 'order.html';
}function displayUserProducts() {
    const container = document.getElementById('product-list');
    if (!container) return;
    container.innerHTML = '';

    const products = JSON.parse(localStorage.getItem('products')) || [];

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#777;">কোনো প্রোডাক্ট নেই</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}" style="width:100%; height:220px; object-fit:cover;">
            <h3>${p.name}</h3>
            <p style="color:#2e7d32; font-weight:bold;">${p.price} টাকা</p>
            <button onclick="addToCart('${p.name}', ${p.price})" style="background:#2e7d32; color:white; padding:10px 20px; border:none; border-radius:8px; cursor:pointer;">
                কার্টে যোগ করুন
            </button>
        `;
        container.appendChild(card);
    });
}

// পেজ লোডে কল করো
window.onload = function() {
    displayUserProducts();
    // অন্যান্য লোড ফাংশন যদি থাকে...
};



