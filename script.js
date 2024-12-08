// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navRight = document.querySelector('.nav-right');
const cartModal = document.querySelector('.cart-modal');
const closeCartBtn = document.querySelector('.close-cart');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartCount = document.querySelector('.cart-count');
const themeSwitch = document.getElementById('checkbox');

// State
let cart = [];
let products = [];

// Theme Management
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);
themeSwitch.checked = theme === 'dark';

themeSwitch.addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navRight.classList.toggle('active');
});

// Cart Management
function toggleCart() {
    cartModal.classList.toggle('active');
}

function updateCartDisplay() {
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <button onclick="removeFromCart(${item.id})">&times;</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1,
            image: 'https://via.placeholder.com/50'
        });
    }
    
    updateCartDisplay();
    toggleCart();
}

function removeFromCart(id) {
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        updateCartDisplay();
    }
}

// Product Search and Filter
function searchProducts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchInput);
        const matchesCategory = category === 'all' || product.category === category;
        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

function sortProducts(method) {
    let sortedProducts = [...products];
    
    switch(method) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
    }
    
    displayProducts(sortedProducts);
}

function displayProducts(productsToDisplay) {
    const productsGrid = document.querySelector('.products-grid');
    
    productsGrid.innerHTML = productsToDisplay.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Event Listeners
document.querySelector('.cart-icon').addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Sample products data
    products = [
        { id: 1, name: 'Classic Care Bear', price: 24.99, category: 'classic', image: 'https://via.placeholder.com/300' },
        { id: 2, name: 'Rainbow Care Bear', price: 29.99, category: 'limited', image: 'https://via.placeholder.com/300' },
        { id: 3, name: 'Love-a-lot Bear', price: 19.99, category: 'classic', image: 'https://via.placeholder.com/300' },
        { id: 4, name: 'Sunshine Bear', price: 34.99, category: 'limited', image: 'https://via.placeholder.com/300' }
    ];
    
    displayProducts(products);
});
