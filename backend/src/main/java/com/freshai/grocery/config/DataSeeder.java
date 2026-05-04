package com.freshai.grocery.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Check if the high-quality organic avocado exists
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM products WHERE slug = 'organic-hass-avocados'", Integer.class);

        if (count != null && count == 0) {
            System.out.println("🌱 SEEDING HIGH QUALITY PRODUCTS...");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0;");
            jdbcTemplate.execute("TRUNCATE TABLE order_items;");
            jdbcTemplate.execute("TRUNCATE TABLE cart_items;");
            jdbcTemplate.execute("TRUNCATE TABLE products;");
            
            String insertProducts = "INSERT INTO products (" +
                    "name, slug, description, price, discount_price, unit, weight, stock_quantity, " +
                    "image_url, category_id, sustainability_score, is_organic, is_featured, origin, " +
                    "nutritional_info, carbon_footprint, freshness_days, is_active, created_at, updated_at" +
                    ") VALUES " +
                    "('Organic Hass Avocados', 'organic-hass-avocados', 'Creamy, perfectly ripe organic Hass avocados sourced directly from sustainable farms in Mexico. Perfect for guacamole, toast, or salads.', 6.99, 5.99, 'pack', 4.00, 150, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80', 1, 9.2, true, true, 'Mexico', 'Calories: 240, Fat: 22g, Carbs: 12g, Protein: 3g', 1.2, 5, true, NOW(), NOW()), " +
                    "('Fresh Sweet Strawberries', 'fresh-sweet-strawberries', 'Plump, juicy, and naturally sweet red strawberries. Hand-picked at peak ripeness for the best flavor.', 4.49, NULL, 'box', 1.00, 80, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80', 1, 8.5, false, true, 'California, USA', 'Calories: 49, Vitamin C: 150%', 0.8, 4, true, NOW(), NOW()), " +
                    "('Organic Fair Trade Bananas', 'organic-fair-trade-bananas', 'Naturally sweet and rich in potassium, these organic bananas are sustainably grown and fair trade certified.', 2.99, NULL, 'bunch', 2.00, 200, 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&q=80', 1, 9.5, true, false, 'Ecuador', 'Calories: 105, Potassium: 422mg', 0.5, 7, true, NOW(), NOW()), " +
                    "('Crisp Romaine Hearts', 'crisp-romaine-hearts', 'Fresh, crisp, and tightly packed Romaine lettuce hearts. Ideal for Caesar salads and fresh wraps.', 3.99, NULL, 'pack', 3.00, 120, 'https://images.unsplash.com/photo-1640878536102-1815db5e1141?w=600&q=80', 2, 8.8, false, false, 'Arizona, USA', 'Calories: 15, Vitamin A: 160%', 0.4, 6, true, NOW(), NOW()), " +
                    "('Organic Heirloom Tomatoes', 'organic-heirloom-tomatoes', 'Vibrant, juicy, and full of flavor. Our organic heirloom tomatoes add a gourmet touch to any dish.', 5.99, 4.99, 'lb', 1.00, 90, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', 2, 9.0, true, true, 'Local Farms', 'Calories: 22, Vitamin C: 20%', 0.6, 5, true, NOW(), NOW()), " +
                    "('Fresh Spinach Bunch', 'fresh-spinach-bunch', 'Tender and nutrient-dense fresh spinach leaves. Great for cooking or raw in salads and smoothies.', 2.49, NULL, 'bunch', 0.50, 150, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80', 2, 9.3, true, false, 'California, USA', 'Calories: 7, Iron: 4%', 0.3, 4, true, NOW(), NOW()), " +
                    "('Organic Whole Milk', 'organic-whole-milk', 'Creamy and nutritious organic whole milk from pasture-raised cows. No artificial hormones or antibiotics.', 4.99, NULL, 'gallon', 1.00, 60, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80', 3, 8.2, true, false, 'Wisconsin, USA', 'Calories: 150, Calcium: 30%', 2.5, 14, true, NOW(), NOW()), " +
                    "('Free-Range Brown Eggs', 'free-range-brown-eggs', 'Farm fresh, large brown eggs from pasture-raised hens. Rich yolks and excellent flavor.', 5.49, 4.49, 'dozen', 1.00, 100, 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&q=80', 3, 9.1, false, true, 'Local Farms', 'Calories: 70, Protein: 6g', 1.1, 21, true, NOW(), NOW()), " +
                    "('Artisan Cheddar Cheese', 'artisan-cheddar-cheese', 'Aged for 12 months, this sharp cheddar boasts a complex, robust flavor and crumbly texture.', 8.99, NULL, 'block', 0.50, 40, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80', 3, 7.8, false, false, 'Vermont, USA', 'Calories: 110, Calcium: 20%', 3.0, 30, true, NOW(), NOW()), " +
                    "('Sea Salt Potato Chips', 'sea-salt-potato-chips', 'Kettle-cooked for extra crunch and lightly seasoned with premium sea salt. A perfect snack.', 3.49, NULL, 'bag', 8.00, 200, 'https://images.unsplash.com/photo-1566478989037-e806e0ee5622?w=600&q=80', 4, 7.5, false, false, 'USA', 'Calories: 150, Sodium: 120mg', 1.5, 60, true, NOW(), NOW()), " +
                    "('Organic Mixed Nuts', 'organic-mixed-nuts', 'A wholesome blend of roasted almonds, walnuts, cashews, and pecans. Packed with healthy fats and protein.', 12.99, 10.99, 'jar', 16.00, 85, 'https://images.unsplash.com/photo-1599598425947-33004b3f021f?w=600&q=80', 4, 8.9, true, true, 'Various', 'Calories: 170, Protein: 5g', 2.1, 90, true, NOW(), NOW()), " +
                    "('Cold-Pressed Orange Juice', 'cold-pressed-orange-juice', '100% pure, cold-pressed orange juice with no added sugar. Bursting with natural vitamin C.', 6.49, NULL, 'bottle', 32.00, 50, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80', 5, 8.4, false, false, 'Florida, USA', 'Calories: 110, Vitamin C: 120%', 1.2, 10, true, NOW(), NOW()), " +
                    "('Sparkling Mineral Water', 'sparkling-mineral-water', 'Naturally carbonated mineral water sourced from pristine mountain springs. Crisp and refreshing.', 2.99, 2.49, 'bottle', 1.00, 300, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=600&q=80', 5, 9.4, false, false, 'Italy', 'Calories: 0', 0.5, 365, true, NOW(), NOW()), " +
                    "('Sourdough Artisan Loaf', 'sourdough-artisan-loaf', 'Hand-crafted and naturally leavened sourdough bread with a crispy crust and chewy crumb.', 5.99, NULL, 'loaf', 1.00, 30, 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=600&q=80', 6, 8.7, false, true, 'Local Bakery', 'Calories: 120, Carbs: 24g', 0.9, 3, true, NOW(), NOW()), " +
                    "('French Butter Croissants', 'french-butter-croissants', 'Flaky, buttery, and authentically French. Perfect for a luxurious breakfast or afternoon tea.', 4.49, 3.99, 'pack', 4.00, 45, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80', 6, 7.2, false, false, 'France', 'Calories: 230, Fat: 12g', 1.8, 2, true, NOW(), NOW()), " +
                    "('Organic Frozen Mixed Berries', 'organic-frozen-mixed-berries', 'A vibrant mix of organic strawberries, blueberries, and raspberries. Flash-frozen to lock in nutrients.', 7.99, NULL, 'bag', 16.00, 110, 'https://images.unsplash.com/photo-1577401344498-8e0b6b23b499?w=600&q=80', 7, 8.8, true, false, 'USA', 'Calories: 70, Vitamin C: 60%', 1.4, 180, true, NOW(), NOW()), " +
                    "('Natural Lavender Soap', 'natural-lavender-soap', 'Handmade bar soap infused with calming lavender essential oil and nourishing shea butter.', 5.49, NULL, 'bar', 4.00, 75, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80', 8, 9.6, true, false, 'Local Artisans', 'N/A', 0.4, 365, true, NOW(), NOW()), " +
                    "('Eco-Friendly Dish Soap', 'eco-friendly-dish-soap', 'Tough on grease but gentle on the planet. Biodegradable formula with a fresh lemon scent.', 4.99, 3.99, 'bottle', 24.00, 140, 'https://images.unsplash.com/photo-1585906233543-9ba4470cd1a1?w=600&q=80', 9, 9.8, false, true, 'USA', 'N/A', 0.6, 730, true, NOW(), NOW());";
            
            jdbcTemplate.execute(insertProducts);
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1;");
            System.out.println("✅ SUCCESSFULLY SEEDED REALISTIC PRODUCT DATA!");
        }
    }
}
