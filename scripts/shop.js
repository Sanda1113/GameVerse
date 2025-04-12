// Initialize cart from localStorage or create an empty array
let cartItems = initializeCart();

// Cache elements for reuse
let popup = document.getElementById("cartPopup");
let unitPrice = document.getElementById("unitPrice");
let totalPrice = document.getElementById("totalPrice");
let quantityInput = document.getElementById("quantity");
let confirmButton = document.getElementById("confirmPurchase");
let cancelButton = document.getElementById("cancelPurchase");
let closeButton = document.querySelector(".close-btn");
let cartButton = document.getElementById("cartButton");
let cartMessage = document.getElementById("cartMessage");
let quantityWarning = document.getElementById("quantityWarning");

// Store selected product details
let selectedProductName = "";
let selectedProductPrice = 0;

// Load cart 
function initializeCart() {
    try {
        let cart = localStorage.getItem("cart");
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error("Error initializing cart:", e);
        return [];
    }
}

// Update the total item count
function updateCartCount() {
    try {
        let totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (cartButton) {
            cartButton.textContent = `Cart (${totalItems})`;
        }
    } catch (e) {
        console.error("Error updating cart count:", e);
    }
}

// popup modal
function showPopup(productName, productPrice) {
    try {
        selectedProductName = productName;
        selectedProductPrice = productPrice;

        if (unitPrice) unitPrice.innerText = productPrice.toLocaleString();
        if (totalPrice) totalPrice.innerText = productPrice.toLocaleString();
        if (quantityInput) quantityInput.value = 1;
        if (quantityWarning) quantityWarning.style.display = "none";
        if (popup) popup.style.display = "flex";

        document.body.classList.add("popup-active");
    } catch (e) {
        console.error("Error showing popup:", e);
    }
}

// Update total price in popup based on quantity input
function updateTotalPrice() {
    try {
        let quantity = parseInt(quantityInput.value) || 1;

        // (1 to 20)
        if (quantity < 1) quantity = 1;
        if (quantity > 20) {
            quantity = 20;
            if (quantityWarning) quantityWarning.style.display = "block";
        } else {
            if (quantityWarning) quantityWarning.style.display = "none";
        }

        quantityInput.value = quantity;
        if (totalPrice) totalPrice.innerText = (quantity * selectedProductPrice).toLocaleString();
    } catch (e) {
        console.error("Error updating total price:", e);
    }
}

// Add item to cart and update storage
function confirmPurchase() {
    try {
        let quantity = parseInt(quantityInput.value);
        if (isNaN(quantity) || quantity < 1) quantity = 1;
        if (quantity > 20) quantity = 20;

        quantityInput.value = quantity;
        if (quantityWarning) quantityWarning.style.display = "none";

        // Check if item already exists in cart
        let existingItem = cartItems.find(item => item.name === selectedProductName);

        if (existingItem) {
            existingItem.quantity += quantity;
            if (existingItem.quantity > 20) {
                existingItem.quantity = 20;
            }
        } else {
            cartItems.push({
                name: selectedProductName,
                price: selectedProductPrice,
                quantity: quantity
            });
        }

        localStorage.setItem("cart", JSON.stringify(cartItems));
        updateCartCount();
        closePopup();
    } catch (e) {
        console.error("Error confirming purchase:", e);
    }
}

// Close the popup modal
function closePopup() {
    try {
        if (popup) popup.style.display = "none";
        document.body.classList.remove("popup-active");
    } catch (e) {
        console.error("Error closing popup:", e);
    }
}

// Execute when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    try {
        const addToCartButtons = document.querySelectorAll(".addtocart");

        addToCartButtons.forEach(button => {
            button.addEventListener("click", function () {
                try {
                    let productName = this.getAttribute("data-name");
                    let productPrice = parseFloat(this.getAttribute("data-price").replace(/,/g, ""));
                    showPopup(productName, productPrice);
                } catch (e) {
                    console.error("Error in add to cart click:", e);
                }
            });
        });

        // digits only
        if (quantityInput) {
            quantityInput.addEventListener("input", () => {
                try {
                    quantityInput.value = quantityInput.value.replace(/\D/g, '');
                    updateTotalPrice();
                } catch (e) {
                    console.error("Error in quantity input:", e);
                }
            });

            quantityInput.addEventListener("blur", () => {
                try {
                    let value = parseInt(quantityInput.value);
                    if (isNaN(value) || value < 1) value = 1;
                    if (value > 20) value = 20;
                    quantityInput.value = value;
                    updateTotalPrice();
                } catch (e) {
                    console.error("Error in quantity blur:", e);
                }
            });
        }

        //Confirm/Cancel/Close
        if (confirmButton) confirmButton.addEventListener("click", confirmPurchase);
        if (cancelButton) cancelButton.addEventListener("click", closePopup);
        if (closeButton) closeButton.addEventListener("click", closePopup);

        //Cart button
        if (cartButton) {
            cartButton.addEventListener("click", function () {
                try {
                    if (cartItems.length === 0) {
                        // Show message if cart is empty
                        if (cartMessage) {
                            cartMessage.style.display = "inline";
                            setTimeout(() => {
                                if (cartMessage) cartMessage.style.display = "none";
                            }, 2000);
                        }
                    } else {
                        window.location.href = "cart.html";
                    }
                } catch (e) {
                    console.error("Error in cart button click:", e);
                }
            });
        }

        updateCartCount();
    } catch (e) {
        console.error("Error in DOMContentLoaded:", e);
    }
});