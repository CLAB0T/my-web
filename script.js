document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    // Update profile display
    const userProfilePic = document.getElementById('navProfilePic');
    const userName = document.getElementById('userName');
    
    if (currentUser.profilePicture) {
        userProfilePic.src = currentUser.profilePicture;
    }
    userName.textContent = currentUser.name;

    // Add logout functionality
    const userProfile = document.getElementById('userProfile');
    userProfile.addEventListener('click', () => {
        if (confirm('Do you want to log out?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'auth.html';
        }
    });

    // Intro animation elements
    const welcomeText = document.getElementById('welcomeText');
    const moralText = document.getElementById('moralText');
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    // Cart elements
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Cart state
    let cart = [];

    // Function to create typing animation
    function typeText(element, text, speed = 100) {
        element.style.opacity = '1';
        let index = 0;
        
        return new Promise(resolve => {
            const interval = setInterval(() => {
                element.textContent = text.substring(0, index);
                index++;
                
                if (index > text.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        });
    }

    // Function to fade out element
    function fadeOut(element, duration = 1000) {
        return new Promise(resolve => {
            element.style.transition = `opacity ${duration}ms ease-out`;
            element.style.opacity = '0';
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    // Function to show main content
    function showMainContent() {
        mainContent.style.opacity = '0';
        mainContent.style.display = 'block';
        setTimeout(() => {
            mainContent.style.transition = 'opacity 1s ease-in';
            mainContent.style.opacity = '1';
        }, 100);
    }

    // Animation sequence
    async function startIntroSequence() {
        welcomeText.textContent = '';
        moralText.textContent = '';
        
        await typeText(welcomeText, 'WELCOME', 150);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fadeOut(welcomeText);
        await typeText(moralText, 'We are forging...', 100);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fadeOut(introOverlay);
        showMainContent();
        
        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, 1000);
    }

    // Cart Functions
    function toggleCart() {
        cartModal.classList.toggle('active');
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    function createCartItem(item) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">&times;</button>
        `;
        return div;
    }

    function updateCartDisplay() {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            cartItems.appendChild(createCartItem(item));
        });
        updateCartCount();
        updateCartTotal();
    }

    function addToCart(id, name, price, quantity) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, name, price: parseFloat(price), quantity });
        }
        
        updateCartDisplay();
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartDisplay();
    }

    function updateQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCartDisplay();
            }
        }
    }

    // Event Listeners
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            const card = e.target;
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = card.dataset.price;
            const quantityInput = card.parentElement.querySelector('.qty-input');
            const quantity = parseInt(quantityInput.value);
            
            addToCart(id, name, price, quantity);
            toggleCart();
        }

        if (e.target.classList.contains('cart-item-remove')) {
            removeFromCart(e.target.dataset.id);
        }

        if (e.target.classList.contains('qty-btn')) {
            const change = e.target.classList.contains('plus') ? 1 : -1;
            if (e.target.closest('.cart-item')) {
                updateQuantity(e.target.dataset.id, change);
            } else {
                const input = e.target.parentElement.querySelector('.qty-input');
                const newValue = parseInt(input.value) + change;
                if (newValue >= 1) {
                    input.value = newValue;
                }
            }
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Thank you for your purchase! Total: ' + cartTotal.textContent);
            cart = [];
            updateCartDisplay();
            toggleCart();
        }
    });

    // Add search and filter functionality
    const searchProducts = () => {
        const searchInput = document.querySelector('.search-input');
        const filterSelect = document.querySelector('.filter-select');
        const productCards = document.querySelectorAll('.product-card');

        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;

        productCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const price = card.querySelector('.price').textContent;
            const category = card.dataset.category;

            const matchesSearch = title.includes(searchTerm);
            const matchesFilter = filterValue === 'all' || category === filterValue;

            card.style.display = matchesSearch && matchesFilter ? 'flex' : 'none';
        });
    };

    // Add product sorting
    const sortProducts = (criteria) => {
        const productsContainer = document.querySelector('.products-grid');
        const products = Array.from(productsContainer.children);

        products.sort((a, b) => {
            if (criteria === 'price-low') {
                const priceA = parseFloat(a.querySelector('.price').textContent.replace('$', ''));
                const priceB = parseFloat(b.querySelector('.price').textContent.replace('$', ''));
                return priceA - priceB;
            } else if (criteria === 'price-high') {
                const priceA = parseFloat(a.querySelector('.price').textContent.replace('$', ''));
                const priceB = parseFloat(b.querySelector('.price').textContent.replace('$', ''));
                return priceB - priceA;
            }
        });

        products.forEach(product => productsContainer.appendChild(product));
    };

    // Theme switcher
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }    
    }

    toggleSwitch.addEventListener('change', switchTheme);

    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
    }

    // Add dark mode toggle
    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    };

    // Initialize dark mode from localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Add smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add lazy loading for images
    document.addEventListener('DOMContentLoaded', () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    });

    // Start the animation sequence
    startIntroSequence();
});