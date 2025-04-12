let cartItems = initializeCart();

let cartTable = document.getElementById("cart-table").getElementsByTagName("tbody")[0];
let totalProducts = document.getElementById("totalproducts");
let totalAmount = document.getElementById("totalamount");

// Delete confirmation popup
const deleteConfirmPopup = document.getElementById("deleteConfirmPopup");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

// Favorite popups
const favoritePopup = document.createElement("div");
favoritePopup.className = "popup";
favoritePopup.style.display = "none";
favoritePopup.innerHTML = `
  <div class="popup-content">
    <h3 id="favoritePopupTitle">Saved as Favorite</h3>
    <p id="favoritePopupMessage">Current cart saved as favorite!</p>
    <div class="popup-buttons" id="favoritePopupButtons">
      <button id="favoriteOkBtn">OK</button>
    </div>
  </div>
`;
document.body.appendChild(favoritePopup);

let productToDelete = null;

function initializeCart() {
    let cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
}

function groupCartItems(items) {
    let groupedItems = {};

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (!item.name || !isNaN(item.name)) {
            console.error("Error: Invalid product name detected", item);
            continue;
        }

        if (groupedItems[item.name]) {
            groupedItems[item.name].quantity += item.quantity || 1;
        } else {
            groupedItems[item.name] = {
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
            };
        }
    }
    return Object.values(groupedItems);
}

function showDeletePopup(productName) {
    productToDelete = productName;
    deleteConfirmPopup.style.display = "flex";
}

function hideDeletePopup() {
    productToDelete = null;
    deleteConfirmPopup.style.display = "none";
}

confirmDeleteBtn.addEventListener("click", function () {
    if (productToDelete) {
        cartItems = cartItems.filter(item => item.name !== productToDelete);
        localStorage.setItem("cart", JSON.stringify(cartItems));
        updateCartTable();
        hideDeletePopup();
    }
});

cancelDeleteBtn.addEventListener("click", function () {
    hideDeletePopup();
});

function updateCartTable() {
    cartTable.innerHTML = "";

    let groupedItems = groupCartItems(cartItems);
    let totalQuantity = 0;
    let totalPrice = 0;

    for (let i = 0; i < groupedItems.length; i++) {
        let row = cartTable.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);

        cell1.textContent = groupedItems[i].name;

        let quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.value = groupedItems[i].quantity;
        quantityInput.min = 1;
        quantityInput.max = 20;
        quantityInput.inputMode = "numeric";
        quantityInput.setAttribute("aria-label", "Quantity");
        cell2.appendChild(quantityInput);

        let price = parseFloat(groupedItems[i].price.toString().replace(/,/g, ""));
        cell3.textContent = "LKR. " + price.toLocaleString();

        let itemTotal = groupedItems[i].quantity * price;
        cell4.textContent = "LKR. " + itemTotal.toLocaleString();

        totalQuantity += groupedItems[i].quantity;
        totalPrice += itemTotal;

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.backgroundColor = "#c62828";
        deleteBtn.style.color = "#fff";
        deleteBtn.style.border = "none";
        deleteBtn.style.padding = "6px 10px";
        deleteBtn.style.borderRadius = "4px";
        deleteBtn.style.cursor = "pointer";

        deleteBtn.addEventListener("click", function () {
            showDeletePopup(groupedItems[i].name);
        });
        cell5.appendChild(deleteBtn);

        quantityInput.addEventListener("keypress", function (e) {
            if (!/[0-9]/.test(e.key)) e.preventDefault();
        });

        quantityInput.addEventListener("input", function () {
            const val = quantityInput.value;
            if (val === "") return;
            if (!/^\d+$/.test(val)) {
                quantityInput.value = groupedItems[i].quantity;
                return;
            }
            let parsed = parseInt(val);
            if (parsed < 1 || parsed > 20) {
                quantityInput.value = groupedItems[i].quantity;
                return;
            }
            let newItemTotal = parsed * price;
            cell4.textContent = "LKR. " + newItemTotal.toLocaleString();
        });

        quantityInput.addEventListener("change", function () {
            const parsed = parseInt(quantityInput.value);
            if (isNaN(parsed) || parsed < 1 || parsed > 20) {
                quantityInput.value = groupedItems[i].quantity;
                return;
            }

            let itemIndex = cartItems.findIndex(item => item.name === groupedItems[i].name);
            if (itemIndex !== -1) {
                cartItems[itemIndex].quantity = parsed;
                localStorage.setItem("cart", JSON.stringify(cartItems));
                updateCartTable();
            }
        });
    }

    totalProducts.textContent = totalQuantity;
    totalAmount.textContent = "LKR. " + totalPrice.toLocaleString();
}

function initializeCartPage() {
    updateCartTable();

    const saveBtn = document.getElementById("saveFavoriteBtn");
    const applyBtn = document.getElementById("applyFavoriteBtn");
    const popupMessage = document.getElementById("favoritePopupMessage");
    const popupTitle = document.getElementById("favoritePopupTitle");
    const okBtn = document.getElementById("favoriteOkBtn");

    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            localStorage.setItem("favoriteOrder", JSON.stringify(cartItems));
            popupTitle.textContent = "Saved as Favorite";
            popupMessage.textContent = "Current cart saved as favorite!";
            favoritePopup.style.display = "flex";
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener("click", function () {
            popupTitle.textContent = "Apply Favorite";
            popupMessage.textContent = "Do you wish to apply favorites to your current cart?";

            const confirmBtn = document.createElement("button");
            confirmBtn.textContent = "Yes";
            confirmBtn.style.backgroundColor = "#66c0f4";

            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "No";

            const buttonContainer = document.getElementById("favoritePopupButtons");
            buttonContainer.innerHTML = ""; // Clear previous buttons
            buttonContainer.appendChild(confirmBtn);
            buttonContainer.appendChild(cancelBtn);

            favoritePopup.style.display = "flex";

            confirmBtn.addEventListener("click", function () {
                const favorite = JSON.parse(localStorage.getItem("favoriteOrder"));
                if (favorite && Array.isArray(favorite)) {
                    cartItems = favorite;
                    localStorage.setItem("cart", JSON.stringify(cartItems));
                    updateCartTable();
                    favoritePopup.style.display = "none";
                    alert("Favorite order applied!");
                } else {
                    alert("No favorite order found.");
                }
            });

            cancelBtn.addEventListener("click", function () {
                favoritePopup.style.display = "none";
            });
        });
    }
    const okBtnListener = () => favoritePopup.style.display = "none";
    okBtn.addEventListener("click", okBtnListener);

    const buyNowBtn = document.getElementById("buyNowBtn");
    if (buyNowBtn) {
        buyNowBtn.addEventListener("click", function () {
            if (cartItems.length === 0) {
                alert("Your cart is empty. Please add items before proceeding to checkout.");
                return;
            }
            window.location.href = "order.html";
        });
    }
}
initializeCartPage();