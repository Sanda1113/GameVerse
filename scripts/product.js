// Initialize cart from localStorage or create an empty array
let cartItems = initializeCart();

// Get references to DOM elements
let popup = document.getElementById("cartPopup");
let unitPrice = document.getElementById("unitPrice");
let totalPrice = document.getElementById("totalPrice");
let quantityInput = document.getElementById("quantity");
let confirmButton = document.getElementById("confirmPurchase");
let cancelButton = document.getElementById("cancelPurchase");
let closeButton = document.querySelector(".close-btn");
let cartButton = document.getElementById("cartButton");
let cartMessage = document.getElementById("cartMessage");

// Optional warning for exceeding quantity limit
let quantityWarning = document.getElementById("quantityWarning");

// These store the currently selected product's name and price
let selectedProductName = "";
let selectedProductPrice = 0;

// Get the cart from localStorage and parse it, or return an empty array if not present
function initializeCart() {
  let cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

// total quantity of items
function updateCartCount() {
  let totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartButton.textContent = `Cart (${totalItems})`;
}

// Show the popup with the selected product's details
function showPopup(productName, productPrice) {
  selectedProductName = productName;
  selectedProductPrice = productPrice;

  unitPrice.innerText = productPrice.toLocaleString();
  totalPrice.innerText = productPrice.toLocaleString();
  quantityInput.value = 1;

  // Hide previous quantity warning
  if (quantityWarning) quantityWarning.style.display = "none";

  popup.style.display = "flex";
  document.body.classList.add("popup-active"); // Prevent scrolling in background
}

// show warning if over 20
function updateTotalPrice() {
  let quantity = parseInt(quantityInput.value) || 1;
  if (quantity < 1) quantity = 1;

  if (quantity > 20) {
    quantity = 20;
    if (quantityWarning) quantityWarning.style.display = "block";
  } else {
    if (quantityWarning) quantityWarning.style.display = "none";
  }

  quantityInput.value = quantity;
  totalPrice.innerText = (quantity * selectedProductPrice).toLocaleString();
}

// Confirm the purchase, add the product to cart or update existing one, store in localStorage
function confirmPurchase() {
  let quantity = parseInt(quantityInput.value) || 1;
  if (quantity < 1) quantity = 1;
  if (quantity > 20) quantity = 20;

  quantityInput.value = quantity;
  if (quantityWarning) quantityWarning.style.display = "none";

  let existingItem = cartItems.find(item => item.name === selectedProductName);

  // If product is already in cart, update the quantity (max 20)
  if (existingItem) {
    existingItem.quantity += quantity;
    if (existingItem.quantity > 20) {
      existingItem.quantity = 20;
    }
  } else {
    // Otherwise, add it as a new item
    cartItems.push({
      name: selectedProductName,
      price: selectedProductPrice,
      quantity: quantity
    });
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cartItems));
  updateCartCount();
  closePopup();
}

// Close the popup and remove class that disables background interaction
function closePopup() {
  popup.style.display = "none";
  document.body.classList.remove("popup-active");
}

// if empty, show message; else, go to cart page
cartButton.addEventListener("click", function () {
  if (cartItems.length === 0) {
    cartMessage.style.display = "inline";
    setTimeout(() => {
      cartMessage.style.display = "none";
    }, 2000);
  } else {
    window.location.href = "cart.html";
  }
});

// Ensure only numeric input is allowed in quantity field, and update total price
quantityInput.addEventListener("input", () => {
  quantityInput.value = quantityInput.value.replace(/\D/g, '');
  updateTotalPrice();
});

// When quantity field loses focus, validate and correct input to be within 1–20
quantityInput.addEventListener("blur", () => {
  let value = parseInt(quantityInput.value);
  if (isNaN(value) || value < 1) value = 1;
  if (value > 20) value = 20;
  quantityInput.value = value;
  updateTotalPrice();
});

// Bind confirm, cancel, and close buttons to corresponding functions
confirmButton.addEventListener("click", confirmPurchase);
cancelButton.addEventListener("click", closePopup);
closeButton.addEventListener("click", closePopup);

// Initial update of cart count on page load
updateCartCount();

// Fetch product details from JSON and bind actions to Add to Cart and Buy Now buttons
async function fetchProductData() {
  let urlParams = new URLSearchParams(window.location.search);
  let productId = urlParams.get("id"); // Get product ID from URL

  try {
    // Load product data from JSON file
    let response = await fetch("JSON/products.json");
    let products = await response.json();

    // Find the specific product by its ID
    let product = products.find(p => p.id === productId);

    if (!product) {
      document.body.innerHTML = "<h2>Product not found</h2>";
      return;
    }

    // Populate product details on the page
    document.getElementById("productImage").src = product.image;
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productPrice").textContent = `LKR ${product.price.toLocaleString()}`;
    document.getElementById("category").textContent = product.category;
    document.getElementById("productDetails").innerHTML = product.details;

    // Add to cart button shows popup with pricing
    document.querySelector(".addtocart").addEventListener("click", () => {
      showPopup(product.name, product.price);
    });

    // Buy now button takes user directly to order page with name and price in query
    document.querySelector(".buynow").addEventListener("click", () => {
      window.location.href = `order.html?name=${encodeURIComponent(product.name)}&price=${product.price}`;
    });
  } catch (error) {
    document.body.innerHTML = `<h2>Error loading product details: ${error.message}</h2>`;
  }
}

// Load product data on page load
fetchProductData();