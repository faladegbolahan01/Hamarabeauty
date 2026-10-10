/* =========================================================
   HAMARA BEAUTY — SHOP JAVASCRIPT
========================================================= */


/* =========================================================
   PRODUCT DATA
========================================================= */
console.log("HAMARA SHOP JS IS WORKING");
const products = [

    {
        id: 1,
        name: "Velvet Glow Foundation",
        category: "makeup",
        price: 18500,
        description: "A smooth, buildable foundation with a natural radiant finish.",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85",
        badge: "Best Seller"
    },

    {
        id: 2,
        name: "Rose Petal Blush",
        category: "makeup",
        price: 12500,
        description: "Soft, buildable colour for a naturally flushed complexion.",
        image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=85",
        badge: "New"
    },

    {
        id: 3,
        name: "Luxury Glow Serum",
        category: "skincare",
        price: 22000,
        description: "A lightweight facial serum designed to leave skin luminous.",
        image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85",
        badge: "Popular"
    },

    {
        id: 4,
        name: "Hydrating Face Cream",
        category: "skincare",
        price: 16000,
        description: "Rich daily hydration for soft, smooth-looking skin.",
        image: "https://i.pinimg.com/736x/07/fb/20/07fb209c098d11847f90591da7c88db6.jpg",
        badge: ""
    },

    {
        id: 5,
        name: "Silk Hair Treatment",
        category: "hair",
        price: 14500,
        description: "Nourishing treatment for softer, shinier-looking hair.",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85",
        badge: "New"
    },

    {
        id: 6,
        name: "Signature Beauty Mist",
        category: "fragrance",
        price: 19500,
        description: "A delicate fragrance mist with an elegant feminine finish.",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85",
        badge: ""
    },

    {
        id: 7,
        name: "Hamara Luxe Perfume",
        category: "fragrance",
        price: 28000,
        description: "An elegant signature scent created for unforgettable moments.",
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85",
        badge: "Premium"
    },

    {
        id: 8,
        name: "Beauty Essentials Set",
        category: "accessories",
        price: 24500,
        description: "A curated collection of everyday beauty essentials.",
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=85",
        badge: "Limited"
    }

];


/* =========================================================
   VARIABLES
========================================================= */

const productsGrid = document.getElementById("productsGrid");
const productsNumber = document.getElementById("productsNumber");
const emptyProducts = document.getElementById("emptyProducts");

const searchInput = document.getElementById("productSearch");
const sortSelect = document.getElementById("sortProducts");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const resetFilters =
    document.getElementById("resetFilters");

let currentCategory = "all";
let currentSearch = "";
let currentSort = "default";


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price) {

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(price);

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    let filteredProducts = [...products];


    /* CATEGORY */

    if (currentCategory !== "all") {

        filteredProducts =
            filteredProducts.filter(product =>
                product.category === currentCategory
            );

    }


    /* SEARCH */

    if (currentSearch.trim() !== "") {

        const searchTerm =
            currentSearch.toLowerCase().trim();

        filteredProducts =
            filteredProducts.filter(product =>

                product.name.toLowerCase()
                    .includes(searchTerm)

                ||

                product.description.toLowerCase()
                    .includes(searchTerm)

                ||

                product.category.toLowerCase()
                    .includes(searchTerm)

            );

    }


    /* SORT */

    if (currentSort === "low") {

        filteredProducts.sort(
            (a, b) => a.price - b.price
        );

    }

    else if (currentSort === "high") {

        filteredProducts.sort(
            (a, b) => b.price - a.price
        );

    }

    else if (currentSort === "name") {

        filteredProducts.sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );

    }


    /* PRODUCT COUNT */

    productsNumber.textContent =
        `${filteredProducts.length} ${
            filteredProducts.length === 1
                ? "product"
                : "products"
        }`;


    /* EMPTY STATE */

    if (filteredProducts.length === 0) {

        productsGrid.innerHTML = "";

        emptyProducts.classList.add("show");

        return;

    }

    emptyProducts.classList.remove("show");


    /* RENDER */

    productsGrid.innerHTML =
        filteredProducts.map(product => `

            <article
                class="product-card"
                data-aos="fade-up"
            >

                <div class="product-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                    >

                    ${
                        product.badge
                            ? `
                                <span class="product-badge">
                                    ${product.badge}
                                </span>
                              `
                            : ""
                    }


                    <div class="product-actions">

                        <button
                            class="product-action wishlist-btn"
                            data-id="${product.id}"
                            aria-label="Add to wishlist"
                        >
                            <i class="fa-regular fa-heart"></i>
                        </button>

                        <button
                            class="product-action view-btn"
                            data-id="${product.id}"
                            aria-label="View product"
                        >
                            <i class="fa-regular fa-eye"></i>
                        </button>

                    </div>

                </div>


                <div class="product-info">

                    <p class="product-category">
                        ${product.category}
                    </p>

                    <h3 class="product-name">
                        ${product.name}
                    </h3>

                    <p class="product-description">
                        ${product.description}
                    </p>

                    <div class="product-bottom">

                        <span class="product-price">
                            ${formatPrice(product.price)}
                        </span>

                        <button
                            class="add-cart"
                            data-id="${product.id}"
                        >
                            Add to Bag
                        </button>

                    </div>

                </div>

            </article>

        `).join("");


    /* REFRESH AOS */

    if (typeof AOS !== "undefined") {
        AOS.refresh();
    }

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentCategory =
            button.dataset.category;

        renderProducts();

    });

});


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener("input", event => {

    currentSearch = event.target.value;

    renderProducts();

});


/* =========================================================
   SORT
========================================================= */

sortSelect.addEventListener("change", event => {

    currentSort = event.target.value;

    renderProducts();

});


/* =========================================================
   RESET FILTERS
========================================================= */

resetFilters.addEventListener("click", () => {

    currentCategory = "all";
    currentSearch = "";
    currentSort = "default";

    searchInput.value = "";
    sortSelect.value = "default";

    categoryButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.category === "all"
        );

    });

    renderProducts();

});


/* =========================================================
   CART
========================================================= */

function getCart() {

    return JSON.parse(
        localStorage.getItem("hamaraCart")
    ) || [];

}


function saveCart(cart) {

    localStorage.setItem(
        "hamaraCart",
        JSON.stringify(cart)
    );

}


function updateCartCount() {

    const cart = getCart();

    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    const cartCount =
        document.getElementById("cartCount");

    cartCount.textContent = totalItems;

}


function addToCart(productId) {

    const product =
        products.find(
            item => item.id === productId
        );

    if (!product) return;


    const cart = getCart();

    const existingItem =
        cart.find(
            item => item.id === productId
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            image: product.image,

            quantity: 1

        });

    }


    saveCart(cart);

    updateCartCount();

    showCartNotification(
        `${product.name} added to your bag`
    );

}


/* =========================================================
   PRODUCT BUTTONS
========================================================= */

productsGrid.addEventListener("click", event => {

    const addButton =
        event.target.closest(".add-cart");

    const wishlistButton =
        event.target.closest(".wishlist-btn");

    const viewButton =
        event.target.closest(".view-btn");


    /* ADD TO CART */

    if (addButton) {

        const id =
            Number(addButton.dataset.id);

        addToCart(id);

    }


    /* WISHLIST */

    if (wishlistButton) {

        const icon =
            wishlistButton.querySelector("i");

        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");

        wishlistButton.classList.toggle("liked");

    }


    /* VIEW PRODUCT */

    if (viewButton) {

        const id =
            viewButton.dataset.id;

        /*
            Later this will become:

            product.html?id=${id}

            when we build the product page.
        */

        window.location.href =
            `product.html?id=${id}`;

    }

});


/* =========================================================
   CART NOTIFICATION
========================================================= */

function showCartNotification(message) {

    const existing =
        document.querySelector(".cart-notification");

    if (existing) {
        existing.remove();
    }


    const notification =
        document.createElement("div");

    notification.className =
        "cart-notification";

    notification.innerHTML = `

        <i class="fa-solid fa-check"></i>

        <span>${message}</span>

    `;


    document.body.appendChild(notification);


    setTimeout(() => {

        notification.classList.add("show");

    }, 20);


    setTimeout(() => {

        notification.classList.remove("show");

        setTimeout(() => {
            notification.remove();
        }, 300);

    }, 2500);

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");


menuToggle.addEventListener("click", () => {

    navLinks.classList.toggle("show");

    const icon =
        menuToggle.querySelector("i");

    if (navLinks.classList.contains("show")) {

        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");

    } else {

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    }

});


/* Close mobile menu */

navLinks.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("show");

        const icon =
            menuToggle.querySelector("i");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    });

});


/* =========================================================
   NEWSLETTER
========================================================= */

const newsletterForm =
    document.getElementById("newsletterForm");


newsletterForm.addEventListener("submit", event => {

    event.preventDefault();

    const email =
        newsletterForm.querySelector("input").value;

    if (!email) return;

    showCartNotification(
        "You're subscribed to Hamara Beauty!"
    );

    newsletterForm.reset();

});


/* =========================================================
   AOS
========================================================= */

AOS.init({

    duration: 850,

    easing: "ease-out-cubic",

    once: true,

    offset: 80

});


/* =========================================================
   INITIALIZE
========================================================= */

renderProducts();

updateCartCount();