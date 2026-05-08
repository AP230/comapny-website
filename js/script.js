// Custom JavaScript for GlowBeauty website

// Cart and Wishlist functionality
let cart = JSON.parse(localStorage.getItem('pinkglow-cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('pinkglow-wishlist')) || [];

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handler
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (this.querySelector('input[type="email"]') && this.querySelector('textarea')) {
            alert('Thank you for your message! We\'ll get back to you soon.');
        } else {
            alert('Thank you for subscribing! Stay tuned for beauty tips and offers.');
        }
        this.reset();
    });
});

// Add animation to cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Cart Functions
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartCount').style.display = count > 0 ? 'block' : 'none';
}

function updateWishlistCount() {
    const count = wishlist.length;
    document.getElementById('wishlistCount').textContent = count;
    document.getElementById('wishlistCount').style.display = count > 0 ? 'block' : 'none';
}

function saveCart() {
    localStorage.setItem('pinkglow-cart', JSON.stringify(cart));
}

function saveWishlist() {
    localStorage.setItem('pinkglow-wishlist', JSON.stringify(wishlist));
}

function addToCart(productId, name, price, quantity) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: parseFloat(price),
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartCount();
    
    // Show success message
    showToast(`${name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    displayCart();
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(newQuantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartCount();
            displayCart();
        }
    }
}

function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        cartTotal.classList.add('d-none');
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item d-flex align-items-center mb-3 p-3 border rounded">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="text-muted mb-1">$${item.price.toFixed(2)} each</p>
                </div>
                <div class="d-flex align-items-center">
                    <input type="number" class="form-control form-control-sm me-2" 
                           value="${item.quantity}" min="1" max="10" 
                           style="width: 60px;" 
                           onchange="updateQuantity('${item.id}', this.value)">
                    <span class="me-3 fw-bold">$${itemTotal.toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    cartTotal.classList.remove('d-none');
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Add to page
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    container.appendChild(toast);
    document.body.appendChild(container);
    
    // Initialize and show
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove after shown
    toast.addEventListener('hidden.bs.toast', () => {
        container.remove();
    });
}

// Wishlist Functions
function addToWishlist(productId, name, price) {
    const existingItem = wishlist.find(item => item.id === productId);
    
    if (!existingItem) {
        wishlist.push({
            id: productId,
            name: name,
            price: parseFloat(price)
        });
        saveWishlist();
        updateWishlistCount();
        updateWishlistButtons();
        showToast(`${name} added to wishlist!`, 'success');
    } else {
        removeFromWishlist(productId);
        showToast(`${name} removed from wishlist!`, 'info');
    }
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    saveWishlist();
    updateWishlistCount();
    updateWishlistButtons();
    displayWishlist();
}

function displayWishlist() {
    const wishlistItems = document.getElementById('wishlistItems');
    
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p class="text-center text-muted">Your wishlist is empty</p>';
        return;
    }
    
    let html = '';
    
    wishlist.forEach(item => {
        html += `
            <div class="wishlist-item d-flex align-items-center mb-3 p-3 border rounded">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="text-muted mb-1">$${item.price.toFixed(2)}</p>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-primary me-2" onclick="addToCartFromWishlist('${item.id}', '${item.name}', ${item.price})">
                        <i class="fas fa-cart-plus me-1"></i>Add to Cart
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeFromWishlist('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    wishlistItems.innerHTML = html;
}

function addToCartFromWishlist(productId, name, price) {
    addToCart(productId, name, price, 1);
    showToast(`${name} added to cart!`, 'success');
}

function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        const productId = button.dataset.product;
        const isInWishlist = wishlist.some(item => item.id === productId);
        
        const icon = button.querySelector('i');
        if (isInWishlist) {
            icon.className = 'fas fa-heart text-danger';
            button.classList.add('active');
        } else {
            icon.className = 'far fa-heart';
            button.classList.remove('active');
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateWishlistCount();
    updateWishlistButtons();
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.product;
            const name = this.dataset.name;
            const price = this.dataset.price;
            const quantityInput = document.getElementById(`qty-${productId}`);
            const quantity = parseInt(quantityInput.value);
            
            addToCart(productId, name, price, quantity);
        });
    });
    
    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.product;
            const name = this.dataset.name;
            const price = this.dataset.price;
            
            addToWishlist(productId, name, price);
        });
    });
    
    // Cart button
    document.getElementById('cartBtn').addEventListener('click', function() {
        displayCart();
        const modal = new bootstrap.Modal(document.getElementById('cartModal'));
        modal.show();
    });
    
    // Wishlist button
    document.getElementById('wishlistBtn').addEventListener('click', function() {
        displayWishlist();
        const modal = new bootstrap.Modal(document.getElementById('wishlistModal'));
        modal.show();
    });
    
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        showToast('Checkout functionality coming soon! Total: ' + document.getElementById('totalAmount').textContent, 'info');
    });
});