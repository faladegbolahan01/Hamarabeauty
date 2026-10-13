
// HAMARA BEAUTY - CHECKOUT.JS
// ========================================

const CART_KEY = "hamaraCart";
const API_BASE_URL = "https://hamarabeauty.onrender.com";

const FLUTTERWAVE_PUBLIC_KEY =
  "FLWPUBK_TEST-2e1e8cd83641d77b647d4f555823efeb-X";

const SHIPPING_FEE = 0;

// ========================================
// CART HELPERS
// ========================================

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Error reading cart:", error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCheckoutPrice(item) {
  const values = [
    item.price,
    item.productPrice,
    item.product_price,
    item.salePrice,
    item.amount,
    item.product?.price,
    item.product?.productPrice
  ];

  for (const value of values) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const price = typeof value === "number"
      ? value
      : Number(String(value).replace(/[₦,\s]/g, ""));

    if (Number.isFinite(price) && price >= 0) {
      return price;
    }
  }

  console.error("Product price is missing:", item);
  return null;
}

function getQuantity(item) {
  const quantity = Number(item.quantity ?? 1);

  return Number.isFinite(quantity) && quantity >= 1
    ? Math.floor(quantity)
    : 1;
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character];
  });
}

function getSubtotal(cart) {
  return cart.reduce(function (total, item) {
    const price = getCheckoutPrice(item);
    return total + (price ?? 0) * getQuantity(item);
  }, 0);
}

function hasMissingPrices(cart) {
  return cart.some(function (item) {
    return getCheckoutPrice(item) === null;
  });
}

// ========================================
// DISPLAY CHECKOUT ITEMS
// ========================================

function renderCheckout() {
  const itemsElement = document.getElementById("checkoutItems");
  const subtotalElement = document.getElementById("checkoutSubtotal");
  const shippingElement = document.getElementById("checkoutShipping");
  const totalElement = document.getElementById("checkoutTotal");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  if (!itemsElement) {
    console.error("Missing element: checkoutItems");
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    itemsElement.innerHTML = `
      <p>Your cart is empty.</p>
      <a href="cart.html">Return to cart</a>
    `;

    if (subtotalElement) subtotalElement.textContent = formatMoney(0);
    if (shippingElement) shippingElement.textContent = "Free";
    if (totalElement) totalElement.textContent = formatMoney(0);
    if (placeOrderBtn) placeOrderBtn.disabled = true;

    return;
  }

  itemsElement.innerHTML = cart.map(function (item) {
    const name = escapeHTML(item.name || item.title || "Product");
    const image = item.image || item.img || "";
    const price = getCheckoutPrice(item);
    const quantity = getQuantity(item);

    return `
      <div class="checkout-item">
        ${
          image
            ? `<img
                src="${escapeHTML(image)}"
                alt="${name}"
                class="checkout-item-image"
              >`
            : ""
        }

        <div class="checkout-item-details">
          <h4>${name}</h4>
          <p>Quantity: ${quantity}</p>
          <p>${price === null ? "Price unavailable" : formatMoney(price * quantity)}</p>
        </div>
      </div>
    `;
  }).join("");

  const subtotal = getSubtotal(cart);
  const total = subtotal + SHIPPING_FEE;

  if (subtotalElement) {
    subtotalElement.textContent = formatMoney(subtotal);
  }

  if (shippingElement) {
    shippingElement.textContent =
      SHIPPING_FEE === 0 ? "Free" : formatMoney(SHIPPING_FEE);
  }

  if (totalElement) {
    totalElement.textContent = formatMoney(total);
  }

  if (placeOrderBtn) {
    placeOrderBtn.disabled = hasMissingPrices(cart);
  }

  if (hasMissingPrices(cart)) {
    console.error(
      "One or more cart products have no valid price. Check the product data."
    );
  }
}

// ========================================
// GET CUSTOMER INFORMATION
// ========================================

function getCustomerDetails() {
  const form = document.getElementById("checkoutForm");

  if (!form) {
    throw new Error("Cannot find the checkout form in checkout.html.");
  }

  if (!form.reportValidity()) {
    return null;
  }

  const paymentInput = document.querySelector(
    'input[name="paymentMethod"]:checked'
  );

  if (!paymentInput) {
    throw new Error("Please select a payment method.");
  }

  return {
    fullName: document.getElementById("fullName")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    phone: document.getElementById("phone")?.value.trim() || "",
    state: document.getElementById("state")?.value.trim() || "",
    city: document.getElementById("city")?.value.trim() || "",
    address: document.getElementById("address")?.value.trim() || "",
    deliveryNote:
      document.getElementById("deliveryNote")?.value.trim() || "",
    paymentMethod: paymentInput.value
  };
}

// ========================================
// BACKEND REQUEST
// ========================================

async function postToBackend(endpoint, data) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    throw new Error(
      "Cannot connect to your backend. Make sure your server is running on port 5000."
    );
  }

  const result = await response.json().catch(function () {
    return {};
  });

  if (!response.ok || result.status !== "success") {
    throw new Error(
      result.message || `Server request failed (${response.status}).`
    );
  }

  return result;
}

// ========================================
// FLUTTERWAVE PAYMENT
// ========================================

function startFlutterwavePayment(order, txRef) {
  return new Promise(function (resolve, reject) {
    if (typeof window.FlutterwaveCheckout !== "function") {
      reject(new Error(
        "Flutterwave has not loaded. Check its script in checkout.html."
      ));
      return;
    }

    let completed = false;

    try {
      window.FlutterwaveCheckout({
        public_key: FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: txRef,
        amount: order.total,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",

        customer: {
          email: order.customer.email,
          phone_number: order.customer.phone,
          name: order.customer.fullName
        },

        customizations: {
          title: "Hamara Beauty",
          description: "Payment for your order"
        },

        callback: async function (payment) {
          if (completed) return;
          completed = true;

          try {
            if (!payment || !payment.transaction_id) {
              throw new Error("No transaction ID was returned.");
            }

            // Use the exact field names expected by server.js.
            await postToBackend("/verify-payment", {
              transaction_id: payment.transaction_id,
              tx_ref: txRef
            });

            localStorage.setItem(
              "hamaraLastOrder",
              JSON.stringify({
                ...order,
                status: "paid",
                txRef: txRef,
                transactionId: payment.transaction_id
              })
            );

            localStorage.setItem(
              "hamaraLastPayment",
              JSON.stringify({
                txRef: txRef,
                transactionId: payment.transaction_id
              })
            );

            localStorage.removeItem(CART_KEY);
            localStorage.removeItem("hamaraPendingOrder");
            localStorage.removeItem("hamaraPendingTxRef");

            window.location.href = "order-success.html";
            resolve(true);
          } catch (error) {
            console.error("Payment verification error:", error);

            alert(
              "Payment could not be verified. Do not pay again yet. " +
              "Save this transaction reference: " + txRef
            );

            reject(error);
          }
        },

        onclose: function () {
          if (!completed) {
            resolve(false);
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ========================================
// PLACE ORDER
// ========================================

async function placeOrder(event) {
  if (event) event.preventDefault();

  const cart = getCart();

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (hasMissingPrices(cart)) {
    alert(
      "A product is missing its price. Please return to your cart " +
      "and refresh the product data before placing your order."
    );
    return;
  }

  let customer;

  try {
    customer = getCustomerDetails();
  } catch (error) {
    alert(error.message);
    return;
  }

  if (!customer) return;

  const subtotal = getSubtotal(cart);
  const total = subtotal + SHIPPING_FEE;

  const txRef =
    "HAMARA-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2, 8).toUpperCase();

  const order = {
    customer: customer,
    items: cart,
    subtotal: subtotal,
    shipping: SHIPPING_FEE,
    total: total,
    currency: "NGN",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  localStorage.setItem("hamaraPendingOrder", JSON.stringify(order));
  localStorage.setItem("hamaraPendingTxRef", txRef);

  const button = document.getElementById("placeOrderBtn");

  if (button) {
    button.disabled = true;
    button.textContent = "Processing...";
  }

  try {
    // Send the field names and values expected by server.js.
    await postToBackend("/create-order", {
      tx_ref: txRef,
      amount: total,
      currency: "NGN"
    });

    if (customer.paymentMethod === "flutterwave") {
      await startFlutterwavePayment(order, txRef);
    } else if (customer.paymentMethod === "pay-on-delivery") {
      localStorage.setItem(
        "hamaraLastOrder",
        JSON.stringify({
          ...order,
          status: "pending",
          paymentStatus: "unpaid",
          txRef: txRef
        })
      );

      localStorage.removeItem(CART_KEY);
      localStorage.removeItem("hamaraPendingOrder");
      localStorage.removeItem("hamaraPendingTxRef");

      window.location.href = "order-success.html";
    } else {
      throw new Error("Please select a valid payment method.");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert(error.message || "Could not place your order. Please try again.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Place Order";
    }
  }
}

// ========================================
// START CHECKOUT PAGE
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  renderCheckout();

  const form = document.getElementById("checkoutForm");
  const button = document.getElementById("placeOrderBtn");

  if (form) {
    form.addEventListener("submit", placeOrder);
  } else {
    console.error("checkoutForm was not found in checkout.html");
  }

  if (button && (!form || button.type !== "submit")) {
    button.addEventListener("click", placeOrder);
  }
});
