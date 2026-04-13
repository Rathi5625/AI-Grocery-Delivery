-- ============================================================
-- FreshAI Grocery — Database Schema v4
-- Uses CREATE TABLE IF NOT EXISTS (no DROP) so data persists
-- across restarts. Admin-added products are preserved.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── 1. USERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     DEFAULT NULL,
    role            ENUM('CUSTOMER','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    email_verified  BOOLEAN         NOT NULL DEFAULT FALSE,
    phone_verified  BOOLEAN         NOT NULL DEFAULT FALSE,
    profile_image   VARCHAR(500)    DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email    (email),
    INDEX idx_users_role         (role),
    INDEX idx_users_active       (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 2. CATEGORIES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    slug        VARCHAR(120)    NOT NULL,
    description TEXT            DEFAULT NULL,
    image_url   VARCHAR(500)    DEFAULT NULL,
    sort_order  INT             NOT NULL DEFAULT 0,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_slug  (slug),
    UNIQUE KEY uq_categories_name  (name),
    INDEX idx_categories_active    (is_active),
    INDEX idx_categories_sort      (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 3. ADDRESSES (needs: users) ─────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    label           VARCHAR(50)     NOT NULL DEFAULT 'Home',
    full_address    VARCHAR(500)    NOT NULL,
    city            VARCHAR(100)    NOT NULL,
    pincode         VARCHAR(10)     NOT NULL,
    is_default      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_address_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_address_user    (user_id),
    INDEX idx_address_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 4. PRODUCTS (needs: categories) ─────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                   BIGINT          NOT NULL AUTO_INCREMENT,
    name                 VARCHAR(200)    NOT NULL,
    slug                 VARCHAR(250)    NOT NULL,
    description          TEXT            DEFAULT NULL,
    price                DECIMAL(10,2)   NOT NULL,
    discount_price       DECIMAL(10,2)   DEFAULT NULL,
    unit                 VARCHAR(30)     DEFAULT NULL,
    weight               DECIMAL(8,2)    DEFAULT NULL,
    stock_quantity       INT             NOT NULL DEFAULT 0,
    image_url            VARCHAR(500)    DEFAULT NULL,
    category_id          BIGINT          DEFAULT NULL,
    sustainability_score DECIMAL(3,1)    DEFAULT NULL,
    is_organic           BOOLEAN         NOT NULL DEFAULT FALSE,
    is_featured          BOOLEAN         NOT NULL DEFAULT FALSE,
    origin               VARCHAR(100)    DEFAULT NULL,
    nutritional_info     TEXT            DEFAULT NULL,
    carbon_footprint     DECIMAL(6,2)    DEFAULT NULL,
    freshness_days       INT             DEFAULT NULL,
    is_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_products_slug (slug),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_products_category (category_id),
    INDEX idx_products_active   (is_active),
    INDEX idx_products_featured (is_featured),
    INDEX idx_products_price    (price),
    FULLTEXT INDEX ft_product_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 5a. CART (one per user) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    total_amount    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_cart_user (user_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 5b. CART_ITEMS (needs: cart, products) ──────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    cart_id     BIGINT          NOT NULL,
    product_id  BIGINT          NOT NULL,
    quantity    INT             NOT NULL DEFAULT 1,
    unit_price  DECIMAL(10,2)   NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_cart_item (cart_id, product_id),
    CONSTRAINT fk_ci_cart    FOREIGN KEY (cart_id)    REFERENCES cart(id)     ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ci_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_ci_cart (cart_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 6. ORDERS (needs: users) ────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    order_number       VARCHAR(30)   NOT NULL,
    user_id            BIGINT        NOT NULL,
    subtotal           DECIMAL(12,2) NOT NULL,
    delivery_fee       DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
    discount_amount    DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
    total_amount       DECIMAL(12,2) NOT NULL,
    status             ENUM(
                           'PENDING',
                           'CONFIRMED',
                           'PROCESSING',
                           'SHIPPED',
                           'OUT_FOR_DELIVERY',
                           'DELIVERED',
                           'CANCELLED',
                           'REFUNDED'
                       ) NOT NULL DEFAULT 'PENDING',
    payment_method     VARCHAR(30)   DEFAULT NULL,
    payment_status     ENUM('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    delivery_address   TEXT          DEFAULT NULL,
    notes              TEXT          DEFAULT NULL,
    carbon_saved       DECIMAL(8,2)  DEFAULT NULL,
    created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_order_number  (order_number),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_orders_user    (user_id),
    INDEX idx_orders_status  (status),
    INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 7. ORDER_ITEMS (needs: orders, products) ────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    order_id      BIGINT        NOT NULL,
    product_id    BIGINT        DEFAULT NULL,
    product_name  VARCHAR(200)  NOT NULL,
    product_image VARCHAR(500)  DEFAULT NULL,
    unit          VARCHAR(50)   DEFAULT NULL,
    quantity      INT           NOT NULL,
    unit_price    DECIMAL(10,2) NOT NULL,
    total_price   DECIMAL(10,2) NOT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)  REFERENCES orders(id)   ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_oi_order   (order_id),
    INDEX idx_oi_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 8. OTP_VERIFICATION (needs: users) ──────────────────────
CREATE TABLE IF NOT EXISTS otp_verification (
    otp_id        BIGINT      NOT NULL AUTO_INCREMENT,
    user_id       BIGINT      NOT NULL,
    otp_code      VARCHAR(6)  NOT NULL,
    otp_purpose   ENUM(
                      'EMAIL_VERIFY',
                      'EMAIL_CHANGE',
                      'PHONE_CHANGE',
                      'PASSWORD_CHANGE',
                      'PASSWORD_RESET'
                  ) NOT NULL,
    target_value  VARCHAR(255) DEFAULT NULL,
    expiry_time   DATETIME    NOT NULL,
    is_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
    attempt_count TINYINT     NOT NULL DEFAULT 0,
    created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (otp_id),
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_otp_user_purpose (user_id, otp_purpose),
    INDEX idx_otp_expiry       (expiry_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 9. DELIVERY_SLOTS (needs: orders) ────────────────────────
CREATE TABLE IF NOT EXISTS delivery_slots (
    id              BIGINT      NOT NULL AUTO_INCREMENT,
    order_id        BIGINT      DEFAULT NULL,
    delivery_date   DATE        NOT NULL,
    start_time      TIME        NOT NULL,
    end_time        TIME        NOT NULL,
    status          ENUM('AVAILABLE','FULL','BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
    max_orders      INT         NOT NULL DEFAULT 20,
    current_orders  INT         NOT NULL DEFAULT 0,

    PRIMARY KEY (id),
    CONSTRAINT fk_slot_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_slot_date (delivery_date),
    INDEX idx_slot_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SCHEMA v4  (CREATE IF NOT EXISTS — data safe on restart)
-- ============================================================
