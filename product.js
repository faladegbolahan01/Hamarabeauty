/* =========================================================
   HAMARA BEAUTY — PRODUCT DETAILS JAVASCRIPT
========================================================= */


/* =========================================================
   PRODUCT DATA
   Keep this data structure consistent with shop.js.
========================================================= */

const products = [

    {
        id: 1,
        name: "Velvet Glow Foundation",
        category: "Makeup",
        price: 18500,
        description:
            "A smooth, buildable foundation with a natural radiant finish that helps create an even and beautiful complexion.",
        image:
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85",
        badge: "Best Seller"
    },

    {
        id: 2,
        name: "Rose Petal Blush",
        category: "Makeup",
        price: 12500,
        description:
            "Soft, buildable colour designed to give your cheeks a naturally fresh and beautiful flush.",
        image:
            "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85",
        badge: "New"
    },

    {
        id: 3,
        name: "Luxury Glow Serum",
        category: "Skincare",
        price: 22000,
        description:
            "A lightweight facial serum created to leave your skin looking hydrated, smooth and beautifully luminous.",
        image:
            "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=85",
        badge: "Popular"
    },

    {
        id: 4,
        name: "Hydrating Face Cream",
        category: "Skincare",
        price: 16000,
        description:
            "Rich daily hydration designed to help your skin feel soft, smooth and nourished throughout the day.",
        image:
            "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=1200&q=85",
        badge: ""
    },

    {
        id: 5,
        name: "Silk Hair Treatment",
        category: "Hair",
        price: 14500,
        description:
            "A nourishing hair treatment created to help your hair feel softer, smoother and beautifully conditioned.",
        image:
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85",
        badge: "New"
    },

    {
        id: 6,
        name: "Signature Beauty Mist",
        category: "Fragrance",
        price: 19500,
        description:
            "A delicate fragrance mist with an elegant feminine finish, perfect for adding a beautiful touch to your everyday routine.",
        image:
            "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
        badge: ""
    },

    {
        id: 7,
        name: "Hamara Luxe Perfume",
        category: "Fragrance",
        price: 28000,
        description:
            "An elegant signature scent created for unforgettable moments and a beautifully sophisticated finish.",
        image:
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
        badge: "Premium"
    },

    {
        id: 8,
        name: "Beauty Essentials Set",
        category: "Accessories",
        price: 24500,
        description:
            "A carefully curated collection of everyday beauty essentials designed to complement your beauty routine.",
        image:
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=85",
        badge: "Limited"
    }

];


/* =========================================================
   GET PRODUCT FROM URL
========================================================= */

const urlParams = new URLSearchParams(
    window.location.search
);

const productId = Number(
    urlParams.get("id")
);


/* =========================================================
   FIND PRODUCT
========================================================= */

const product = products.find(
    item => item.id === productId
);


/* =========================================================
   DOM ELEMENTS
========================================================= */

const productImage =
    document.getElementById("productImage");

const productName =
    document.getElementById("productName");

const productCategory =
    document.getElementById("productCategory");

const productPrice =
    document.getElementById("productPrice");

const productDescription =
    document.getElementById("productDescription");

const productBadge =
    document.getElementById("productBadge");

const breadcrumbProduct =
    document.getElementById("breadcrumbProduct");

const longDescription =
    document.getElementById("longDescription");

const quantityElement =
    document.getElementById("quantity");

const relatedProducts =
    document.getElementById("relatedProducts");

const cartCount =
    document.getElementById("cartCount");


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
   PRODUCT NOT FOUND
========================================================= */

function showProductNotFound() {

    document.title =
        "Product Not Found | Hamara Beauty";

    productName.textContent =
        "Product not found";

    productCategory.textContent =
        "HAMARA BEAUTY";

    productPrice.textContent =
        "";

    productDescription.textContent =
        "Sorry, we couldn't find the product you're looking for.";

    productImage.src =
        "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=85";

    productBadge.style.display =
        "none";

}


/* =========================================================
   DISPLAY PRODUCT
========================================================= */

function displayProduct() {

    if (!product) {

        showProductNotFound();

        return;

    }


    document.title =
        `${product.name} | Hamara Beauty`;


    productImage.src =
        product.image;

    productImage.alt =
        product.name;


    productName.textContent =
        product.name;


    productCategory.textContent =
        product.category;


    productPrice.textContent =
        formatPrice(product.price);


    productDescription.textContent =
        product.description;


    breadcrumbProduct.textContent =
        product.name;


    longDescription.textContent =
        `${product.description} Hamara Beauty carefully selects products that combine quality, beauty and everyday elegance. This product is designed to become a beautiful addition to your personal routine.`;


    if (product.badge) {

        productBadge.textContent =
            product.badge;

        productBadge.style.display =
            "block";

    } else {

        productBadge.style.display =
            "none";

    }

}


/* =========================================================
   QUANTITY
========================================================= */

let quantity = 1;


const increaseQuantity =
    document.getElementById(
        "increaseQuantity"
    );

const decreaseQuantity =
    document.getElementById(
        "decreaseQuantity"
    );


increaseQuantity.addEventListener(
    "click",
    () => {

        quantity++;

        quantityElement.textContent =
            quantity;

    }
);


decreaseQuantity.addEventListener(
    "click",
    () => {

        if (quantity > 1) {

            quantity--;

            quantityElement.textContent =
                quantity;

        }

    }
);


/* =========================================================
   CART FUNCTIONS
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

    const total =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );

    cartCount.textContent =
        total;

}


/* =========================================================
   ADD PRODUCT TO CART
========================================================= */

function addProductToCart() {

    if (!product) return;


    const cart = getCart();


    const existingProduct =
        cart.find(
            item => item.id === product.id
        );


    if (existingProduct) {

        existingProduct.quantity += quantity;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            image: product.image,

            quantity: quantity

        });

    }


    saveCart(cart);

    updateCartCount();


    showNotification(
        `${product.name} added to your bag`
    );

}


/* =========================================================
   ADD TO CART BUTTON
========================================================= */

const addToCart =
    document.getElementById(
        "addToCart"
    );


addToCart.addEventListener(
    "click",
    addProductToCart
);


/* =========================================================
   BUY NOW
========================================================= */

const buyNow =
    document.getElementById(
        "buyNow"
    );


buyNow.addEventListener(
    "click",
    () => {

        if (!product) return;


        addProductToCart();


        /*
            Cart page will be created next.
            For now we send the customer there.
        */

        setTimeout(() => {

            window.location.href =
                "cart.html";

        }, 500);

    }
);


/* =========================================================
   WISHLIST
========================================================= */

const wishlistButton =
    document.getElementById(
        "wishlistButton"
    );


wishlistButton.addEventListener(
    "click",
    () => {

        const icon =
            wishlistButton.querySelector("i");


        icon.classList.toggle(
            "fa-regular"
        );

        icon.classList.toggle(
            "fa-solid"
        );


        wishlistButton.classList.toggle(
            "liked"
        );

    }
);


/* =========================================================
   RELATED PRODUCTS
========================================================= */

function renderRelatedProducts() {

    if (!product) return;


    const related =
        products

            .filter(item =>
                item.id !== product.id &&
                item.category === product.category
            )

            .slice(0, 4);


    /*
        If there aren't enough products
        in the same category, fill the
        remaining spaces with others.
    */

    if (related.length < 4) {

        const additional =
            products

                .filter(item =>
                    item.id !== product.id &&
                    !related.some(
                        relatedItem =>
                            relatedItem.id === item.id
                    )
                )

                .slice(
                    0,
                    4 - related.length
                );


        related.push(...additional);

    }


    relatedProducts.innerHTML =
        related.map(item => `

            <article
                class="related-card"
                data-aos="fade-up"
            >

                <a href="product.html?id=${item.id}">

                    <div class="related-image">

                        <img
                            src="${item.image}"
                            alt="${item.name}"
                            loading="lazy"
                        >

                    </div>

                </a>


                <div class="related-info">

                    <p>
                        ${item.category}
                    </p>

                    <h3>
                        ${item.name}
                    </h3>

                    <span class="related-price">
                        ${formatPrice(item.price)}
                    </span>

                </div>

            </article>

        `).join("");


    if (typeof AOS !== "undefined") {

        AOS.refresh();

    }

}


/* =========================================================
   INFORMATION TABS
========================================================= */

const infoTabs =
    document.querySelectorAll(
        ".info-tab"
    );


infoTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            infoTabs.forEach(item =>
                item.classList.remove("active")
            );

            tab.classList.add("active");

        }
    );

});


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const navLinks =
    document.getElementById(
        "navLinks"
    );


menuToggle.addEventListener(
    "click",
    () => {

        navLinks.classList.toggle(
            "show"
        );


        const icon =
            menuToggle.querySelector("i");


        if (
            navLinks.classList.contains("show")
        ) {

            icon.classList.remove(
                "fa-bars"
            );

            icon.classList.add(
                "fa-xmark"
            );

        } else {

            icon.classList.remove(
                "fa-xmark"
            );

            icon.classList.add(
                "fa-bars"
            );

        }

    }
);


/* =========================================================
   CLOSE MOBILE NAV
========================================================= */

navLinks
    .querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navLinks.classList.remove(
                    "show"
                );

                const icon =
                    menuToggle.querySelector("i");

                icon.classList.remove(
                    "fa-xmark"
                );

                icon.classList.add(
                    "fa-bars"
                );

            }
        );

    });


/* =========================================================
   NEWSLETTER
========================================================= */

const newsletterForm =
    document.getElementById(
        "newsletterForm"
    );


newsletterForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        showNotification(
            "You're subscribed to Hamara Beauty!"
        );


        newsletterForm.reset();

    }
);


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(message) {

    const oldNotification =
        document.querySelector(
            ".cart-notification"
        );


    if (oldNotification) {

        oldNotification.remove();

    }


    const notification =
        document.createElement("div");


    notification.className =
        "cart-notification";


    notification.innerHTML = `

        <i class="fa-solid fa-check"></i>

        <span>
            ${message}
        </span>

    `;


    document.body.appendChild(
        notification
    );


    setTimeout(() => {

        notification.classList.add(
            "show"
        );

    }, 20);


    setTimeout(() => {

        notification.classList.remove(
            "show"
        );


        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 2500);

}


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
   INITIALIZE PAGE
========================================================= */

displayProduct();

renderRelatedProducts();

updateCartCount();