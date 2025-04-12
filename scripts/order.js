let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

function updateOrderTable() {
  let orderTable = document.getElementById("order-table").getElementsByTagName("tbody")[0];
  let totalAmount = document.getElementById("totalamount");
  let totalQuantity = document.getElementById("totalquantity");

  orderTable.innerHTML = "";
  let totalPrice = 0;
  let quantitySum = 0;

  cartItems.forEach(item => {
    let row = orderTable.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);

    cell1.textContent = item.name;
    cell2.textContent = item.quantity;
    cell3.textContent = `LKR. ${item.price.toLocaleString()}`;
    cell4.textContent = `LKR. ${(item.quantity * item.price).toLocaleString()}`;

    totalPrice += item.quantity * item.price;
    quantitySum += item.quantity;
  });

  totalAmount.textContent = `LKR. ${totalPrice.toLocaleString()}`;
  totalQuantity.textContent = quantitySum;
}

document.getElementById("payment").addEventListener("change", function () {
  const creditCardSection = document.getElementById("creditCardDetails");
  creditCardSection.style.display = this.value === "credit_card" ? "block" : "none";
});

document.getElementById("order-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const address = document.getElementById("address").value.trim();
  const payment = document.getElementById("payment").value;

  if (!fullname || !address || !payment) {
    alert("Please fill all the required fields.");
    return;
  }

  if (payment === "credit_card") {
    const cardName = document.getElementById("cardName").value.trim();
    const cardNumber = document.getElementById("cardNumber").value.trim();
    const cardAddress = document.getElementById("cardAddress").value.trim();
    const cardExpiry = document.getElementById("cardExpiry").value.trim();
    const cardCVC = document.getElementById("cardCVC").value.trim();

    if (!cardName || !cardNumber || !cardAddress || !cardExpiry || !cardCVC) {
      alert("Please fill all the credit card fields.");
      return;
    }
  }

  // Calculate delivery date (3 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDate = deliveryDate.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Set popup message
  const popupMsg = `Thank you for your purchase, ${fullname}!\n\nYour order will be delivered to:\n${address}\n\nEstimated Delivery Date: ${formattedDate}`;
  document.getElementById("popup-message").textContent = popupMsg;
  document.getElementById("popup").style.display = "flex";

  localStorage.removeItem("cart");
});

document.getElementById("popup-ok").addEventListener("click", () => {
  document.getElementById("popup").style.display = "none";
  window.location.href = "index.html"; // redirect to homepage
});

window.onload = updateOrderTable;