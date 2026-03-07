# 🛒 FreshAI — AI-Powered Grocery Delivery Platform

> A full-stack, production-grade grocery delivery web application inspired by **Blinkit** and **Zepto**, built with a **React + Vite** frontend and a **Spring Boot** backend, powered by **MySQL**.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Database Design](#-database-design)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Default Credentials](#-default-credentials)
- [Changes & Improvements Log](#-changes--improvements-log)
- [CSS Architecture & Fixes](#-css-architecture--fixes)

---

## 🌐 Project Overview

**FreshAI** is a modern, feature-rich grocery e-commerce platform. Users can browse 200+ products across 8 categories, add items to cart, place orders, and track deliveries. The platform includes a secure JWT-based authentication system and an admin dashboard for managing products and orders.

The project was built from scratch as a learning and demonstration project, implementing real-world patterns used by industry-grade grocery apps.

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 7.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client for API calls |
| Framer Motion | 12.x | Page transition animations |
| React Hot Toast | 2.x | Toast notification system |
| React Icons | 5.x | Icon library |
| Vanilla CSS | — | Custom design system (no Tailwind) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.2.3 | Backend framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | ORM / database access layer |
| Spring Validation | 3.x | Request input validation |
| MySQL | 8.x | Relational database |
| JJWT | 0.12.5 | JWT token generation & verification |
| Lombok | Latest | Boilerplate reduction |
| Spring Boot DevTools | — | Hot reload during development |
| Maven | 3.x | Build & dependency management |

---

## 📁 Project Structure

```
AI Grocery Delivery Website/
├── backend/
│   ├── pom.xml                          # Maven build config
│   └── src/main/
│       ├── java/com/freshai/grocery/
│       │   ├── GroceryApplication.java  # Spring Boot entry point
│       │   ├── admin/                   # Admin-only controllers
│       │   ├── auth/                    # Login, Register, JWT auth
│       │   ├── cart/                    # Cart & CartItem domain
│       │   │   ├── controller/
│       │   │   ├── service/
│       │   │   ├── repository/
│       │   │   └── model/
│       │   ├── config/                  # CORS config
│       │   ├── exception/               # Global exception handlers
│       │   ├── order/                   # Order management domain
│       │   ├── product/                 # Product & Category domain
│       │   ├── security/                # JWT filter, UserDetails
│       │   └── user/                    # User model & repository
│       └── resources/
│           ├── application.properties   # DB config, JWT secret
│           └── data.sql                 # Seed data (200 products)
│
└── frontend/
    ├── index.html                       # HTML entry point
    ├── vite.config.js                   # Vite + React plugin config
    ├── package.json
    └── src/
        ├── main.jsx                     # React app bootstrap
        ├── App.jsx                      # Router + layout setup
        ├── index.css                    # Global design system (~1900 lines)
        ├── api/
        │   ├── axios.js                 # Axios instance with JWT interceptor
        │   ├── authApi.js               # Login / register endpoints
        │   ├── cartApi.js               # Cart CRUD endpoints
        │   ├── orderApi.js              # Order placement & history
        │   └── productApi.js            # Product listing & detail
        ├── context/
        │   ├── AuthContext.jsx          # Global auth state
        │   └── CartContext.jsx          # Global cart state
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx           # Top navigation bar
        │   │   └── Footer.jsx           # Site footer
        │   ├── product/
        │   │   └── ProductCard.jsx      # Reusable product card
        │   └── ui/
        │       └── SkeletonCard.jsx     # Loading placeholder card
        ├── pages/
        │   ├── HomePage.jsx             # Landing page with hero & categories
        │   ├── ProductListPage.jsx      # Browse / filter products
        │   ├── ProductDetailPage.jsx    # Single product view
        │   ├── CartPage.jsx             # Shopping cart
        │   ├── CheckoutPage.jsx         # Order placement form
        │   ├── OrderSuccessPage.jsx     # Post-order confirmation
        │   ├── LoginPage.jsx            # User login
        │   ├── RegisterPage.jsx         # User registration
        │   └── AdminDashboard.jsx       # Admin product/order management
        └── animations/                  # Framer Motion presets
```

---

## ✨ Features

### 🛍️ Shopping Experience
- **Home Page** — Hero banner, category strip, featured & deal products
- **Product Listing** — Grid view with category filtering, search, and sort
- **Product Detail** — Full product info with sustainability score, origin, and freshness data
- **Quick Add to Cart** — Hover-reveal "Add" button on product cards (Blinkit style)
- **Deal Countdown Timer** — Real-time countdown on product cards

### 🛒 Cart & Checkout
- **Persistent Cart** — Cart synced to backend per user session
- **Quantity Controls** — Increment/decrement with live total update
- **Checkout Form** — Address collection and order placement
- **Order Success Page** — Order confirmation with summary

### 🔐 Authentication
- **JWT Authentication** — Stateless, token-based auth
- **Login / Register** — Form validation with toast feedback
- **Protected Routes** — Cart, Checkout, Admin require login
- **Auto Token Injection** — Axios interceptor sends Bearer token on every request

### 🛠️ Admin Dashboard
- View and manage products
- View all orders and their statuses

### 🎨 Design System
- Custom CSS design system with CSS variables (tokens)
- Dark-mode-ready color palette
- Glassmorphism effects with `backdrop-filter`
- Micro-animations on hover, add-to-cart, and page transitions
- Skeleton loading cards (shimmer effect)
- Fully responsive layout

### 🌿 Sustainability Features
- Every product has a **sustainability score** (0–10)
- **Organic badge** for certified organic products
- **Carbon footprint** data per product
- **Eco-score ring** on product cards
- Household category focuses on eco-friendly products

---

## 🗄 Database Design

The MySQL database (`freshai_db`) contains the following main tables:

| Table | Description |
|---|---|
| `users` | Registered users with roles (`ADMIN`, `CUSTOMER`) |
| `categories` | 8 product categories (Fruits, Vegetables, Dairy, etc.) |
| `products` | 200 products with full metadata |
| `cart` | One cart per user |
| `cart_items` | Line items inside a cart |
| `orders` | Placed orders with status tracking |
| `order_items` | Line items inside an order |

### Categories (Seeded)
| ID | Name | Slug |
|---|---|---|
| 1 | Fruits | `fruits` |
| 2 | Vegetables | `vegetables` |
| 3 | Dairy | `dairy` |
| 4 | Snacks | `snacks` |
| 5 | Beverages | `beverages` |
| 6 | Frozen Foods | `frozen-foods` |
| 7 | Bakery | `bakery` |
| 8 | Household | `household` |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get all products (paginated) |
| `GET` | `/api/products/{id}` | Get single product by ID |
| `GET` | `/api/products/category/{slug}` | Filter products by category |
| `GET` | `/api/products/featured` | Get featured products |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Get current user's cart |
| `POST` | `/api/cart/items` | Add item to cart |
| `PUT` | `/api/cart/items/{id}` | Update item quantity |
| `DELETE` | `/api/cart/items/{id}` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Place a new order |
| `GET` | `/api/orders` | Get current user's order history |
| `GET` | `/api/orders/{id}` | Get order details |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/products` | List all products |
| `POST` | `/api/admin/products` | Create new product |
| `PUT` | `/api/admin/products/{id}` | Update product |
| `DELETE` | `/api/admin/products/{id}` | Delete product |
| `GET` | `/api/admin/orders` | List all orders |

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+** (JDK, not JRE)
- **Maven 3.6+**
- **Node.js 18+** and **npm**
- **MySQL 8.x** running locally
- A MySQL database named `freshai_db`

---

### Backend Setup

1. **Create the database** in MySQL:
   ```sql
   CREATE DATABASE freshai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Configure credentials** in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/freshai_db
   spring.datasource.username=YOUR_MYSQL_USER
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
   spring.sql.init.mode=always
   ```

3. **Run the backend**:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```
   The backend starts on **http://localhost:8080**

   > On first run, Spring Boot creates all tables via JPA and seeds the database from `data.sql` (200 products + 8 categories + 2 users).

---

### Frontend Setup

1. **Install dependencies**:
   ```powershell
   cd frontend
   npm install
   ```

2. **Start the dev server**:
   ```powershell
   npm run dev
   ```
   The frontend starts on **http://localhost:5173**

3. **Build for production**:
   ```powershell
   npm run build
   ```

---

## 🔑 Default Credentials

These accounts are seeded automatically on first backend run:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@freshai.com` | `admin123` |
| Customer | `customer@freshai.com` | `customer123` |

---

## 📝 Changes & Improvements Log

This section documents the key decisions made and problems solved throughout the development of this project.

---

### 1. 🏗️ Project Scaffolding

**What was done:**
- Initialized the frontend using **Vite + React** (`npx create-vite`) for fast HMR and modern ES module support
- Initialized the backend as a **Spring Boot 3.2.3** Maven project with Web, JPA, Security, and Validation starters
- Configured MySQL as the database (over H2) for production-realistic data persistence
- Set up CORS configuration in the backend to allow `http://localhost:5173` (Vite's default port) to communicate with the Spring Boot API at `8080`

---

### 2. 🔐 JWT Authentication Implementation

**What was done:**
- Integrated **JJWT 0.12.5** for token generation and parsing
- Built a `JwtFilter` (a `OncePerRequestFilter`) that intercepts every HTTP request, reads the `Authorization: Bearer <token>` header, validates the JWT, and sets the `SecurityContext`
- Created `/api/auth/login` and `/api/auth/register` endpoints as public (no auth required)
- All other `/api/**` routes are protected and require a valid JWT
- Frontend stores the JWT in **localStorage** and injects it via an **Axios interceptor** on every outgoing request

---

### 3. 🛒 Cart Architecture

**What was done:**
- Designed a persistent server-side cart model: each `User` has one `Cart`, and each `Cart` has many `CartItems`
- `CartItemRepository` and `CartRepository` both extend `JpaRepository` for standard CRUD
- The `CartContext.jsx` in the frontend wraps the app and provides `addToCart`, `removeFromCart`, `updateQuantity`, and `clearCart` globally
- When a user logs out, the cart context is cleared from the frontend state (the server-side cart persists for next login)

---

### 4. 🧱 Product & Category Domain

**What was done:**
- `Product` entity has 17 fields including `sustainabilityScore`, `isOrganic`, `isFeatured`, `origin`, `carbonFootprint`, and `freshnessDays` to power the eco-focused UI
- `Category` entity has `slug`, `sortOrder`, and `imageUrl` for frontend-driven navigation
- Spring Data JPA automatically derives query methods (e.g., `findByCategorySlug`, `findByIsFeaturedTrue`)

---

### 5. 📦 Seed Data Generation (200 Products)

**What was done:**
- Manually crafted 200 realistic grocery products across 8 categories using `INSERT IGNORE INTO` statements in `data.sql`
- Used real Indian product names and origins (e.g., Ratnagiri Alphonso mangoes, Nagpur oranges, Nashik grapes, Kerala coconuts)
- Each product includes Unsplash image URLs for realistic UI rendering
- Used `INSERT IGNORE` to prevent duplicate-key errors on repeated server restarts (idempotent seeding)
- Seeded 2 default users (admin + customer) with BCrypt-hashed passwords

---

### 6. 🎨 Frontend Design System (index.css)

**What was done:**
- Built a comprehensive ~1900-line CSS design system using **CSS custom properties (variables)** — no Tailwind
- Design tokens defined in `:root` for colors, spacing, typography, shadows, border-radius, and animations
- Implemented a **glassmorphism hero eyebrow** pill using `backdrop-filter: blur()`
- Built a **shimmer skeleton loader** using `@keyframes shimmer` and `background-size: 200%` animation
- Implemented **smooth page transitions** using Framer Motion's `AnimatePresence`
- All interactive elements (buttons, cards, chips) have hover micro-animations via `transform` and `box-shadow` transitions

---

### 7. 📱 Responsive Layout

**What was done:**
- Used CSS Grid with `repeat(auto-fill, minmax(..., 1fr))` for the product grid — automatically reflows for all screen sizes
- Sticky top navbar with `position: fixed` and CSS variable `--nav-h` used as `margin-top` on page content to prevent content being hidden behind the nav
- Category strip uses horizontal scroll with `overflow-x: auto` and hidden scrollbar for mobile UX

---

### 8. ✅ Page Routing

**What was done:**
- Set up `react-router-dom v7` with an `AnimatedRoutes` component that wraps all routes in `AnimatePresence` for smooth enter/exit transitions
- Implemented an `AppLayout` wrapper component that conditionally renders the `Navbar` and `Footer` (login/register pages have no nav/footer)
- Admin dashboard route (`/admin`) renders without footer for a cleaner dashboard feel

---

## 🎨 CSS Architecture & Fixes

### CSS Browser Compatibility Fixes Applied

#### 1. `backdrop-filter` — Safari Support
The glassmorphism blur effect on the hero eyebrow pill and deal banner time blocks required a **`-webkit-backdrop-filter`** prefix for Safari 9–14 compatibility:

```css
/* BEFORE (Safari broke) */
backdrop-filter: blur(8px);

/* AFTER (fixed) */
-webkit-backdrop-filter: blur(8px);  /* Safari 9+ */
backdrop-filter: blur(8px);          /* Chrome, Firefox, Edge */
```

#### 2. `scrollbar-width: none` — Cross-browser Scrollbar Hiding
The horizontal category strip needed scrollbars hidden. Used a three-part approach:

```css
.category-strip {
  scrollbar-width: none;         /* Firefox & Chrome 121+ */
  -ms-overflow-style: none;      /* IE/Edge legacy */
}
.category-strip::-webkit-scrollbar {
  display: none;                 /* Safari, Chrome < 121, Samsung Internet */
}
```

#### 3. `line-clamp` — Standard + Vendor Prefix
Product card names are clamped to 2 lines. Added the standard `line-clamp` property alongside the vendor-prefixed version as required by the CSS spec:

```css
.product-card__name {
  display: -webkit-box;
  -webkit-line-clamp: 2;   /* WebKit browsers (Chrome, Safari) */
  line-clamp: 2;           /* Standard property for future compatibility */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 🔮 Future Improvements (Ideas)

- [ ] AI-powered product recommendations based on order history
- [ ] Real-time order tracking with WebSockets
- [ ] Payment gateway integration (Razorpay / Stripe)
- [ ] Push notifications for order status changes
- [ ] Search with fuzzy matching (Elasticsearch or Meilisearch)
- [ ] PWA support for mobile installation
- [ ] Docker Compose setup for one-command local environment spin-up
- [ ] Unit & integration test coverage (JUnit 5 + Mockito for backend, Vitest for frontend)

---

## 👨‍💻 Author

**Parth** — FreshAI Grocery Delivery Website  
Built with ❤️ using Spring Boot & React · March 2026
