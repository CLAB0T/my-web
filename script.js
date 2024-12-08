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

    // Start the animation sequence
    startIntroSequence();
});