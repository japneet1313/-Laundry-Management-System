// Simulated Database
let users = [];
let orders = [];
let currentUser = null;

// DOM Elements
const authModal = document.getElementById('auth-modal');
const orderModal = document.getElementById('order-modal');
const paymentModal = document.getElementById('payment-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const navLinks = document.getElementById('nav-links');
const loginLink = document.getElementById('login-link');
const dashboardLink = document.getElementById('dashboard-link');

// Show Authentication Modal
function showAuthModal(type) {
    authModal.style.display = 'block';
    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Show Order Modal
function showOrderModal() {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }
    orderModal.style.display = 'block';
}

// Close Modal
function closeModal() {
    authModal.style.display = 'none';
    orderModal.style.display = 'none';
    paymentModal.style.display = 'none';
}

// Register New User
function register() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }
    
    // Check if user exists
    if (users.some(user => user.email === email)) {
        alert('User already exists');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In real app, hash this
        isMember: false,
        loyaltyPoints: 0,
        orders: []
    };
    
    users.push(newUser);
    alert('Registration successful! Please login.');
    showAuthModal('login');
}

// Login User
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateNav();
        closeModal();
        alert(`Welcome back, ${user.name}!`);
    } else {
        alert('Invalid credentials');
    }
}

// Update Navigation Based on Auth Status
function updateNav() {
    if (currentUser) {
        loginLink.style.display = 'none';
        dashboardLink.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        dashboardLink.style.display = 'none';
    }
}

// Check if user is logged in on page load
window.onload = function() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateNav();
    }
};

// Calculate Price
function calculatePrice() {
    const serviceType = document.getElementById('service-type').value;
    const itemCount = parseInt(document.getElementById('item-count').value) || 0;
    const weight = parseFloat(document.getElementById('item-weight').value) || 0;
    
    let price = 0;
    
    switch(serviceType) {
        case 'wash':
            price = weight * 1.5;
            break;
        case 'dry':
            price = itemCount * 5;
            break;
        case 'iron':
            price = itemCount * 2;
            break;
    }
    
    document.getElementById('price-result').innerHTML = `
        Estimated Price: $${price.toFixed(2)}
    `;
}

// Confirm Order
function confirmOrder() {
    const serviceType = document.getElementById('order-service').value;
    const itemCount = parseInt(document.getElementById('order-items').value);
    const weight = parseFloat(document.getElementById('order-weight').value);
    const pickupTime = document.getElementById('pickup-time').value;
    const address = document.getElementById('address').value;
    
    if (!serviceType || !itemCount || !weight || !pickupTime || !address) {
        alert('Please fill all fields');
        return;
    }
    
    let price = 0;
    let serviceName = '';
    
    switch(serviceType) {
        case 'wash':
            price = weight * 1.5;
            serviceName = 'Wash & Fold';
            break;
        case 'dry':
            price = itemCount * 5;
            serviceName = 'Dry Cleaning';
            break;
        case 'iron':
            price = itemCount * 2;
            serviceName = 'Ironing';
            break;
    }
    
    // Apply membership discount
    if (currentUser.isMember) {
        price = price * 0.9;
    }
    
    // Update price summary
    document.getElementById('price-summary').innerHTML = `
        <h3>Order Summary</h3>
        <p>Service: ${serviceName}</p>
        <p>Items: ${itemCount}</p>
        <p>Weight: ${weight} lbs</p>
        <p>Pickup: ${new Date(pickupTime).toLocaleString()}</p>
        <p>Address: ${address}</p>
        <p><strong>Total: $${price.toFixed(2)}</strong></p>
        ${currentUser.isMember ? '<p>Member discount applied (10%)</p>' : ''}
    `;
    
    // Store order temporarily
    currentOrder = {
        serviceType,
        serviceName,
        itemCount,
        weight,
        pickupTime,
        address,
        price,
        status: 'pending'
    };
    
    orderModal.style.display = 'none';
    paymentModal.style.display = 'block';
}

// Select Payment Method
function selectPayment(method) {
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(pm => pm.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    currentPaymentMethod = method;
    
    if (method === 'card') {
        document.getElementById('card-details').style.display = 'block';
    } else {
        document.getElementById('card-details').style.display = 'none';
    }
}

// Process Payment
function processPayment() {
    if (!currentOrder) return;
    
    // Add loyalty points
    currentUser.loyaltyPoints += Math.floor(currentOrder.price);
    
    // Create order
    const order = {
        id: Date.now().toString(),
        userId: currentUser.id,
        ...currentOrder,
        date: new Date().toISOString(),
        status: 'scheduled'
    };
    
    orders.push(order);
    currentUser.orders.push(order.id);
    
    // Simulate notifications
    setTimeout(() => {
        alert(`SMS Notification: Your Dewdrops order #${order.id} has been confirmed!`);
    }, 1000);
    
    setTimeout(() => {
        alert(`Email Notification: Receipt for order #${order.id} is ready`);
    }, 1500);
    
    // Generate receipt
    generateReceipt(order);
    
    // Close modals and reset
    closeModal();
    currentOrder = null;
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Generate PDF Receipt (simulated)
function generateReceipt(order) {
    // In a real app, this would call a backend API
    console.log('Generating receipt for order:', order);
    // We'll just create a simple PDF file that would be downloaded
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === authModal) {
        authModal.style.display = 'none';
    }
    if (event.target === orderModal) {
        orderModal.style.display = 'none';
    }
    if (event.target === paymentModal) {
        paymentModal.style.display = 'none';
    }
};