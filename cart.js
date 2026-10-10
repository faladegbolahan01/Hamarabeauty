
// =========================================================
// HAMARA BEAUTY — CART JAVASCRIPT
// =========================================================

// CART STORAGE
const CART_KEY = "hamaraCart";

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("Could not read cart:", error);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// =========================================================
// PRICE HELPERS — FIXES ₦NaN
// =========================================================

function parsePrice(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) && value >= 0 ? value : 0;
    }

    // Supports values like "18500", "18,500", and "₦18,500".
    const cleaned = String(value ?? "")
        .replace(/[₦,\s]/g, "")
        .trim();

    const price = Number(cleaned);

    return Number.isFinite(price) && price >= 0 ? price : 0;
}

function getItemPrice(item) {
    return parsePrice(item.price ?? item.productPrice ?? 0);
}

function getItemQuantity(item) {
    const quantity = Number(item.quantity ?? 1);

    return Number.isFinite(quantity) && quantity >= 1
        ? Math.floor(quantity)
        : 1;
}

function formatPrice(price) {
    return "₦" + parsePrice(price).toLocaleString("en-NG", {
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// =========================================================
// CART COUNT
// =========================================================

function updateCartCount() {
    const cart = getCart();

    const totalItems = cart.reduce(function (total, item) {
        return total + getItemQuantity(item);
    }, 0);

    document.querySelectorAll(".cart-count").forEach(function (count) {
        count.textContent = totalItems;
    });
}

// =========================================================
// RENDER CART
// =========================================================

function renderCart() {
    const cart = getCart();

    const cartItemsContainer = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");
    const itemsCount = document.getElementById("itemsCount");

    const subtotalElement = document.getElementById("subtotal");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");

    const checkoutButton = document.getElementById("checkoutBtn");

    if (!cartItemsContainer) {
        console.error("Could not find the cartItems element in cart.html.");
        return;
    }

    // TOTAL NUMBER OF ITEMS
    const totalItems = cart.reduce(function (total, item) {
        return total + getItemQuantity(item);
    }, 0);

    if (itemsCount) {
        itemsCount.textContent = totalItems;
    }

    // EMPTY CART
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "";

        if (emptyCart) {
            emptyCart.classList.add("show");
        }

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(0);
        }

        if (shippingElement) {
            shippingElement.textContent = formatPrice(0);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(0);
        }

        if (checkoutButton) {
            checkoutButton.disabled = true;
        }

        updateCartCount();
        return;
    }

    if (emptyCart) {
        emptyCart.classList.remove("show");
    }

    if (checkoutButton) {
        checkoutButton.disabled = false;
    }

    // CREATE CART ITEMS
    cartItemsContainer.innerHTML = cart.map(function (item) {
        const quantity = getItemQuantity(item);
        const price = getItemPrice(item);
        const itemTotal = price * quantity;

        const id = escapeHTML(item.id ?? "");
        const name = escapeHTML(item.name || item.title || "Beauty Product");
        const image = escapeHTML(item.image || "");

        return `
            <article class="cart-item" data-id="${id}">

                <a
                    href="product.html?id=${encodeURIComponent(String(item.id ?? ""))}"
                    class="cart-item-image"
                >
                    <img
                        src="${image}"
                        alt="${name}"
                    >
                </a>

                <div class="cart-item-info">

                    <span class="cart-item-category">
                        Beauty
                    </span>

                    <a
                        href="product.html?id=${encodeURIComponent(String(item.id ?? ""))}"
                        class="cart-item-name"
                    >
                        ${name}
                    </a>

                    <p class="cart-item-price">
                        ${formatPrice(price)}
                    </p>

                    <div class="cart-item-controls">

                        <div class="quantity-control">

                            <button
                                type="button"
                                class="quantity-btn"
                                onclick="changeQuantity('${id}', -1)"
                                aria-label="Decrease quantity"
                            >
                                <i class="fa-solid fa-minus"></i>
                            </button>

                            <span class="quantity-number">
                                ${quantity}
                            </span>

                            <button
                                type="button"
                                class="quantity-btn"
                                onclick="changeQuantity('${id}', 1)"
                                aria-label="Increase quantity"
                            >
                                <i class="fa-solid fa-plus"></i>
                            </button>

                        </div>

                        <button
                            type="button"
                            class="remove-btn"
                            onclick="removeFromCart('${id}')"
                        >
                            <i class="fa-regular fa-trash-can"></i>
                            Remove
                        </button>

                    </div>

                </div>

                <div class="cart-item-total">
                    <strong>${formatPrice(itemTotal)}</strong>
                </div>

            </article>
        `;
    }).join("");

    // CALCULATE SUBTOTAL SAFELY
    const subtotal = cart.reduce(function (total, item) {
        return total + getItemPrice(item) * getItemQuantity(item);
    }, 0);

    // SHIPPING IS CURRENTLY FREE
    const shipping = 0;
    const total = subtotal + shipping;

    // UPDATE ORDER SUMMARY
    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
    }

    if (shippingElement) {
        shippingElement.textContent =
            shipping === 0 ? "Free" : formatPrice(shipping);
    }

    if (totalElement) {
        totalElement.textContent = formatPrice(total);
    }

    updateCartCount();
}

// =========================================================
// CHANGE QUANTITY
// =========================================================

function changeQuantity(productId, change) {
    const cart = getCart();

    const item = cart.find(function (product) {
        return String(product.id) === String(productId);
    });

    if (!item) {
        console.error("Cart product not found:", productId);
        return;
    }

    item.quantity = Math.max(
        1,
        getItemQuantity(item) + Number(change)
    );

    saveCart(cart);
    renderCart();
    updateCartCount();
}

// =========================================================
// REMOVE PRODUCT
// =========================================================

function removeFromCart(productId) {
    let cart = getCart();

    cart = cart.filter(function (item) {
        return String(item.id) !== String(productId);
    });

    saveCart(cart);
    renderCart();
    updateCartCount();

    showNotification("Product removed from your bag.");
}

// =========================================================
// NOTIFICATION
// =========================================================

function showNotification(message) {
    let notification = document.querySelector(".cart-notification");

    if (!notification) {
        notification = document.createElement("div");
        notification.className = "cart-notification";

        notification.innerHTML = `
            <i class="fa-solid fa-check"></i>
            <span></span>
        `;

        document.body.appendChild(notification);

        const style = document.createElement("style");

        style.textContent = `
            .cart-notification {
                position: fixed;
                right: 25px;
                bottom: 25px;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 14px 20px;
                background: #28201f;
                color: white;
                box-shadow: 0 15px 40px rgba(0,0,0,0.18);
                font-size: 12px;
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
                transition: all 0.3s ease;
            }

            .cart-notification.show {
                opacity: 1;
                transform: translateY(0);
            }

            .cart-notification i {
                color: #d8a79a;
            }

            @media (max-width: 500px) {
                .cart-notification {
                    left: 15px;
                    right: 15px;
                    bottom: 15px;
                    justify-content: center;
                }
            }
        `;

        document.head.appendChild(style);
    }

    notification.querySelector("span").textContent = message;
    notification.classList.add("show");

    clearTimeout(notification.timer);

    notification.timer = setTimeout(function () {
        notification.classList.remove("show");
    }, 2500);
}

// =========================================================
// CHECKOUT BUTTON
// =========================================================

function setupCheckout() {
    const checkoutButton = document.getElementById("checkoutBtn");

    if (!checkoutButton) {
        return;
    }

    checkoutButton.addEventListener("click", function (event) {
        event.preventDefault();

        const cart = getCart();

        if (cart.length === 0) {
            showNotification("Your bag is empty.");
            return;
        }

        window.location.href = "checkout.html";
    });
}

// =========================================================
// MOBILE NAVIGATION
// =========================================================

function setupMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (!menuToggle || !navLinks) {
        return;
    }

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");

        const icon = menuToggle.querySelector("i");

        if (!icon) return;

        if (navLinks.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
        } else {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        }
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("active");

            const icon = menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }
        });
    });
}

// =========================================================
// NEWSLETTER
// =========================================================

function setupNewsletter() {
    const form = document.getElementById("newsletterForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("newsletterEmail");
        const email = emailInput ? emailInput.value.trim() : "";

        if (!email) {
            return;
        }

        showNotification("Thank you for joining Hamara Beauty!");
        form.reset();
    });
}

// =========================================================
// AOS ANIMATION
// =========================================================

function setupAOS() {
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 800,
            once: true,
            offset: 80
        });
    }
}

// =========================================================
// INITIALIZE CART PAGE
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    renderCart();
    updateCartCount();
    setupCheckout();
    setupMobileMenu();
    setupNewsletter();
    setupAOS();
});
