-- ============================================================
-- FreshAI Grocery  —  Seed Data (safe bootstrap)
-- Uses INSERT IGNORE so rows are only inserted on first run.
-- Admin-added products are NEVER wiped on restart.
-- ============================================================

-- ── Categories (INSERT IGNORE = skip if slug already exists) ─
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

-- ── Seed Products (INSERT IGNORE = skipped if slug already exists)
INSERT IGNORE INTO products (name, slug, description, price, discount_price, unit, stock_quantity, image_url, category_id, sustainability_score, is_organic, is_featured, origin, carbon_footprint, freshness_days, is_active, created_at, updated_at) VALUES

-- FRUITS
('Amul Kesar Mango 1kg',       'amul-kesar-mango-1kg',        'Sweet Kesar mangoes sourced from Saurashtra, Gujarat.',        85.00,  75.00, '1 kg',   120, 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=400&q=80', 1, 8.2, false, true,  'Gujarat, India',   0.3, 5,  true, NOW(), NOW()),
('Sunfresh Banana Dozen',      'sunfresh-banana-dozen',       'Hand-picked ripe bananas, farm-fresh from Karnataka.',          35.00,  NULL,  '12 pcs', 200, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', 1, 8.5, false, false, 'Karnataka, India', 0.2, 7,  true, NOW(), NOW()),
('Royal Gala Apple 6pcs',      'royal-gala-apple-6pcs',       'Crunchy Royal Gala apples imported from Himachal Pradesh.',    120.00, 105.00,'6 pcs',   90, 'https://images.unsplash.com/photo-1560806887-1e4cd0b9faa6?w=400&q=80', 1, 7.9, false, true,  'Himachal Pradesh', 0.5, 14, true, NOW(), NOW()),
('Fresho Strawberry 200g',     'fresho-strawberry-200g',      'Fresh red strawberries, perfect for desserts and smoothies.',   80.00,  NULL,  '200 g',   60, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80', 1, 8.0, true,  false, 'Maharashtra',      0.4, 4,  true, NOW(), NOW()),
('Dryfruit King Kiwi 4pcs',   'dryfruit-king-kiwi-4pcs',    'Imported New-Zealand kiwis, rich in Vitamin C.',                95.00,  85.00, '4 pcs',   70, 'https://images.unsplash.com/photo-1615485925763-86056f549cdb?w=400&q=80', 1, 7.5, false, false, 'New Zealand',      0.9, 10, true, NOW(), NOW()),
('HappyFresh Papaya 1kg',     'happyfresh-papaya-1kg',       'Ripe golden papaya — great for digestion.',                    50.00,  NULL,  '1 kg',   150, 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&q=80', 1, 8.1, false, false, 'Tamil Nadu',       0.3, 5,  true, NOW(), NOW()),
('Organic Watermelon Whole',  'organic-watermelon-whole',    'Chilled organic watermelon, seedless variety.',                 60.00,  55.00, 'Per Pc',  40, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80', 1, 9.0, true,  true,  'Rajasthan',        0.2, 7,  true, NOW(), NOW()),
('Premium Grapes 500g',       'premium-grapes-500g',         'Seedless green grapes from Nashik vineyards.',                  90.00,  80.00, '500 g',   80, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80', 1, 8.3, false, false, 'Nashik',           0.3, 5,  true, NOW(), NOW()),

-- VEGETABLES
('Fresho Tomato 1kg',          'fresho-tomato-1kg',           'Farm-fresh red tomatoes from local Pune farms.',                30.00,  NULL,  '1 kg',   300, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', 2, 8.5, false, false, 'Pune',             0.2, 7,  true, NOW(), NOW()),
('HarvestFresh Spinach 250g', 'harvestfresh-spinach-250g',   'Washed baby spinach leaves, chef''s quality.',                  25.00,  NULL,  '250 g',  180, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', 2, 9.2, true,  false, 'Ooty',             0.1, 4,  true, NOW(), NOW()),
('Fresho Broccoli 500g',      'fresho-broccoli-500g',        'Crisp green broccoli, high in fibre and vitamins.',             65.00,  60.00, '500 g',  100, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', 2, 9.0, false, true,  'Ooty',             0.2, 5,  true, NOW(), NOW()),
('Taza Potato 2kg',           'taza-potato-2kg',              'Clean, washed potatoes — perfect for everyday cooking.',        40.00,  NULL,  '2 kg',   400, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80', 2, 7.5, false, false, 'UP',               0.2, 30, true, NOW(), NOW()),
('RawBasket Onion 1kg',       'rawbasket-onion-1kg',          'Medium-sized red onions sourced directly from farmers.',        25.00,  NULL,  '1 kg',   500, 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400&q=80', 2, 7.8, false, false, 'Nashik',           0.1, 30, true, NOW(), NOW()),
('Organic Carrot 500g',       'organic-carrot-500g',          'Organic orange carrots, sweet and crunchy.',                    55.00,  48.00, '500 g',  120, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80', 2, 9.5, true,  false, 'Gujarat',          0.1, 14, true, NOW(), NOW()),
('Fresh Capsicum 250g',       'fresh-capsicum-250g',          'Colourful bell peppers (red, yellow, green mix).',              45.00,  NULL,  '250 g',   90, 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400&q=80', 2, 8.0, false, false, 'Karnataka',        0.2, 7,  true, NOW(), NOW()),

-- DAIRY
('Amul Gold Full Cream Milk 1L','amul-gold-full-cream-milk-1l','Amul Gold full cream milk with 6% fat content.',               68.00,  NULL,  '1 L',    500, 'https://images.unsplash.com/photo-1550583724599-7226db78e17b?w=400&q=80', 3, 7.0, false, true,  'Gujarat',          0.5, 2,  true, NOW(), NOW()),
('Mother Dairy Curd 400g',    'mother-dairy-curd-400g',       'Thick set curd — smooth, creamy and probiotic-rich.',           38.00,  NULL,  '400 g',  350, 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&q=80', 3, 7.2, false, false, 'Delhi',            0.3, 5,  true, NOW(), NOW()),
('Amul Butter 500g',          'amul-butter-500g',             'Pasteurised butter with no artificial colours or flavours.',   250.00, 235.00,'500 g',   150, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80', 3, 6.8, false, true,  'Gujarat',          0.6, 45, true, NOW(), NOW()),
('Britannia Cheese Slices 200g','britannia-cheese-slices-200g','Rich cheddar processed cheese, perfect for sandwiches.',      125.00, NULL,  '200 g',   200, 'https://images.unsplash.com/photo-1589993842083-8b4e5a45b8f9?w=400&q=80', 3, 6.5, false, false, 'Punjab',           0.7, 90, true, NOW(), NOW()),
('Nestle Milkmaid 400g',      'nestle-milkmaid-400g',         'Sweetened condensed milk — great for desserts and upma.',       95.00,  90.00, '400 g',  180, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80', 3, 6.0, false, false, 'Haryana',          0.5, 365,true, NOW(), NOW()),
('Amul Paneer 200g',          'amul-paneer-200g',             'Soft and fresh cottage cheese — ideal for curries and tikka.',  85.00,  NULL,  '200 g',  250, 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400&q=80', 3, 7.5, false, false, 'Gujarat',          0.4, 7,  true, NOW(), NOW()),

-- SNACKS
('Lay''s Classic Salted 52g',  'lays-classic-salted-52g',     'The original Lay''s potato crisps — light, crispy and salted.',  20.00,  NULL,  '52 g',   600, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', 4, 4.0, false, false, 'India',            0.8, 180,true, NOW(), NOW()),
('Haldiram''s Bhujia 200g',    'haldirams-bhujia-200g',        'Classic Haldiram''s sev bhujia — the all-time favourite snack.',  60.00,  55.00, '200 g',  400, 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&q=80', 4, 4.5, false, true,  'India',            0.6, 120,true, NOW(), NOW()),
('Pringles Original 134g',    'pringles-original-134g',       'Stacked potato crisps in the iconic Pringles can.',            175.00, 160.00,'134 g',  250, 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&q=80', 4, 3.5, false, false, 'USA',              1.2, 180,true, NOW(), NOW()),
('Kurkure Masala Munch 90g',  'kurkure-masala-munch-90g',    'Crunchy corn puff with a tangy masala twist.',                  30.00,  NULL,  '90 g',   500, 'https://images.unsplash.com/photo-1562889958-ef463f5fa0f6?w=400&q=80', 4, 3.8, false, false, 'India',            0.7, 150,true, NOW(), NOW()),
('Doritos Nacho Cheese 70g',  'doritos-nacho-cheese-70g',    'Bold nacho cheese flavoured tortilla chips.',                   80.00,  NULL,  '70 g',   300, 'https://images.unsplash.com/photo-1600699145669-b4eb0e7f6dc6?w=400&q=80', 4, 3.5, false, false, 'India',            0.9, 180,true, NOW(), NOW()),
('Bingo Mad Angles 90g',      'bingo-mad-angles-90g',        'Triangular corn snack with spicy achaari mast flavour.',        30.00,  NULL,  '90 g',   450, 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80', 4, 3.9, false, false, 'India',            0.6, 150,true, NOW(), NOW()),

-- BEVERAGES
('Coca-Cola Can 330ml',        'coca-cola-can-330ml',         'The classic Coca-Cola in a 330ml can.',                         40.00,  NULL,  '330 ml', 800, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80', 5, 3.0, false, false, 'India',            0.5, 365,true, NOW(), NOW()),
('Tropicana Orange Juice 1L', 'tropicana-orange-juice-1l',   '100% pure squeezed orange juice, no added sugar.',             120.00, 110.00,'1 L',    300, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80', 5, 6.0, false, true,  'India',            0.4, 30, true, NOW(), NOW()),
('Maaza Mango Drink 600ml',   'maaza-mango-drink-600ml',     'Refreshing Maaza mango drink — sweet and tangy.',               35.00,  NULL,  '600 ml', 500, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80', 5, 4.0, false, false, 'India',            0.3, 180,true, NOW(), NOW()),
('Real Guava Juice 1L',       'real-guava-juice-1l',         'Guava nectar with a rich and tropical flavour.',                90.00,  80.00, '1 L',    250, 'https://images.unsplash.com/photo-1560508179-b2c9a3555b80?w=400&q=80', 5, 5.5, false, false, 'India',            0.3, 30, true, NOW(), NOW()),
('Bisleri Mineral Water 1L',  'bisleri-mineral-water-1l',    'Purified mineral water, safe and refreshing.',                  20.00,  NULL,  '1 L',    1000,'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80', 5, 6.5, false, false, 'India',            0.2, 365,true, NOW(), NOW()),
('Sprite Pet Bottle 750ml',   'sprite-pet-bottle-750ml',     'Lime and lemon flavoured carbonated drink.',                    40.00,  NULL,  '750 ml', 600, 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80', 5, 3.0, false, false, 'India',            0.4, 365,true, NOW(), NOW()),

-- BAKERY
('Britannia Whole Wheat Bread','britannia-whole-wheat-bread', '100% whole wheat bread, baked fresh, no maida.',               45.00,  40.00, '400 g',  300, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', 6, 7.0, false, true,  'India',            0.4, 7,  true, NOW(), NOW()),
('English Oven Multigrain Buns','english-oven-multigrain-buns','Soft multigrain burger buns with oats topping.',             55.00,  NULL,  '6 pcs',  150, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80', 6, 7.5, false, false, 'India',            0.3, 5,  true, NOW(), NOW()),
('Pillsbury Chocolate Muffins','pillsbury-chocolate-muffins', 'Soft and moist chocolate muffins, oven-fresh.',               120.00, 110.00,'6 pcs',  100, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80', 6, 5.5, false, false, 'India',            0.5, 5,  true, NOW(), NOW()),
('Modern Sandwich Bread 400g','modern-sandwich-bread-400g', 'Soft sandwich bread with a light fluffy texture.',               38.00,  NULL,  '400 g',  250, 'https://images.unsplash.com/photo-1584767519722-8ee290e4b875?w=400&q=80', 6, 6.5, false, false, 'India',            0.3, 7,  true, NOW(), NOW()),

-- FROZEN FOODS
('McCain French Fries 420g',  'mccain-french-fries-420g',    'Crispy straight-cut potato fries — ready in 15 minutes.',      160.00, 145.00,'420 g',  200, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80', 7, 4.0, false, true,  'India',            0.8, 365,true, NOW(), NOW()),
('Kwality Walls Cornetto 120ml','kwality-walls-cornetto-120ml','Vanilla ice cream cone with chocolate flakes.',               60.00,  NULL,  '120 ml', 300, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', 7, 3.5, false, false, 'India',            0.6, 365,true, NOW(), NOW()),
('ITC Master Chef Veg Momos 400g','itc-master-chef-veg-momos-400g','Steamed vegetable momos — ready to heat and eat.',       120.00, 110.00,'400 g',  150, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', 7, 4.5, false, false, 'India',            0.7, 180,true, NOW(), NOW()),

-- PERSONAL CARE
('Dove Moisturising Bar 100g','dove-moisturising-bar-100g',  'Dove bar soap with 1/4 moisturising cream.',                   65.00,  58.00, '100 g',  400, 'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=400&q=80', 8, 6.5, false, true,  'India',            0.4, 730,true, NOW(), NOW()),
('Pantene Silky Smooth Shampoo 340ml','pantene-silky-smooth-shampoo-340ml','Anti-breakage shampoo for silky, smooth hair.', 265.00, 240.00,'340 ml', 200, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80', 8, 6.0, false, false, 'India',            0.7, 730,true, NOW(), NOW()),
('Colgate Strong Teeth 200g', 'colgate-strong-teeth-200g',   'Colgate toothpaste with calcium boost for strong enamel.',      80.00,  NULL,  '200 g',  500, 'https://images.unsplash.com/photo-1559588282-e0b9cb3db1a3?w=400&q=80', 8, 6.2, false, false, 'India',            0.5, 730,true, NOW(), NOW()),
('Nivea Soft Moisturiser 100ml','nivea-soft-moisturiser-100ml','Lightweight moisturiser with Vitamin E and Jojoba Oil.',     160.00, 140.00,'100 ml', 300, 'https://images.unsplash.com/photo-1609357605129-74f0b6c82197?w=400&q=80', 8, 6.8, false, false, 'Germany',          0.6, 730,true, NOW(), NOW()),
('Dettol Original Handwash 250ml','dettol-original-handwash-250ml','Antibacterial handwash protecting against 100 germs.',  95.00,  85.00, '250 ml', 450, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', 8, 6.0, false, true,  'India',            0.6, 730,true, NOW(), NOW()),

-- HOUSEHOLD
('Surf Excel Matic Liquid 1L','surf-excel-matic-liquid-1l',  'Front-load washing machine liquid detergent.',                 330.00, 310.00,'1 L',    300, 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400&q=80', 9, 5.0, false, true,  'India',            0.9, 730,true, NOW(), NOW()),
('Vim Dishwash Bar 300g',     'vim-dishwash-bar-300g',        'Effective grease-fighter dishwash bar.',                        32.00,  NULL,  '300 g',  600, 'https://images.unsplash.com/photo-1585906233543-9ba4470cd1a1?w=400&q=80', 9, 5.5, false, false, 'India',            0.4, 730,true, NOW(), NOW()),
('Harpic Power Plus 1L',     'harpic-power-plus-1l',         '10x cleaning power toilet cleaner — kills 99.9% germs.',      135.00, 120.00,'1 L',    350, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80', 9, 4.0, false, false, 'India',            0.8, 730,true, NOW(), NOW()),
('Lizol Floor Cleaner 1L',   'lizol-floor-cleaner-1l',       'Kills 99.9% germs on floors — pine fragrance.',               175.00, 160.00,'1 L',    280, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80', 9, 4.5, false, false, 'India',            0.7, 730,true, NOW(), NOW()),
('Ariel Matic Top Load 1kg', 'ariel-matic-top-load-1kg',    'Superior cleaning detergent for top-load machines.',           340.00, 315.00,'1 kg',   200, 'https://images.unsplash.com/photo-1583863788434-e58a8a9d3a5b?w=400&q=80', 9, 4.8, false, false, 'India',            0.9, 730,true, NOW(), NOW());

-- ── Default Admin + Customer Users (INSERT IGNORE = never overwrite existing) ──
INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, email_verified, phone_verified, created_at, updated_at)
VALUES
 (1, 'admin@freshai.com',    '$2a$10$j9KQzmajPcXtae099COc.uYhsP44jGHk89hKQJoB5nnaaMfDuox0y', 'Admin',   'FreshAI',  '+919876543210', 'ADMIN',    true, true,  false, NOW(), NOW()),
 (2, 'customer@freshai.com', '$2a$10$j9KQzmajPcXtae099COc.uYhsP44jGHk89hKQJoB5nnaaMfDuox0y', 'Test',    'Customer', '+919876543211', 'CUSTOMER', true, false, false, NOW(), NOW());
