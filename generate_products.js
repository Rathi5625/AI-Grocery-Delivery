const fs = require('fs');

const categories = [
  { id: 1, name: 'Fruits', slug: 'fruits', desc: 'Fresh seasonal fruits sourced from local farms' },
  { id: 2, name: 'Vegetables', slug: 'vegetables', desc: 'Farm-fresh vegetables picked daily' },
  { id: 3, name: 'Dairy', slug: 'dairy', desc: 'Fresh dairy products and free-range eggs' },
  { id: 4, name: 'Snacks', slug: 'snacks', desc: 'Healthy snacks and delicious treats' },
  { id: 5, name: 'Beverages', slug: 'beverages', desc: 'Juices, smoothies, milk alternatives and more' },
  { id: 6, name: 'Frozen Foods', slug: 'frozen-foods', desc: 'Frozen meals, vegetables and desserts' },
  { id: 7, name: 'Bakery', slug: 'bakery', desc: 'Freshly baked breads, pastries and cakes' },
  { id: 8, name: 'Personal Care', slug: 'personal-care', desc: 'Personal hygiene and grooming products' },
  { id: 9, name: 'Household Items', slug: 'household', desc: 'Essential household and cleaning supplies' }
];

const adjectives = ['Organic', 'Fresh', 'Premium', 'Classic', 'Natural', 'Artisan', 'Gourmet', 'Healthy', 'Farm', 'Pure'];
const sizes = ['Pack of 2', '1 kg', '500g', 'Per Piece', '1 Liter', '250g', 'Pack of 6', 'Box', '200ml', 'Large'];

const bases = {
  1: ['Apple', 'Banana', 'Orange', 'Mango', 'Grape', 'Strawberry', 'Blueberry', 'Pineapple', 'Watermelon', 'Kiwi', 'Peach', 'Plum', 'Pear', 'Cherry', 'Papaya'],
  2: ['Carrot', 'Potato', 'Tomato', 'Onion', 'Garlic', 'Spinach', 'Broccoli', 'Cucumber', 'Bell Pepper', 'Lettuce', 'Cabbage', 'Cauliflower', 'Mushroom', 'Zucchini', 'Pumpkin'],
  3: ['Milk', 'Cheese', 'Butter', 'Yogurt', 'Cream', 'Paneer', 'Ghee', 'Cheddar', 'Mozzarella', 'Curd', 'Buttermilk', 'Whipping Cream', 'Sour Cream', 'Cottage Cheese', 'Goat Cheese'],
  4: ['Chips', 'Almonds', 'Cashews', 'Popcorn', 'Pretzels', 'Cookies', 'Crackers', 'Trail Mix', 'Nachos', 'Peanuts', 'Walnuts', 'Pistachios', 'Granola Bar', 'Protein Bar', 'Makhana'],
  5: ['Water', 'Orange Juice', 'Apple Juice', 'Coffee', 'Tea', 'Green Tea', 'Soda', 'Lemonade', 'Smoothie', 'Coconut Water', 'Kombucha', 'Cold Brew', 'Energy Drink', 'Soy Milk', 'Almond Milk'],
  6: ['Ice Cream', 'Frozen Peas', 'Frozen Pizza', 'Frozen Corn', 'Frozen Berries', 'Veggie Burger Patties', 'Frozen Waffles', 'Frozen Paratha', 'Frozen Samosa', 'Chicken Momos', 'Spring Rolls', 'Frozen Spinach', 'Fish Fingers', 'Gelato', 'French Fries'],
  7: ['Bread', 'Croissant', 'Muffin', 'Buns', 'Bagel', 'Pita', 'Focaccia', 'Sourdough', 'Brownie', 'Cookies', 'Cake', 'Tart', 'Pastry', 'Rolls', 'Baguette'],
  8: ['Shampoo', 'Conditioner', 'Body Wash', 'Toothpaste', 'Soap', 'Lotion', 'Deodorant', 'Face Wash', 'Hand Wash', 'Sanitizer', 'Hair Gel', 'Sunscreen', 'Moisturizer', 'Shaving Cream', 'Lip Balm'],
  9: ['Detergent', 'Dish Soap', 'Paper Towels', 'Trash Bags', 'All-Purpose Cleaner', 'Toilet Cleaner', 'Glass Cleaner', 'Sponges', 'Tissue', 'Fabric Softener', 'Floor Cleaner', 'Air Freshener', 'Disinfectant Wipes', 'Bleach', 'Broom']
};

// Robust pool of real Unsplash images that NEVER rate-limit or fail
const unsplashIds = {
    1: ['1582914101869-2ba87e7481ab', '1519996529932-0d5b741006fc', '1528825871115-3581a5387919', '1610832958506-aa56368176cf', '1560806887-1e4cd0b9faa6', '1601493700631-2b16ec4b4716', '1614856019623-e009405cdeae'],
    2: ['1540420773440-3b682b4dc201', '1592417817098-8fd3d9eb14a5', '1566842600175-97d257940f89', '1585829156637-2908f51a4cf1', '1591157140417-74070aeda409', '1550411294-f254f3fdc329', '1588643801833-2ba62b9f3902'],
    3: ['1550583724599-7226db78e17b', '1563630650-141a0bd3d917', '1528750868425-67cae884ec81', '1600799793361-b93081e6def0', '1628043694071-70bfbdc7c05b', '1633519896472-feec6640d9b4'],
    4: ['1573210433230-0ee33077afab', '1599599842594-73dc91d3dd4b', '1521151610996-511bb7473a21', '1560285514-996ffcc8d80f', '1600570535940-02a81831c260'],
    5: ['1513558161293-cdaf765ed2fd', '1497935586351-b67a49e012bf', '1544155104-e0c242a49887', '1556881286-fc6915169721', '1522747124355-14f7b6b15e45'],
    6: ['1541807353986-caab4509426f', '1556630800-4b2a88480db8', '1615486511484-92e172fc34ea', '1622312693822-7717d95b5e13'],
    7: ['1509440159596-0249088772ff', '1541167760496-1628856abf58', '1578922749441-df13baba92cd', '1608198093003-75b2255d6118'],
    8: ['1556228578-0d85b1a4d571', '1596755589606-d0a187e14f09', '1590159765795-ae0fa9c6fa74'],
    9: ['1585906233543-9ba4470cd1a1', '1584824326500-1110b642e128', '1584620600115-46fd1fa7ceef']
};

let products = [];
let idCounter = 1;

for (let cat of categories) {
    for (let i = 0; i < 115; i++) { // ~1035 products total
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const base = bases[cat.id][Math.floor(Math.random() * bases[cat.id].length)];
        const variant = idCounter;
        const name = `${adj} ${base} Variant ${variant}`;
        const slug = name.toLowerCase().replace(/ /g, '-');
        const price = (Math.random() * 20 + 1).toFixed(2);
        const stock = Math.floor(Math.random() * 300 + 10);
        const unit = sizes[Math.floor(Math.random() * sizes.length)];
        
        const idPool = unsplashIds[cat.id];
        const selectedId = idPool[variant % idPool.length];
        
        // Using "v" param to guarantee completely unique URLs for all 1000 products!
        const imageUrl = `https://images.unsplash.com/photo-${selectedId}?w=400&q=80&v=${variant}`;

        products.push(`(${idCounter}, '${name.replace(/'/g, "''")}', '${slug}', 'High quality ${name.replace(/'/g, "''")} from the ${cat.name} category.', ${price}, NULL, '${unit}', ${stock}, '${imageUrl}', ${cat.id}, 8.0, false, false, 'Local', 1.0, 5, true)`);
        idCounter++;
    }
}

let sql = `
-- ============================================================
-- FreshAI Grocery — FULL HARD RESET (1000+ Products)
-- ============================================================

DELETE FROM products;
DELETE FROM categories;

INSERT INTO categories (id, name, slug, description, image_url, sort_order, is_active) VALUES
${categories.map(c => `(${c.id}, '${c.name}', '${c.slug}', '${c.desc.replace(/'/g, "''")}', 'https://images.unsplash.com/photo-${unsplashIds[c.id][0]}?w=400&q=80&cat=${c.id}', ${c.id}, true)`).join(',\n')};

INSERT INTO products (id, name, slug, description, price, discount_price, unit, stock_quantity, image_url, category_id, sustainability_score, is_organic, is_featured, origin, carbon_footprint, freshness_days, is_active) VALUES
`;

sql += products.join(',\n') + ';\n';

fs.writeFileSync('backend/src/main/resources/data.sql', sql);
console.log('Successfully generated backend/src/main/resources/data.sql with ' + products.length + ' products.');
