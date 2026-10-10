
"use strict";

/* ==================================================
   HAMARA BEAUTY - MAIN JAVASCRIPT
================================================== */

/* ==================================================
   AOS
================================================== */

if (typeof AOS !== "undefined") {
    AOS.init({
        duration: 900,
        easing: "ease-out-cubic",
        once: true,
        offset: 90,
        mirror: false
    });
}

/* ==================================================
   NAVBAR SCROLL EFFECT
================================================== */

const header = document.getElementById("siteHeader");

window.addEventListener("scroll", function () {
    if (header) {
        header.classList.toggle("scrolled", window.scrollY > 40);
    }
});

/* ==================================================
   MOBILE MENU
================================================== */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
        const isOpen = navMenu.classList.toggle("open");

        menuToggle.classList.toggle("open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("menu-open", isOpen);
    });

    document.querySelectorAll(".nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            navMenu.classList.remove("open");
            menuToggle.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        });
    });
}

/* ==================================================
   ACTIVE NAV LINK
================================================== */

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", function () {
    let current = "";

    sections.forEach(function (section) {
        const sectionTop = section.offsetTop - 180;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(function (link) {
        link.classList.remove("active");

        if (current && link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
});

/* ==================================================
   SEARCH
================================================== */

const searchButton = document.getElementById("searchButton");
const searchOverlay = document.getElementById("searchOverlay");
const searchClose = document.getElementById("searchClose");
const searchInput = document.getElementById("searchInput");

if (searchButton && searchOverlay) {
    searchButton.addEventListener("click", function () {
        searchOverlay.classList.add("open");
        document.body.classList.add("menu-open");

        setTimeout(function () {
            if (searchInput) searchInput.focus();
        }, 300);
    });
}

if (searchClose && searchOverlay) {
    searchClose.addEventListener("click", function () {
        searchOverlay.classList.remove("open");
        document.body.classList.remove("menu-open");
    });
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && searchOverlay) {
        searchOverlay.classList.remove("open");
        document.body.classList.remove("menu-open");
    }
});

/* ==================================================
   CART - SAVE ACTUAL PRODUCTS
================================================== */

const CART_KEY = "hamaraCart";
const cartCount = document.getElementById("cartCount");

function readCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("Could not read cart:", error);
        return [];
    }
}

function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
    const cart = readCart();

    const totalQuantity = cart.reduce(function (total, item) {
        return total + Math.max(1, Number(item.quantity) || 1);
    }, 0);

    // Keep the legacy counter in sync.
    localStorage.setItem("hamaraCartCount", String(totalQuantity));

    if (cartCount) {
        cartCount.textContent = totalQuantity;
    }
}

function getProductCard(button) {
    return button.closest(
        ".product-card, .product-item, .shop-item, .product, [data-product]"
    );
}

function getProductDetails(button) {
    const card = getProductCard(button);

    if (!card) {
        throw new Error("Could not find the product card for this button.");
    }

    const nameElement = card.querySelector(
        "[data-product-name], .product-name, .product-title, h2, h3, h4"
    );

    const priceElement = card.querySelector(
        "[data-product-price], .product-price, .price, [class*='price']"
    );

    const imageElement = card.querySelector("img");

    const name = (
        button.dataset.name ||
        button.dataset.productName ||
        card.dataset.name ||
        card.dataset.productName ||
        nameElement?.textContent ||
        ""
    ).trim();

    const rawPrice =
        button.dataset.price ??
        button.dataset.productPrice ??
        card.dataset.price ??
        card.dataset.productPrice ??
        priceElement?.dataset.price ??
        priceElement?.textContent;

    const price = Number(
        String(rawPrice ?? "").replace(/[₦,\s]/g, "")
    );

    const image =
        button.dataset.image ||
        card.dataset.image ||
        imageElement?.getAttribute("src") ||
        "";

    const id =
        button.dataset.id ||
        button.dataset.productId ||
        card.dataset.id ||
        card.dataset.productId ||
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (!name) {
        throw new Error("This product has no readable name.");
    }

    if (
        rawPrice === undefined ||
        rawPrice === null ||
        rawPrice === "" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        throw new Error(
            `The price for "${name}" is missing or invalid. Add its real price to the product card.`
        );
    }

    return {
        id: String(id),
        name: name,
        price: price,
        quantity: 1,
        image: image
    };
}

document.querySelectorAll(".add-cart").forEach(function (button) {
    button.addEventListener("click", function (event) {
        event.preventDefault();

        try {
            const product = getProductDetails(button);
            const cart = readCart();

            const existing = cart.find(function (item) {
                return String(item.id) === product.id;
            });

            if (existing) {
                existing.quantity = Math.max(
                    1,
                    Number(existing.quantity) || 1
                ) + 1;

                // Update existing products if their saved price was missing.
                existing.price = product.price;
                existing.name = product.name;

                if (product.image) existing.image = product.image;
            } else {
                cart.push(product);
            }

            writeCart(cart);
            updateCartCount();

            const originalText = button.textContent;

            button.textContent = "Added ✓";
            button.style.background = "#e85d91";
            button.style.color = "#ffffff";

            setTimeout(function () {
                button.textContent = originalText;
                button.style.background = "";
                button.style.color = "";
            }, 1200);

        } catch (error) {
            console.error("Add to cart error:", error);
            alert(error.message);
        }
    });
});

updateCartCount();

/* ==================================================
   WISHLIST
================================================== */

document.querySelectorAll(".wishlist").forEach(function (button) {
    button.addEventListener("click", function () {
        const icon = button.querySelector("i");

        if (!icon) return;

        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");

        icon.style.color = icon.classList.contains("fa-solid")
            ? "#e85d91"
            : "";
    });
});

/* ==================================================
   NEWSLETTER
================================================== */

const newsletterForm = document.getElementById("newsletterForm");
const newsletterMessage = document.getElementById("newsletterMessage");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("emailInput");
        const email = emailInput ? emailInput.value.trim() : "";

        if (!email) return;

        if (newsletterMessage) {
            newsletterMessage.textContent =
                "Thank you for joining Hamara Beauty! ✨";
        }

        newsletterForm.reset();
    });
}

/* ==================================================
   SMOOTH ANCHOR SCROLL
================================================== */

document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");

        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});
