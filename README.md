# Catering Reservation and Ordering System

This is a web-based portal developed for a catering service, allowing admins to manage products and users to browse the menu, place orders, and view their order history. The project is built with modern frontend technologies and is powered by Google Firebase for backend services.

---

## Features Implemented

### User (Customer) Features
- **User Authentication:** Secure user registration and login functionality.
- **Product Browsing:** View all available food items on the home page.
- **Quantity Selection:** Users can select the quantity of each item directly from the product list and in the cart.
- **Shopping Cart:** A fully functional cart where users can adjust quantities and remove items, with the total price updating in real-time.
- **Order Placement:** Logged-in users can place orders, which are saved securely to the database.
- **Order History:** A dedicated "My Orders" page where logged-in users can view a complete, detailed history of their past orders.

### Admin Features
- **Add Products:** An admin panel to add new products with a name, price, and description.
- **View All Orders:** The admin panel displays a comprehensive list of all orders placed by customers.
- **Secure Access:** The admin page is not intended for public access. For evaluation purposes, a link is provided in the navigation bar.

---

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend & Database:** Google Firebase
    - **Firestore Database:** For storing product and order information.
    - **Firebase Authentication:** For managing user accounts.

---

## How to Set Up and Run the Project

To run this project locally, follow these steps:

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/prabhmann07/catering-reservation-system.git](https://github.com/prabhmann07/catering-reservation-system.git)
    ```

2.  **Navigate to the Project Directory**
    ```bash
    cd catering-reservation-system
    ```

3.  **Set Up Firebase**
    - Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    - Create a new **Web App** within the project.
    - In the `js/main.js` file, replace the placeholder `firebaseConfig` object with your own Firebase project's credentials.
    - In the Firebase Console, enable **Email/Password Authentication** in the Authentication tab.
    - Create a **Firestore Database** and start in test mode.
    - **Important:** After your first attempt to view the "My Orders" page, you will get an error in the browser console with a link to create a required database index. Click this link to automatically create the index needed to fetch the orders correctly.

4.  **Run the Website**
    - Simply open the `index.html` file in your web browser. You can navigate to all other pages from there.

---

## Project Evaluation Notes

-   **Admin Panel:** A link to the `admin.html` page is included in the navigation bar for ease of evaluation. In a production environment, this link would be removed for security, and access would be restricted.
-   **Code Structure:** The core application logic is contained within `js/main.js`. The code is organized into sections for each feature (Authentication, Admin, Cart, etc.) for clarity and maintainability.
-   **Logging:** Key user and admin actions (e.g., login, signup, place order) are logged to the browser's developer console as required.
