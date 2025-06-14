let cart = JSON.parse(localStorage.getItem('cart')) || [];

const productList = document.getElementById('product-list');
const cartCountElem = document.getElementById('cart-count');
const cartCountHeaderElems = document.querySelectorAll('#cart-count-header');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsList = document.getElementById('cart-items');
const sortSelect = document.getElementById('sort');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');

const cartPageList = document.getElementById('cart-page-items');
const totalPriceElem = document.getElementById('total-price');

// Оновлює лічильник у кнопках/заголовку
function updateCartCount() {
    const count = cart.length;
    if (cartCountElem) cartCountElem.textContent = count;
    cartCountHeaderElems.forEach(el => el.textContent = count);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product) {
    if (!cart.find(p => p.id === product.id)) {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail
        });
        saveCart();
        updateCartSidebar();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(p => p.id !== productId);
    saveCart();
    updateCartSidebar();
}

// Відображаємо товари в каталозі
function renderProducts() {
    if (!productList) return;
    productList.innerHTML = '';
    products.forEach(product => {
        const inCart = cart.find(p => p.id === product.id);
        const item = document.createElement('div');
        item.className = 'product-item';
        item.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>Price: ${product.price}</p>
      <button class="${inCart ? 'remove' : 'add'}">
        ${inCart ? 'Remove from the cart' : 'Add to cart'}
      </button>
    `;
        // Обробник кнопки
        const btn = item.querySelector('button');
        btn.addEventListener('click', () => {
            if (inCart) {
                removeFromCart(product.id);
            } else {
                addToCart(product);
            }
            renderProducts();
        });
        productList.appendChild(item);
    });
}

// Оновлюємо бічну панель кошика
function updateCartSidebar() {
    if (!cartItemsList) return;
    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>The cart is empty</li>';
        return;
    }
    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
      <img src="${item.thumbnail}" alt="${item.title}">
      <span>${item.title} — ${item.price}</span>
    `;
        cartItemsList.appendChild(li);
    });
}

// Сортування товарів
function sortProducts() {
    const option = sortSelect.value;
    if (option === 'name-asc') {
        products.sort((a, b) => a.title.localeCompare(b.title));
    } else if (option === 'name-desc') {
        products.sort((a, b) => b.title.localeCompare(a.title));
    } else if (option === 'price-asc') {
        products.sort((a, b) => a.price - b.price);
    } else if (option === 'price-desc') {
        products.sort((a, b) => b.price - a.price);
    } else {
        // default: можна або не змінювати порядок, або отримати початковий. 
        // Я тут нічого не роблю (API поверне порядок).
    }
    renderProducts();
}

// Відображення сторінки кошика
function renderCartPage() {
    if (!cartPageList) return;
    cartPageList.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
        cartPageList.innerHTML = '<li>The cart is empty</li>';
        totalPriceElem.textContent = '0';
        updateCartCount();
        return;
    }
    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
      <img src="${item.thumbnail}" alt="${item.title}">
      <strong>${item.title}</strong> — ${item.price}
      <button data-id="${item.id}" class="remove">Delete</button>
    `;
        // Кнопка видалення
        const btn = li.querySelector('button');
        btn.addEventListener('click', () => {
            removeFromCart(item.id);
            renderCartPage();
        });
        cartPageList.appendChild(li);
        total += Number(item.price) || 0;
    });
    totalPriceElem.textContent = total;
    updateCartCount();
}

// Головна логіка на завантаження сторінки
let products = [];

if (productList) {
    fetch('https://dummyjson.com/products/category/beauty')
        .then(res => {
            if (!res.ok) throw new Error('HTTP error ' + res.status);
            return res.json();
        })
        .then(data => {
            products = data.products || [];
            if (products.length === 0) {
                productList.innerHTML = '<p>There are no products in the category.</p>';
            } else {
                renderProducts();
            }
            updateCartSidebar();
            updateCartCount();
        })
        .catch(err => {
            console.error('Error loading products:', err);
            productList.innerHTML = '<p>Error loading products. Please try again later.</p>';
        });
}

if (sortSelect) {
    sortSelect.addEventListener('change', sortProducts);
}

// Обробники відкриття/закриття бічної панелі кошика
if (openCartBtn && cartSidebar) {
    openCartBtn.addEventListener('click', () => {
        updateCartSidebar();
        cartSidebar.classList.add('open');
    });
}
if (closeCartBtn && cartSidebar) {
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });
}

if (cartPageList) {
    renderCartPage();
}
