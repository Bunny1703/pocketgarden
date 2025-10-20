// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
updateCartCount();

// Update cart count in the header
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Generate random growth data for the growth tracker
function generateRandomGrowthData(plantType, timeRange) {
    const today = new Date();
    const data = [];
    const labels = [];
    let days = 30; // Default to month
    
    if (timeRange === 'week') {
        days = 7;
    } else if (timeRange === '3months') {
        days = 90;
    } else if (timeRange === 'all') {
        days = 120;
    }
    
    // Generate growth pattern based on plant type
    let baseHeight = 0;
    let growthRate = 0;
    let healthStatus = 'Excellent';
    
    switch(plantType) {
        case 'tomato':
            baseHeight = 5;
            growthRate = 0.8;
            break;
        case 'basil':
            baseHeight = 2;
            growthRate = 0.5;
            break;
        case 'mint':
            baseHeight = 3;
            growthRate = 0.7;
            break;
        case 'pepper':
            baseHeight = 4;
            growthRate = 0.6;
            break;
        case 'lettuce':
            baseHeight = 1;
            growthRate = 0.4;
            break;
        case 'cilantro':
            baseHeight = 2;
            growthRate = 0.3;
            break;
        default:
            baseHeight = 3;
            growthRate = 0.5;
    }
    
    // Generate data points
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Format date as MM/DD
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
        labels.push(formattedDate);
        
        // Calculate height with some randomness
        const randomFactor = Math.random() * 0.4 - 0.2; // -0.2 to 0.2
        const height = baseHeight + (growthRate * (days - i)) * (1 + randomFactor);
        data.push(height.toFixed(1));
    }
    
    // Generate milestones
    const milestones = generateMilestones(plantType, days);
    
    // Current stats
    const currentHeight = data[data.length - 1];
    const weeklyGrowth = (parseFloat(data[data.length - 1]) - parseFloat(data[Math.max(0, data.length - 8)])).toFixed(1);
    
    return {
        labels: labels,
        data: data,
        currentHeight: currentHeight,
        growthRate: `${weeklyGrowth} cm/week`,
        daysGrowing: days,
        healthStatus: healthStatus,
        milestones: milestones
    };
}

// Generate milestones for plant growth
function generateMilestones(plantType, days) {
    const milestones = [];
    const milestoneTypes = [
        'Sprouted',
        'First true leaves',
        'Growth spurt',
        'Flowering begins',
        'First fruits/harvest'
    ];
    
    // Generate 2-4 milestones based on days
    const milestoneCount = Math.min(Math.floor(days / 20) + 1, 5);
    
    for (let i = 0; i < milestoneCount; i++) {
        const dayOffset = Math.floor((i + 1) * days / (milestoneCount + 1));
        const date = new Date();
        date.setDate(date.getDate() - days + dayOffset);
        
        milestones.push({
            day: dayOffset,
            date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
            event: milestoneTypes[i],
            description: `Your ${plantType} plant ${getRandomMilestoneDescription(milestoneTypes[i])}`
        });
    }
    
    return milestones;
}

// Get random milestone description
function getRandomMilestoneDescription(milestoneType) {
    const descriptions = {
        'Sprouted': [
            'has sprouted! The journey begins.',
            'is showing its first signs of life.',
            'has emerged from the soil.'
        ],
        'First true leaves': [
            'has developed its first true leaves.',
            'is now showing proper leaves.',
            'has grown beyond the cotyledon stage.'
        ],
        'Growth spurt': [
            'is growing rapidly now.',
            'has doubled in size this week.',
            'is showing excellent vertical growth.'
        ],
        'Flowering begins': [
            'has started flowering.',
            'is showing its first flower buds.',
            'has entered the reproductive stage.'
        ],
        'First fruits/harvest': [
            'is ready for its first harvest.',
            'has produced its first fruits.',
            'has reached maturity.'
        ]
    };
    
    const options = descriptions[milestoneType] || ['is progressing well.'];
    return options[Math.floor(Math.random() * options.length)];
}

// Add to cart function
function addToCart(productId, productName, price, image) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${productName} added to cart!`);
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize cart page
function initCart() {
    renderCart();
    
    // Add event listeners for quantity changes and removals
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('increase-quantity')) {
            const productId = e.target.closest('.cart-item').dataset.id;
            updateCartItemQuantity(productId, 1);
        } else if (e.target.classList.contains('decrease-quantity')) {
            const productId = e.target.closest('.cart-item').dataset.id;
            updateCartItemQuantity(productId, -1);
        } else if (e.target.classList.contains('remove-item')) {
            const productId = e.target.closest('.cart-item').dataset.id;
            removeCartItem(productId);
        }
    });
}

// Update cart item quantity
function updateCartItemQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeCartItem(productId);
        } else {
            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCount();
            
            // Re-render cart
            renderCart();
        }
    }
}

// Remove item from cart
function removeCartItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Re-render cart
    renderCart();
}

// Update cart summary
function updateCartSummary() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingElement = document.getElementById('cart-shipping');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');
    
    if (!subtotalElement || !shippingElement || !taxElement || !totalElement) return;
    
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calculate shipping (free over ₹2000, otherwise ₹200)
    const shipping = subtotal > 2000 ? 0 : 200;
    
    // Calculate tax (18% GST)
    const tax = subtotal * 0.18;
    
    // Calculate total
    const total = subtotal + shipping + tax;
    
    // Update elements
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    shippingElement.textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
    
    // Store total in localStorage for checkout page
    localStorage.setItem('cartTotal', total.toFixed(2));
    localStorage.setItem('cartSubtotal', subtotal.toFixed(2));
    localStorage.setItem('cartShipping', shipping.toFixed(2));
    localStorage.setItem('cartTax', tax.toFixed(2));
}

// Initialize shop page
function initShop() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = button.closest('.product-card');
            const productId = productCard.dataset.id;
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = parseFloat(productCard.querySelector('.product-price').textContent.replace('₹', ''));
            const productImage = productCard.querySelector('.product-image img').src;
            
            addToCart(productId, productName, productPrice, productImage);
        });
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products
            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Initialize growth tracker
function initGrowthTracker() {
    const plantSelect = document.getElementById('plant-select');
    const timeRangeSelect = document.getElementById('time-range');
    const refreshButton = document.getElementById('refresh-data');
    
    if (plantSelect && timeRangeSelect) {
        // Initial data generation
        updateGrowthData();
        
        // Event listeners
        plantSelect.addEventListener('change', updateGrowthData);
        timeRangeSelect.addEventListener('change', updateGrowthData);
        if (refreshButton) {
            refreshButton.addEventListener('click', updateGrowthData);
        }
    }
}
function updateGrowthData() {
    const plantType = document.getElementById('plant-select').value;
    const timeRange = document.getElementById('time-range').value;
    const plantName = document.getElementById('plant-select').options[document.getElementById('plant-select').selectedIndex].text;
    
    // Generate random data
    const growthData = generateRandomGrowthData(plantType, timeRange);
    
    // Update plant name
    const plantNameElement = document.getElementById('plant-name');
    if (plantNameElement) {
        plantNameElement.textContent = plantName;
    }
    
    // Update stats
    document.getElementById('current-height').textContent = `${growthData.currentHeight} cm`;
    document.getElementById('growth-rate').textContent = growthData.growthRate;
    document.getElementById('days-growing').textContent = `${growthData.daysGrowing} days`;
    document.getElementById('health-status').textContent = growthData.healthStatus;
    
    // Update milestones
    const milestoneContainer = document.getElementById('milestone-container');
    if (milestoneContainer) {
        milestoneContainer.innerHTML = '';
        
        growthData.milestones.forEach(milestone => {
            const milestoneElement = document.createElement('div');
            milestoneElement.className = 'milestone';
            milestoneElement.innerHTML = `
                <div class="milestone-date">${milestone.date}</div>
                <div class="milestone-content">
                    <h4>${milestone.event}</h4>
                    <p>${milestone.description}</p>
                </div>
            `;
            milestoneContainer.appendChild(milestoneElement);
        });
    }
    
    // Update chart
    updateGrowthChart(growthData.labels, growthData.data, plantName);
}

// Update the growth chart
function updateGrowthChart(labels, data, plantName) {
    const ctx = document.getElementById('growth-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.growthChart) {
        window.growthChart.destroy();
    }
    
    // Create new chart
    window.growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${plantName} Height (cm)`,
                data: data,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Height (cm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

// This duplicate initCart function was removed to fix syntax errors

// This duplicate updateCartSummary function was removed to fix syntax errors

// Add cart event listeners
function addCartEventListeners() {
    // Quantity buttons
    const minusButtons = document.querySelectorAll('.quantity-btn.minus');
    const plusButtons = document.querySelectorAll('.quantity-btn.plus');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const removeButtons = document.querySelectorAll('.remove-btn');
    
    minusButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const item = cart.find(item => item.id === id);
            
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                updateCart();
            }
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const item = cart.find(item => item.id === id);
            
            if (item) {
                item.quantity += 1;
                updateCart();
            }
        });
    });
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', () => {
            const id = input.dataset.id;
            const item = cart.find(item => item.id === id);
            
            if (item) {
                const quantity = parseInt(input.value);
                if (quantity > 0) {
                    item.quantity = quantity;
                    updateCart();
                } else {
                    input.value = item.quantity;
                }
            }
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            cart = cart.filter(item => item.id !== id);
            updateCart();
        });
    });
    
    // Checkout button
    const checkoutButton = document.querySelector('.checkout-btn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
}

// Update cart
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    initCart();
}

// Initialize checkout page
function initCheckout() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const shippingElement = document.getElementById('checkout-shipping');
    const taxElement = document.getElementById('checkout-tax');
    const totalElement = document.getElementById('checkout-total');
    
    // Get cart data from localStorage
    const cartData = localStorage.getItem('cart');
    const cart = cartData ? JSON.parse(cartData) : [];
    
    if (checkoutItemsContainer && subtotalElement && shippingElement && taxElement && totalElement) {
        // Clear checkout items
        checkoutItemsContainer.innerHTML = '';
        
        // Add checkout items
        cart.forEach(item => {
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'checkout-item';
            checkoutItem.innerHTML = `
                <div class="checkout-item-details">
                    <span class="checkout-item-quantity">${item.quantity}x</span>
                    <span class="checkout-item-name">${item.name}</span>
                </div>
                <div class="checkout-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
            `;
            
            checkoutItemsContainer.appendChild(checkoutItem);
        });
        
        // Calculate totals
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal > 2000 ? 0 : 200; // Free shipping over ₹2000
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + shipping + tax;
        
        // Update summary elements
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        shippingElement.textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
        taxElement.textContent = `₹${tax.toFixed(2)}`;
        totalElement.textContent = `₹${total.toFixed(2)}`;
        
        // Place order button
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Validate form
                const form = document.getElementById('shipping-form');
                if (form.checkValidity()) {
                    // Show confirmation modal
                    const modal = document.getElementById('order-confirmation');
                    const confirmationEmail = document.getElementById('confirmation-email');
                    const orderNumber = document.getElementById('order-number');
                    
                    // Generate random order number
                    const randomOrderNum = 'PG' + Math.floor(10000 + Math.random() * 90000);
                    orderNumber.textContent = randomOrderNum;
                    
                    // Get email from form
                    const email = document.getElementById('email').value;
                    confirmationEmail.textContent = email;
                    
                    // Show modal
                    modal.classList.remove('hidden');
                    
                    // Clear cart
                    localStorage.setItem('cart', JSON.stringify([]));
                    updateCartCount();
                } else {
                    // Trigger HTML5 validation
                    form.reportValidity();
                }
            });
        }
        
        // Close modal button
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                const modal = document.getElementById('order-confirmation');
                modal.classList.add('hidden');
            });
        }
    }
}

// Growth Tracker Functionality
function initGrowthTracker() {
    const plantSelect = document.getElementById('plant-select');
    const timeRangeSelect = document.getElementById('time-range');
    
    if (plantSelect && timeRangeSelect) {
        // Default selections
        let selectedPlant = plantSelect.value;
        let selectedTimeRange = timeRangeSelect.value;
        
        // Wait for DOM to be fully loaded before generating graph
        setTimeout(() => {
            // Generate random data and load initial graph
            loadGrowthGraph(selectedPlant, selectedTimeRange);
            
            // Update plant name in tips section
            const plantNameElement = document.getElementById('plant-name');
            if (plantNameElement) {
                const selectedOption = plantSelect.options[plantSelect.selectedIndex];
                plantNameElement.textContent = selectedOption.textContent;
            }
            
            // Update plant tips
            if (typeof updatePlantTips === 'function') {
                updatePlantTips(selectedPlant);
            }
        }, 100);
        
        // Plant selection
        plantSelect.addEventListener('change', () => {
            selectedPlant = plantSelect.value;
            // Generate new random data when plant changes
            loadGrowthGraph(selectedPlant, selectedTimeRange);
            
            // Update plant name in tips section
            const plantNameElement = document.getElementById('plant-name');
            if (plantNameElement) {
                const selectedOption = plantSelect.options[plantSelect.selectedIndex];
                plantNameElement.textContent = selectedOption.textContent;
            }
            // Update plant tips
            if (typeof updatePlantTips === 'function') {
                updatePlantTips(selectedPlant);
            }
        });
        
        // Time range selection
        timeRangeSelect.addEventListener('change', () => {
            selectedTimeRange = timeRangeSelect.value;
            // Generate new random data when time range changes
            loadGrowthGraph(selectedPlant, selectedTimeRange);
        });
        
        // Add refresh button functionality if it exists
        const refreshButton = document.getElementById('refresh-data');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                // Generate new random data on refresh
                loadGrowthGraph(selectedPlant, selectedTimeRange);
                showNotification('Growth data refreshed with new random values!', 'success');
            });
        }
    }

}

// Generate realistic random growth data
function generateGrowthData(plant, timeRange) {
    let data = [];
    let labels = [];
    let dayCount = 0;
    
    // Set base growth rates and variability by plant type
    const growthRates = {
        'tomato': { base: 0.4, variability: 0.15, maxHeight: 60 },
        'basil': { base: 0.3, variability: 0.1, maxHeight: 40 },
        'mint': { base: 0.35, variability: 0.12, maxHeight: 30 },
        'pepper': { base: 0.25, variability: 0.08, maxHeight: 45 },
        'lettuce': { base: 0.28, variability: 0.09, maxHeight: 25 },
        'cilantro': { base: 0.22, variability: 0.07, maxHeight: 20 }
    };
    
    // Default to tomato if plant not found
    const growthProfile = growthRates[plant] || growthRates['tomato'];
    
    // Generate data points based on time range
    switch (timeRange) {
        case 'week':
            dayCount = 7;
            for (let i = 1; i <= dayCount; i++) {
                labels.push(`Day ${i}`);
            }
            break;
        case 'month':
            dayCount = 30;
            for (let i = 1; i <= 4; i++) {
                labels.push(`Week ${i}`);
            }
            break;
        case '3months':
            dayCount = 90;
            for (let i = 1; i <= 12; i++) {
                labels.push(`Week ${i}`);
            }
            break;
        case 'all':
            dayCount = 120;
            for (let i = 1; i <= 4; i++) {
                labels.push(`Month ${i}`);
            }
            break;
        default:
            dayCount = 30;
            for (let i = 1; i <= 4; i++) {
                labels.push(`Week ${i}`);
            }
    }
    
    // Generate growth curve with some randomness
    let height = 0;
    let dataPoints = labels.length;
    let daysPerPoint = dayCount / dataPoints;
    
    for (let i = 0; i < dataPoints; i++) {
        // Add growth with some randomness
        for (let j = 0; j < daysPerPoint; j++) {
            // Calculate growth with sigmoid curve to simulate natural growth pattern
            let growthStage = (height / growthProfile.maxHeight);
            let growthFactor = 4 * growthStage * (1 - growthStage); // Peaks at middle of growth
            let dailyGrowth = growthProfile.base * growthFactor;
            
            // Add randomness
            dailyGrowth += (Math.random() * 2 - 1) * growthProfile.variability;
            dailyGrowth = Math.max(0.05, dailyGrowth); // Ensure some minimum growth
            
            height += dailyGrowth;
        }
        
        // Cap at max height
        height = Math.min(height, growthProfile.maxHeight);
        data.push(parseFloat(height.toFixed(1)));
    }
    
    return { data, labels };
}

// Analyze growth data and provide insights
function analyzeGrowthData(data, plant, timeRange) {
    // Calculate growth metrics
    const currentHeight = data[data.length - 1];
    let growthRate = 0;
    
    // Calculate average growth rate
    if (data.length > 1) {
        const totalGrowth = currentHeight - data[0];
        let timeUnit = '';
        let timeValue = 1;
        
        switch (timeRange) {
            case 'week':
                timeUnit = 'day';
                timeValue = 7;
                break;
            case 'month':
                timeUnit = 'week';
                timeValue = 4;
                break;
            case '3months':
                timeUnit = 'week';
                timeValue = 12;
                break;
            case 'all':
                timeUnit = 'month';
                timeValue = 4;
                break;
            default:
                timeUnit = 'week';
                timeValue = 4;
        }
        
        growthRate = parseFloat((totalGrowth / timeValue).toFixed(1));
        
        // Determine health status based on growth consistency
        let healthStatus = 'Good';
        let daysGrowing = 0;
        
        switch (timeRange) {
            case 'week': daysGrowing = 7; break;
            case 'month': daysGrowing = 30; break;
            case '3months': daysGrowing = 90; break;
            case 'all': daysGrowing = 120; break;
            default: daysGrowing = 30;
        }
        
        // Calculate growth consistency
        let growthDiffs = [];
        for (let i = 1; i < data.length; i++) {
            growthDiffs.push(data[i] - data[i-1]);
        }
        
        const avgDiff = growthDiffs.reduce((a, b) => a + b, 0) / growthDiffs.length;
        const variance = growthDiffs.reduce((a, b) => a + Math.pow(b - avgDiff, 2), 0) / growthDiffs.length;
        
        // Determine health based on growth rate and consistency
        if (growthRate > 0.3 && variance < 0.1) {
            healthStatus = 'Excellent';
        } else if (growthRate > 0.2 || variance < 0.2) {
            healthStatus = 'Good';
        } else if (growthRate > 0.1) {
            healthStatus = 'Fair';
        } else {
            healthStatus = 'Needs Attention';
        }
        
        return {
            currentHeight: currentHeight,
            growthRate: growthRate,
            growthRateUnit: timeUnit,
            daysGrowing: daysGrowing,
            healthStatus: healthStatus
        };
    }
    
    // Default values if not enough data
    return {
        currentHeight: currentHeight,
        growthRate: 0.2,
        growthRateUnit: 'week',
        daysGrowing: 30,
        healthStatus: 'Good'
    };
}

// Load growth graph
function loadGrowthGraph(plant, timeRange) {
    const graphContainer = document.querySelector('.graph-container');
    const canvas = document.getElementById('growth-chart');
    
    if (graphContainer && canvas) {
        // Generate realistic random data
        const { data, labels } = generateGrowthData(plant, timeRange);
        
        // Analyze the data
        const analysis = analyzeGrowthData(data, plant, timeRange);
        
        // Update stats cards
        document.getElementById('current-height').textContent = `${analysis.currentHeight} cm`;
        document.getElementById('growth-rate').textContent = `${analysis.growthRate} cm/${analysis.growthRateUnit}`;
        document.getElementById('days-growing').textContent = `${analysis.daysGrowing} days`;
        document.getElementById('health-status').textContent = analysis.healthStatus;
        
        // Set health status color
        const healthElement = document.getElementById('health-status');
        if (healthElement) {
            healthElement.className = '';
            switch (analysis.healthStatus) {
                case 'Excellent':
                    healthElement.classList.add('status-excellent');
                    break;
                case 'Good':
                    healthElement.classList.add('status-good');
                    break;
                case 'Fair':
                    healthElement.classList.add('status-fair');
                    break;
                case 'Needs Attention':
                    healthElement.classList.add('status-warning');
                    break;
            }
        }
        
        // Create chart using Chart.js
        if (window.growthChart) {
            window.growthChart.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        window.growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Plant Height (cm)',
                    data: data,
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Height (cm)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${plant.charAt(0).toUpperCase() + plant.slice(1)} Growth Progress`,
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Height: ${context.parsed.y} cm`;
                            }
                        }
                    }
                }
            }
        });
        
        // Update milestones
        updateMilestones(plant, timeRange, data);
    }
}

// Update milestones
function updateMilestones(plant, timeRange, data) {
    const milestoneContainer = document.getElementById('milestone-container');
    
    if (milestoneContainer) {
        // Clear previous milestones
        milestoneContainer.innerHTML = '';
        
        // Generate milestones based on plant type and growth data
        const milestones = generateMilestones(plant, timeRange, data);
        
        // Create milestone elements
        milestones.forEach(milestone => {
            const milestoneElement = document.createElement('div');
            milestoneElement.className = 'milestone';
            
            milestoneElement.innerHTML = `
                <div class="milestone-icon">
                    <i class="${milestone.icon}"></i>
                </div>
                <div class="milestone-content">
                    <h4>${milestone.title}</h4>
                    <p>${milestone.description}</p>
                    <span class="milestone-date">${milestone.date}</span>
                </div>
            `;
            
            milestoneContainer.appendChild(milestoneElement);
        });
        
        // Update plant tips
        updatePlantTips(plant);
    }
}

// Generate milestones based on plant type and growth data
function generateMilestones(plant, timeRange, data) {
    const milestones = [];
    const maxHeight = data[data.length - 1];
    
    // Define growth stages for different plants (as percentage of max height)
    const growthStages = {
        'tomato': [
            { threshold: 0.1, icon: 'fas fa-seedling', title: 'Germination', description: 'Seeds have sprouted' },
            { threshold: 0.25, icon: 'fas fa-leaf', title: 'First True Leaves', description: 'First set of true leaves appeared' },
            { threshold: 0.5, icon: 'fas fa-tree', title: 'Vegetative Growth', description: 'Plant is focusing on leaf and stem growth' },
            { threshold: 0.75, icon: 'fas fa-sun', title: 'Flowering', description: 'Flowers are forming' },
            { threshold: 0.9, icon: 'fas fa-apple-alt', title: 'Fruiting', description: 'Small tomatoes are developing' }
        ],
        'basil': [
            { threshold: 0.1, icon: 'fas fa-seedling', title: 'Germination', description: 'Seeds have sprouted' },
            { threshold: 0.3, icon: 'fas fa-leaf', title: 'First True Leaves', description: 'First set of true leaves appeared' },
            { threshold: 0.6, icon: 'fas fa-tree', title: 'Bushy Growth', description: 'Multiple stems with abundant leaves' },
            { threshold: 0.8, icon: 'fas fa-cut', title: 'Ready for Harvest', description: 'Leaves are ready for first harvest' }
        ],
        'mint': [
            { threshold: 0.15, icon: 'fas fa-seedling', title: 'Sprouting', description: 'First shoots emerging' },
            { threshold: 0.4, icon: 'fas fa-leaf', title: 'Leaf Development', description: 'Characteristic mint leaves forming' },
            { threshold: 0.7, icon: 'fas fa-expand-arrows-alt', title: 'Spreading', description: 'Plant is spreading through runners' },
            { threshold: 0.9, icon: 'fas fa-cut', title: 'Ready for Harvest', description: 'Aromatic leaves ready for harvest' }
        ],
        'pepper': [
            { threshold: 0.1, icon: 'fas fa-seedling', title: 'Germination', description: 'Seeds have sprouted' },
            { threshold: 0.3, icon: 'fas fa-leaf', title: 'True Leaves', description: 'First set of true leaves appeared' },
            { threshold: 0.5, icon: 'fas fa-tree', title: 'Vegetative Growth', description: 'Plant is developing strong stems' },
            { threshold: 0.7, icon: 'fas fa-sun', title: 'Flowering', description: 'White flowers are forming' },
            { threshold: 0.9, icon: 'fas fa-pepper-hot', title: 'Fruiting', description: 'Peppers are developing' }
        ],
        'lettuce': [
            { threshold: 0.2, icon: 'fas fa-seedling', title: 'Germination', description: 'Seeds have sprouted' },
            { threshold: 0.5, icon: 'fas fa-leaf', title: 'Leaf Development', description: 'Characteristic leaves forming' },
            { threshold: 0.8, icon: 'fas fa-salad', title: 'Head Formation', description: 'Lettuce head is forming' },
            { threshold: 0.95, icon: 'fas fa-cut', title: 'Ready for Harvest', description: 'Lettuce is ready to be harvested' }
        ],
        'cilantro': [
            { threshold: 0.2, icon: 'fas fa-seedling', title: 'Germination', description: 'Seeds have sprouted' },
            { threshold: 0.5, icon: 'fas fa-leaf', title: 'Leaf Development', description: 'Feathery leaves are forming' },
            { threshold: 0.8, icon: 'fas fa-cut', title: 'Ready for Harvest', description: 'Leaves are ready for harvest' },
            { threshold: 0.95, icon: 'fas fa-sun', title: 'Bolting', description: 'Plant is starting to flower (harvest soon)' }
        ]
    };
    
    // Use default if plant type not found
    const stages = growthStages[plant] || growthStages['tomato'];
    
    // Determine time labels based on time range
    let timeLabels;
    switch (timeRange) {
        case 'week':
            timeLabels = Array.from({length: 7}, (_, i) => `Day ${i+1}`);
            break;
        case 'month':
            timeLabels = Array.from({length: 4}, (_, i) => `Week ${i+1}`);
            break;
        case '3months':
            timeLabels = Array.from({length: 12}, (_, i) => `Week ${i+1}`);
            break;
        case 'all':
            timeLabels = Array.from({length: 4}, (_, i) => `Month ${i+1}`);
            break;
        default:
            timeLabels = Array.from({length: 4}, (_, i) => `Week ${i+1}`);
    }
    
    // Find which milestones have been reached
    for (let i = 0; i < data.length; i++) {
        const currentHeight = data[i];
        const heightPercentage = currentHeight / maxHeight;
        
        for (const stage of stages) {
            if (heightPercentage >= stage.threshold && 
                !milestones.some(m => m.title === stage.title)) {
                milestones.push({
                    ...stage,
                    date: timeLabels[Math.min(i, timeLabels.length - 1)]
                });
            }
        }
    }
    
    return milestones;
}

// Update plant tips
function updatePlantTips(plant) {
    const tipsContainer = document.getElementById('plant-tips');
    
    if (tipsContainer) {
        // Clear previous tips
        tipsContainer.innerHTML = '';
        
        // Define tips for each plant type
        const tips = {
            'tomato': [
                'Water consistently to prevent blossom end rot',
                'Provide support as plants grow taller',
                'Prune suckers for larger fruit production',
                'Ensure at least 6 hours of sunlight daily',
                'Feed with balanced fertilizer every 2 weeks'
            ],
            'basil': [
                'Pinch off flower buds to encourage leaf growth',
                'Water at the base to prevent leaf diseases',
                'Harvest from the top to promote bushier growth',
                'Provide at least 6 hours of sunlight',
                'Space plants to ensure good air circulation'
            ],
            'mint': [
                'Keep soil consistently moist',
                'Harvest regularly to encourage new growth',
                'Provide partial shade in hot climates',
                'Prune to prevent flowering for better flavor'
            ],
            'pepper': [
                'Allow soil to dry slightly between waterings',
                'Provide support for heavy fruit-bearing branches',
                'Feed with phosphorus-rich fertilizer when flowering',
                'Maintain warm temperatures (above 18°C)',
                'Harvest when peppers reach full size and color'
            ],
            'lettuce': [
                'Keep soil consistently moist but not soggy',
                'Provide partial shade in hot weather',
                'Harvest outer leaves first for continuous growth',
                'Plant in succession for ongoing harvests',
                'Harvest in the morning for crispest leaves'
            ],
            'cilantro': [
                'Plant in succession every 2-3 weeks for continuous harvest',
                'Keep soil consistently moist',
                'Harvest leaves before flowering begins',
                'Grow in partial shade in hot climates',
                'Harvest by cutting stems near the base'
            ]
        };
        
        // Use default if plant type not found
        const plantTips = tips[plant] || tips['tomato'];
        
        // Create tip elements
        plantTips.forEach(tip => {
            const tipElement = document.createElement('div');
            tipElement.className = 'tip';
            tipElement.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <p>${tip}</p>
            `;
            
            tipsContainer.appendChild(tipElement);
        });
    }
}
// Generate milestones based on plant type and growth data
function generateMilestones(plant, timeRange, data) {
    let milestones = [];
    const maxHeight = data[data.length - 1];
    
    // Define growth stages for different plants (as percentage of max height)
    const growthStages = {
        'tomato': [
            { threshold: 0.1, icon: 'fas fa-seedling', title: 'Germination', description: 'Seeds have sprouted' },
            { threshold: 0.25, icon: 'fas fa-leaf', title: 'First True Leaves', description: 'First set of true leaves appeared' },
            { threshold: 0.5, icon: 'fas fa-tree', title: 'Vegetative Growth', description: 'Plant is focusing on leaf and stem growth' },
            { threshold: 0.75, icon: 'fas fa-sun', title: 'Flowering', description: 'Flowers are forming' },
            { threshold: 0.9, icon: 'fas fa-apple-alt', title: 'Fruiting', description: 'Small tomatoes are developing' }
        ],
        'basil': [
            { threshold: 0.1, icon: 'fas fa-seedling', title: 'Germination', description: 'Seeds have sprouted' },
            { threshold: 0.3, icon: 'fas fa-leaf', title: 'First True Leaves', description: 'First set of true leaves appeared' },
            { threshold: 0.6, icon: 'fas fa-tree', title: 'Bushy Growth', description: 'Multiple stems with abundant leaves' },
            { threshold: 0.8, icon: 'fas fa-cut', title: 'Ready for Harvest', description: 'Leaves are ready for first harvest' }
        ],
        'mint': [
            { threshold: 0.15, icon: 'fas fa-seedling', title: 'Sprouting', description: 'First shoots emerging' },
            { threshold: 0.4, icon: 'fas fa-leaf', title: 'Leaf Development', description: 'Characteristic mint leaves forming' },
            { threshold: 0.7, icon: 'fas fa-expand-arrows-alt', title: 'Spreading', description: 'Plant is spreading through runners' },
            { threshold: 0.9, icon: 'fas fa-cut', title: 'Ready for Harvest', description: 'Aromatic leaves ready for harvest' }
        ],
        'pepper': [
            { threshold: 0.1, icon: 'fas fa-seedling', title: 'Germination', description: 'Seeds have sprouted' },
            { threshold: 0.3, icon: 'fas fa-leaf', title: 'True Leaves', description: 'First set of true leaves appeared' },
            { threshold: 0.5, icon: 'fas fa-tree', title: 'Vegetative Growth', description: 'Plant is developing strong stems' },
            { threshold: 0.7, icon: 'fas fa-sun', title: 'Flowering', description: 'White flowers are forming' },
            { threshold: 0.9, icon: 'fas fa-pepper-hot', title: 'Fruiting', description: 'Peppers are developing' }
        ]
    };
    
    // Get growth stages for selected plant or use default
    const stages = growthStages[plant] || growthStages['tomato'];
    
    // Generate date labels based on time range
    let dateLabels = [];
    switch (timeRange) {
        case 'week':
            dateLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
            break;
        case 'month':
            dateLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            break;
        case '3months':
            dateLabels = ['Week 1', 'Week 3', 'Week 5', 'Week 7', 'Week 9', 'Week 11'];
            break;
        case 'all':
            dateLabels = ['Month 1', 'Month 2', 'Month 3', 'Month 4'];
            break;
        default:
            dateLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    }
    
    // Create milestones based on growth data
    stages.forEach((stage, index) => {
        // Find data point closest to threshold
        const targetHeight = stage.threshold * maxHeight;
        let closestIndex = 0;
        let minDiff = Number.MAX_VALUE;
        
        data.forEach((height, i) => {
            const diff = Math.abs(height - targetHeight);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        });
        
        // Get date label (ensure it's within bounds)
        const dateIndex = Math.min(closestIndex, dateLabels.length - 1);
        const date = dateLabels[dateIndex];
        
        // Add milestone
        milestones.push({
            icon: stage.icon,
            title: stage.title,
            description: stage.description,
            date: date
        });
    });
    
    return milestones;
}

// Update milestones in the UI
function updateMilestones(plant, timeRange, data) {
    const milestoneList = document.getElementById('milestone-list');
    if (!milestoneList) return;
    
    // Clear existing milestones
    milestoneList.innerHTML = '';
    
    // Generate milestones based on plant type and growth data
    const milestones = generateMilestones(plant, timeRange, data);
    
    // Add milestones to list
    milestones.forEach(milestone => {
        const milestoneElement = document.createElement('div');
        milestoneElement.className = 'milestone';
        milestoneElement.innerHTML = `
            <div class="milestone-icon">
                <i class="${milestone.icon}"></i>
            </div>
            <div class="milestone-details">
                <h4>${milestone.title}</h4>
                <p>${milestone.description}</p>
                <span class="milestone-date">${milestone.date}</span>
            </div>
        `;
        
        milestoneList.appendChild(milestoneElement);
    });
}

// Initialize page based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Get current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Initialize page
    switch (currentPage) {
        case 'shop.html':
            initShop();
            break;
        case 'cart.html':
            initCart();
            break;
        case 'checkout.html':
            initCheckout();
            break;
        case 'growth-tracker.html':
            initGrowthTracker();
            break;
        default:
            // Update cart count on all pages
            updateCartCount();
    }
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--primary-color);
            color: white;
            padding: 15px 30px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            transition: bottom 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            bottom: 20px;
        }
    `;
    document.head.appendChild(style);
});