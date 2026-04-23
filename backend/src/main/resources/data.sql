-- ============================================================
-- FreshAI Grocery  -  Seed Data (safe bootstrap)
-- Uses INSERT IGNORE so rows are only inserted on first run.
-- Admin-added products are NEVER wiped on restart.
-- ============================================================

-- -- Categories (INSERT IGNORE = skip if slug already exists) --
INSERT IGNORE INTO categories (id, name, slug, description, image_url, sort_order, is_active, created_at, updated_at) VALUES
(1,  'Fruits',         'fruits',           'Fresh seasonal fruits sourced from local farms',         'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80', 1,  true, NOW(), NOW()),
(2,  'Vegetables',     'vegetables',       'Farm-fresh vegetables picked daily',                     'https://images.unsplash.com/photo-1540420773440-3b682b4dc201?w=600&q=80', 2,  true, NOW(), NOW()),
(3,  'Dairy',          'dairy',            'Fresh dairy products and free-range eggs',               'https://images.unsplash.com/photo-1550583724599-7226db78e17b?w=600&q=80', 3,  true, NOW(), NOW()),
(4,  'Snacks',         'snacks',           'Healthy snacks and delicious treats',                    'https://images.unsplash.com/photo-1573210433230-0ee33077afab?w=600&q=80', 4,  true, NOW(), NOW()),
(5,  'Beverages',      'beverages',        'Juices, soft drinks, water and more',                    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80', 5,  true, NOW(), NOW()),
(6,  'Bakery',         'bakery',           'Freshly baked breads, pastries and cakes',               'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', 6,  true, NOW(), NOW()),
(7,  'Frozen Foods',   'frozen-foods',     'Frozen meals, vegetables and desserts',                  'https://images.unsplash.com/photo-1541807353986-caab4509426f?w=600&q=80', 7,  true, NOW(), NOW()),
(8,  'Personal Care',  'personal-care',    'Personal hygiene and grooming products',                 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', 8,  true, NOW(), NOW()),
(9,  'Household',      'household',        'Essential household and cleaning supplies',              'https://images.unsplash.com/photo-1585906233543-9ba4470cd1a1?w=600&q=80', 9,  true, NOW(), NOW());

-- -- Default Admin Users (INSERT IGNORE = never overwrite existing) --
INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, email_verified, phone_verified, created_at, updated_at)
VALUES
 (1, 'masteradmin@freshai.com',    '$2a$10$uCBZJ46LWPB6KeTWTbRdG.cj5NcBWRvk4PYoDIOYPbJ8Wm6R6F9Hi', 'Master',   'Admin',  '+919876543210', 'ADMIN',    true, true,  true, NOW(), NOW());
