// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBZKNc6C-29bCCujwW8MuPOO3ebfaC5Ia0",
  authDomain: "catering-system-524a0.firebaseapp.com",
  projectId: "catering-system-524a0",
  storageBucket: "catering-system-524a0.firebasestorage.app",
  messagingSenderId: "1057047132807",
  appId: "1:1057047132807:web:ababf6eac9e843d6a49622"
};

// Initialize Firebase services
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- Navbar & Authentication State Management ---

const loginLink = document.getElementById('login-link');
const logoutLink = document.getElementById('logout-link');

auth.onAuthStateChanged(user => {
    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
    }
});

// --- Logout Functionality ---

if (logoutLink) {
    logoutLink.addEventListener('click', (event) => {
        event.preventDefault(); 
        auth.signOut().then(() => {
            console.log('User logged out successfully.');
            alert('You have been logged out.');
            window.location.href = 'login.html'; // Redirect to login page
        }).catch((error) => {
            console.error('Logout Error:', error);
        });
    });
}

// --- User Registration Logic (Signup) ---
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        // Create Auth User
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Create User Document in Firestore with Default Role
                return db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    role: 'user' // Default role is 'user', not 'admin'
                });
            })
            .then(() => {
                console.log('User account and database entry created.');
                alert('Signup successful! Please login.');
                window.location.href = 'login.html';
            })
            .catch((error) => {
                console.error('Signup Error:', error);
                alert(error.message);
            });
    });
}
// --- User Login Logic ---

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Authenticate user with Firebase
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User logged in:', userCredential.user);
                alert('Login successful!');
                window.location.href = 'index.html'; // Redirect to home
            })
            .catch((error) => {
                console.error('Login Error:', error);
                alert(error.message);
            });
    });
}

// --- Admin Panel: Add Product Logic ---

const addProductForm = document.getElementById('add-product-form');
if (addProductForm) {
    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const description = document.getElementById('product-description').value;

        db.collection('products').add({
            name: name,
            price: price,
            description: description
        })
        .then((docRef) => {
            console.log("Product added with ID: ", docRef.id);
            alert("Product added successfully!");
            addProductForm.reset();
        })
        .catch((error) => {
            console.error("Error adding product: ", error);
            alert("Error adding product.");
        });
    });
}

// --- Admin Panel: View Orders Logic ---

const ordersListContainer = document.getElementById('orders-list');
if (ordersListContainer) {
    db.collection('orders').get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                ordersListContainer.innerHTML = "<p>No orders found.</p>";
                return;
            }

            let ordersHTML = "";
            querySnapshot.forEach((doc) => {
                const order = doc.data();
                ordersHTML += `
                    <div class="order-card">
                        <h4>Order ID: ${doc.id}</h4>
                        <p><strong>User Email:</strong> ${order.userEmail}</p>
                        <p><strong>Total Price:</strong> Rs ${order.totalPrice.toFixed(2)}</p>
                    </div>
                `;
            });
            ordersListContainer.innerHTML = ordersHTML;
        })
        .catch((error) => {
            console.error("Error fetching orders: ", error);
            ordersListContainer.innerHTML = "<p>Error loading orders.</p>";
        });
}

// --- Home Page: Display Products Logic ---

const productListContainer = document.getElementById('product-list');
if (productListContainer) {
    db.collection('products').get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                productListContainer.innerHTML = "<p>No products available.</p>";
                return;
            }

            let productsHTML = "";
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                const productId = doc.id;
                
                // Render product card with quantity controls
                productsHTML += `
                    <div class="product-card" data-id="${productId}">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price">Rs ${product.price.toFixed(2)}</p>
                        
                        <div class="quantity-controls">
                            <button onclick="changeQuantity('${productId}', -1)">-</button>
                            <span id="quantity-${productId}">1</span>
                            <button onclick="changeQuantity('${productId}', 1)">+</button>
                        </div>

                        <button class="add-to-cart-btn" onclick="addToCartFromHome('${productId}')">Add to Cart</button>
                    </div>
                `;
            });
            productListContainer.innerHTML = productsHTML;
        })
        .catch((error) => {
            console.error("Error fetching products: ", error);
        });
}

// --- Quantity Logic (Home Page) ---

function changeQuantity(productId, amount) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    let currentQuantity = parseInt(quantityElement.innerText);
    if (currentQuantity + amount > 0) {
        currentQuantity += amount;
        quantityElement.innerText = currentQuantity;
    }
}

// --- Add to Cart from Home Page ---

function addToCartFromHome(productId) {
    if (!auth.currentUser) {
        alert("Please login to add items to your cart.");
        window.location.href = 'login.html';
        return;
    }

    const quantityElement = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityElement.innerText);

    db.collection('products').doc(productId).get().then(doc => {
        if (doc.exists) {
            const product = doc.data();
            // Retrieve existing cart from localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProductIndex = cart.findIndex(item => item.id === productId);

            if (existingProductIndex > -1) {
                cart[existingProductIndex].quantity += quantity;
            } else {
                cart.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    quantity: quantity
                });
            }

            // Save updated cart back to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            alert(`${quantity} x ${product.name} has been added to your cart.`);
            quantityElement.innerText = '1'; // Reset UI quantity to 1
        }
    }).catch(error => {
        console.error("Error getting product:", error);
    });
}

// --- Standard Add to Cart Logic (Fallback) ---

function addToCart(productId) {
    if (!auth.currentUser) {
        alert("Please login to add items to your cart.");
        window.location.href = 'login.html';
        return;
    }

    db.collection('products').doc(productId).get().then(doc => {
        if (doc.exists) {
            const product = doc.data();
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            const existingProductIndex = cart.findIndex(item => item.id === productId);

            if (existingProductIndex > -1) {
                cart[existingProductIndex].quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            alert(`${product.name} has been added to your cart.`);
        } else {
            console.error("No such product!");
        }
    }).catch(error => {
        console.error("Error getting product:", error);
    });
}

// --- Cart Page: Display Logic ---

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (!cartItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTotalElement = document.getElementById('cart-total');
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalElement.textContent = `Total: Rs 0.00`;
        return;
    }

    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Rs ${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateCartQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity('${item.id}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        `;
        total += item.price * item.quantity;
    });
    cartItemsContainer.innerHTML = itemsHTML;
    cartTotalElement.textContent = `Total: Rs ${total.toFixed(2)}`;
}

// --- Cart: Update Item Quantity ---

function updateCartQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex > -1) {
        cart[productIndex].quantity += change;
        if (cart[productIndex].quantity <= 0) {
            // Remove item if quantity drops to 0
            cart.splice(productIndex, 1);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

// --- Cart: Remove Item ---

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    displayCartItems();
}

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', displayCartItems);

// --- Place Order Logic ---

const placeOrderBtn = document.getElementById('place-order-btn');
if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
        const user = auth.currentUser;
        if (!user) {
            alert("Please login to place an order.");
            window.location.href = 'login.html';
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
        });

        // Prepare order object
        const orderDetails = {
            userId: user.uid,
            userEmail: user.email,
            items: cart,
            totalPrice: total,
            createdAt: firebase.firestore.FieldValue.serverTimestamp() // Server timestamp for sorting
        };

        db.collection('orders').add(orderDetails)
            .then(docRef => {
                console.log("Order placed with ID: ", docRef.id);
                alert("Order placed successfully!");
                localStorage.removeItem('cart'); // Clear cart after successful order
                window.location.href = 'my-orders.html';
            })
            .catch(error => {
                console.error("Error placing order: ", error);
            });
    });
}

// --- My Orders Page Logic ---

const myOrdersListContainer = document.getElementById('my-orders-list');
if (myOrdersListContainer) {
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('orders').where("userId", "==", user.uid).orderBy("createdAt", "desc").get()
                .then((querySnapshot) => {
                    if (querySnapshot.empty) {
                        myOrdersListContainer.innerHTML = "<p>You haven't placed any orders yet.</p>";
                        return;
                    }

                    let ordersHTML = "";
                    querySnapshot.forEach((doc) => {
                        const order = doc.data();
                        
                        // Format items list for display
                        let itemsList = "";
                        order.items.forEach(item => {
                            itemsList += `<p>${item.quantity} x ${item.name}</p>`;
                        });

                        ordersHTML += `
                            <div class="order-history-card">
                                <div class="order-header">
                                    <h3>Order ID: ${doc.id}</h3>
                                    <p>Total: Rs ${order.totalPrice.toFixed(2)}</p>
                                </div>
                                <div class="order-items-list">
                                    <h4>Items:</h4>
                                    ${itemsList}
                                </div>
                            </div>
                        `;
                    });
                    myOrdersListContainer.innerHTML = ordersHTML;
                })
                .catch(error => {
                    console.error("Error fetching orders: ", error);
                    myOrdersListContainer.innerHTML = "<p>Error loading your orders.</p>";
                });
        } else {
            // Prompt user to login if accessing page directly
            myOrdersListContainer.innerHTML = "<h2>Please <a href='login.html'>login</a> to see your orders.</h2>";
        }
    });
}

// --- Admin Page Protection Logic (Fixed for Flash Content) ---
if (window.location.pathname.includes('admin.html')) {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Check the user's role in the database
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        if (userData.role === 'admin') {
                            console.log('Admin access granted.');
                            // User is admin, NOW we show the page
                            document.body.style.display = 'block'; 
                        } else {
                            alert('Access Denied: You do not have admin privileges.');
                            window.location.href = 'index.html';
                        }
                    } else {
                        // No role found
                        alert('Access Denied: User profile not found.');
                        window.location.href = 'index.html';
                    }
                })
                .catch((error) => {
                    console.error("Error checking admin role:", error);
                    window.location.href = 'index.html';
                });
        } else {
            // Not logged in at all
            alert('You must be logged in as an admin to view this page.');
            window.location.href = 'login.html';
        }
    });
}