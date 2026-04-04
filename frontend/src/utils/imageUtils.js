/**
 * Product Image Accuracy Utility
 * Maps product names and categories to accurate, relevant images
 * using Unsplash source API with targeted search terms.
 */

// Category-to-search-term mapping for accurate images
const CATEGORY_IMAGE_MAP = {
  // Produce
  fruits:       'fresh-fruits',
  vegetables:   'fresh-vegetables',
  'fresh produce': 'market-fresh-produce',

  // Dairy
  dairy:        'dairy-products',
  milk:         'fresh-milk',
  cheese:       'artisan-cheese',
  yogurt:       'yogurt',
  eggs:         'farm-eggs',

  // Bakery
  bakery:       'fresh-bread-bakery',
  bread:        'artisan-bread',
  cakes:        'bakery-cake',

  // Beverages
  beverages:    'beverages-drinks',
  drinks:       'cold-drinks',
  juice:        'fresh-juice',
  coffee:       'coffee-beans',
  tea:          'herbal-tea',
  water:        'mineral-water',

  // Snacks
  snacks:       'healthy-snacks',
  chips:        'snack-chips',
  nuts:         'mixed-nuts',

  // Frozen
  'frozen foods': 'frozen-food',
  frozen:       'frozen-meals',

  // Meat & Seafood
  meat:         'fresh-meat-butcher',
  chicken:      'fresh-chicken',
  seafood:      'fresh-seafood',
  fish:         'fresh-fish',

  // Pantry
  pantry:       'pantry-kitchen',
  grains:       'grains-cereals',
  rice:         'basmati-rice',
  pasta:        'pasta-italian',
  flour:        'wheat-flour',

  // Household
  household:    'cleaning-products',
  cleaning:     'household-cleaning',

  // Personal care
  'personal care': 'personal-care-products',

  // Default
  default:      'fresh-grocery-food',
};

// Specific product keyword to image mapping
const PRODUCT_KEYWORD_MAP = {
  // Fruits
  apple:        'red-apple-fruit',
  banana:       'yellow-banana',
  mango:        'ripe-mango',
  orange:       'orange-citrus',
  grapes:       'purple-grapes',
  strawberry:   'fresh-strawberry',
  watermelon:   'watermelon-slice',
  pineapple:    'pineapple-tropical',
  papaya:       'papaya-fruit',
  pomegranate:  'pomegranate-seeds',
  guava:        'guava-fruit',
  lemon:        'lemon-citrus',
  lime:         'lime-citrus',
  kiwi:         'kiwi-fruit',
  pear:         'pear-fruit',
  peach:        'peach-fruit',
  plum:         'plum-fruit',
  cherry:       'cherry-fresh',
  blueberry:    'blueberry-fresh',
  raspberry:    'raspberry-fresh',

  // Vegetables
  tomato:       'fresh-tomato',
  onion:        'red-onion',
  potato:       'russet-potato',
  carrot:       'fresh-carrot',
  spinach:      'baby-spinach',
  'bell pepper':  'colorful-bell-pepper',
  broccoli:     'fresh-broccoli',
  cauliflower:  'white-cauliflower',
  cucumber:     'fresh-cucumber',
  cabbage:      'green-cabbage',
  lettuce:      'fresh-lettuce',
  garlic:       'garlic-bulbs',
  ginger:       'fresh-ginger',
  beetroot:     'red-beetroot',
  peas:         'fresh-green-peas',
  corn:         'sweet-corn',
  mushroom:     'fresh-mushroom',
  zucchini:     'green-zucchini',
  eggplant:     'eggplant-purple',

  // Dairy
  milk:         'fresh-milk-bottle',
  butter:       'butter-dairy',
  cheese:       'cheddar-cheese',
  paneer:       'fresh-paneer-cheese',
  curd:         'yogurt-bowl',
  cream:        'heavy-cream',
  ghee:         'ghee-clarified-butter',

  // Grains & Staples
  rice:         'white-rice-grains',
  wheat:        'wheat-grains',
  bread:        'whole-wheat-bread',
  atta:         'wheat-flour-bag',
  sugar:        'white-sugar-bowl',
  salt:         'sea-salt',
  oil:          'cooking-olive-oil',

  // Beverages
  'fruit juice':  'fresh-fruit-juice',
  'cold drink':   'cold-beverage-can',
  cola:         'cola-drink',
  water:        'mineral-water-bottle',
  coffee:       'hot-coffee-cup',
  tea:          'green-tea-cup',

  // Snacks
  chips:        'potato-chips-snack',
  biscuits:     'chocolate-biscuits',
  cookies:      'freshly-baked-cookies',
  chocolate:    'dark-chocolate-bar',
  candy:        'colorful-candy',
  nuts:         'mixed-nuts-bowl',
  almonds:      'raw-almonds',
  cashews:      'cashew-nuts',

  // Proteins
  chicken:      'fresh-chicken-breast',
  egg:          'brown-eggs-farm',
  fish:         'salmon-fillet',

  // Default fallback
  grocery:      'grocery-store-fresh',
  organic:      'organic-food-market',
  fresh:        'fresh-market-produce',
};

/**
 * Get an accurate image URL for a product based on its name and category.
 * Uses Unsplash source API for reliable, relevant images.
 *
 * @param {string} productName - Name of the product
 * @param {string} categoryName - Category of the product
 * @param {string} existingUrl - Existing image URL (if already set and valid)
 * @param {number} width - Desired image width (default: 400)
 * @param {number} height - Desired image height (default: 400)
 * @returns {string} - Absolute image URL
 */
export function getProductImageUrl(productName = '', categoryName = '', existingUrl = '', width = 400, height = 400) {
  // If existing URL is set and doesn't look like a placeholder, use it
  if (existingUrl && existingUrl.startsWith('http') && !existingUrl.includes('placeholder')) {
    return existingUrl;
  }

  const nameLower = (productName || '').toLowerCase();
  const catLower = (categoryName || '').toLowerCase();

  // 1. Try exact product keyword match
  for (const [keyword, searchTerm] of Object.entries(PRODUCT_KEYWORD_MAP)) {
    if (nameLower.includes(keyword)) {
      return buildUnsplashUrl(searchTerm, width, height);
    }
  }

  // 2. Try category match
  for (const [catKey, searchTerm] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (catLower.includes(catKey) || catKey.includes(catLower)) {
      return buildUnsplashUrl(searchTerm, width, height);
    }
  }

  // 3. Use product name directly as search term
  if (nameLower.trim()) {
    const cleanName = nameLower.replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
    return buildUnsplashUrl(cleanName, width, height);
  }

  // 4. Final fallback
  return buildUnsplashUrl(CATEGORY_IMAGE_MAP.default, width, height);
}

/**
 * Build an Unsplash source URL with given search term and dimensions.
 */
function buildUnsplashUrl(searchTerm, width = 400, height = 400) {
  // Using Unsplash source for reliable featured images
  return `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(searchTerm)},food`;
}

/**
 * Get category image URL.
 */
export function getCategoryImageUrl(categoryName = '', width = 200, height = 200) {
  const catLower = (categoryName || '').toLowerCase();
  for (const [key, term] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (catLower.includes(key) || key.includes(catLower)) {
      return buildUnsplashUrl(term, width, height);
    }
  }
  return buildUnsplashUrl(CATEGORY_IMAGE_MAP.default, width, height);
}

/**
 * Category emoji map for visual icons.
 */
export const CATEGORY_EMOJIS = {
  fruits:     '🍇',
  vegetables: '🥦',
  dairy:      '🥛',
  bakery:     '🍞',
  beverages:  '🧃',
  snacks:     '🍿',
  frozen:     '🧊',
  meat:       '🥩',
  seafood:    '🐟',
  pantry:     '🫙',
  grains:     '🌾',
  household:  '🧹',
  default:    '🛒',
};

export function getCategoryEmoji(categoryName = '') {
  const lower = categoryName.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return CATEGORY_EMOJIS.default;
}
