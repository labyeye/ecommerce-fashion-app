const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
require('dotenv').config();

const clothingProducts = [
  {
    name: "Oversized Cotton T-Shirt",
    description: "Premium cotton t-shirt with a relaxed oversized fit. Perfect for casual wear with superior comfort and style.",
    shortDescription: "Comfortable oversized cotton tee",
    price: 1299,
    comparePrice: 1999,
    sku: "CT001",
    brand: "FASHION",
    sizes: [
      { size: "XS", stock: 15, price: 1299 },
      { size: "S", stock: 25, price: 1299 },
      { size: "M", stock: 30, price: 1299 },
      { size: "L", stock: 20, price: 1299 },
      { size: "XL", stock: 10, price: 1299 }
    ],
    colors: [
      {
        name: "White",
        hexCode: "#FFFFFF",
        images: [
          { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "White Cotton T-Shirt" }
        ],
        stock: 50
      },
      {
        name: "Black",
        hexCode: "#000000",
        images: [
          { url: "https://images.unsplash.com/photo-1583743814966-8936f37f8302?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Black Cotton T-Shirt" }
        ],
        stock: 45
      },
      {
        name: "Navy",
        hexCode: "#001f3f",
        images: [
          { url: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Navy Cotton T-Shirt" }
        ],
        stock: 30
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Cotton T-Shirt", isPrimary: true }
    ],
    material: "100% Premium Cotton",
    careInstructions: "Machine wash cold, tumble dry low, do not bleach",
    fit: "oversized",
    tags: ["casual", "cotton", "oversized", "basic", "everyday"],
    isFeatured: true,
    isNewArrival: true
  },
  {
    name: "Slim Fit Jeans",
    description: "Modern slim fit jeans crafted from premium denim with stretch for comfort and mobility.",
    shortDescription: "Comfortable slim fit denim jeans",
    price: 2499,
    comparePrice: 3999,
    sku: "JN001",
    brand: "FASHION",
    sizes: [
      { size: "28", stock: 12, price: 2499 },
      { size: "30", stock: 20, price: 2499 },
      { size: "32", stock: 25, price: 2499 },
      { size: "34", stock: 15, price: 2499 },
      { size: "36", stock: 8, price: 2499 }
    ],
    colors: [
      {
        name: "Dark Blue",
        hexCode: "#1e3a8a",
        images: [
          { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Dark Blue Jeans" }
        ],
        stock: 40
      },
      {
        name: "Light Blue",
        hexCode: "#3b82f6",
        images: [
          { url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Light Blue Jeans" }
        ],
        stock: 35
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Slim Fit Jeans", isPrimary: true }
    ],
    material: "98% Cotton, 2% Elastane",
    careInstructions: "Machine wash cold, hang dry, iron if needed",
    fit: "slim",
    tags: ["jeans", "denim", "slim", "casual", "stretch"],
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: "Casual Button Shirt",
    description: "Versatile button-down shirt perfect for both casual and semi-formal occasions. Made from breathable cotton blend.",
    shortDescription: "Versatile cotton blend button shirt",
    price: 1899,
    comparePrice: 2799,
    sku: "SH001",
    brand: "FASHION",
    sizes: [
      { size: "S", stock: 18, price: 1899 },
      { size: "M", stock: 22, price: 1899 },
      { size: "L", stock: 20, price: 1899 },
      { size: "XL", stock: 12, price: 1899 }
    ],
    colors: [
      {
        name: "White",
        hexCode: "#FFFFFF",
        images: [
          { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "White Button Shirt" }
        ],
        stock: 35
      },
      {
        name: "Light Blue",
        hexCode: "#dbeafe",
        images: [
          { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Light Blue Button Shirt" }
        ],
        stock: 30
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Button Shirt", isPrimary: true }
    ],
    material: "60% Cotton, 40% Polyester",
    careInstructions: "Machine wash warm, iron on medium heat",
    fit: "regular",
    tags: ["shirt", "button-down", "casual", "formal", "versatile"],
    isFeatured: false,
    isNewArrival: true
  },
  {
    name: "Knitted Sweater",
    description: "Cozy knitted sweater perfect for cooler weather. Soft texture with modern fit and classic design.",
    shortDescription: "Soft knitted sweater for layering",
    price: 2999,
    comparePrice: 4299,
    sku: "SW001",
    brand: "FASHION",
    sizes: [
      { size: "S", stock: 15, price: 2999 },
      { size: "M", stock: 20, price: 2999 },
      { size: "L", stock: 18, price: 2999 },
      { size: "XL", stock: 10, price: 2999 }
    ],
    colors: [
      {
        name: "Beige",
        hexCode: "#f5f5dc",
        images: [
          { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Beige Sweater" }
        ],
        stock: 32
      },
      {
        name: "Charcoal",
        hexCode: "#36454f",
        images: [
          { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Charcoal Sweater" }
        ],
        stock: 25
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Knitted Sweater", isPrimary: true }
    ],
    material: "100% Merino Wool",
    careInstructions: "Hand wash cold, lay flat to dry",
    fit: "regular",
    tags: ["sweater", "knit", "wool", "winter", "cozy"],
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: "Chino Trousers",
    description: "Classic chino trousers with modern tailoring. Perfect for smart-casual occasions with comfortable fit.",
    shortDescription: "Smart-casual chino trousers",
    price: 2199,
    comparePrice: 3299,
    sku: "CH001",
    brand: "FASHION",
    sizes: [
      { size: "30", stock: 14, price: 2199 },
      { size: "32", stock: 20, price: 2199 },
      { size: "34", stock: 16, price: 2199 },
      { size: "36", stock: 10, price: 2199 }
    ],
    colors: [
      {
        name: "Khaki",
        hexCode: "#f0e68c",
        images: [
          { url: "https://images.unsplash.com/photo-1506629905853-6d46b0a70463?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Khaki Chinos" }
        ],
        stock: 30
      },
      {
        name: "Navy",
        hexCode: "#000080",
        images: [
          { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Navy Chinos" }
        ],
        stock: 25
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1506629905853-6d46b0a70463?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Chino Trousers", isPrimary: true }
    ],
    material: "100% Cotton Twill",
    careInstructions: "Machine wash cold, iron on medium heat",
    fit: "regular",
    tags: ["chinos", "trousers", "smart-casual", "cotton", "tailored"],
    isFeatured: false,
    isBestSeller: true
  }
];

const seedClothingProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Find or create admin user (consolidated)
    let adminUser = await User.findOne({ email: 'admin@vitals.com' });
    if (!adminUser) {
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@vitals.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
    }

    // Find or create categories
    let categories = {};
    const categoryNames = ['Shirts', 'Jeans', 'Sweaters', 'Trousers', 'T-Shirts'];
    
    for (const categoryName of categoryNames) {
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = await Category.create({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          description: `${categoryName} collection`,
          createdBy: adminUser._id,
          status: 'active'
        });
      }
      categories[categoryName] = category._id;
    }

    // Create products with categories
    const productsToCreate = clothingProducts.map(product => {
      let categoryId;
      if (product.name.includes('T-Shirt')) categoryId = categories['T-Shirts'];
      else if (product.name.includes('Jeans')) categoryId = categories['Jeans'];
      else if (product.name.includes('Shirt')) categoryId = categories['Shirts'];
      else if (product.name.includes('Sweater')) categoryId = categories['Sweaters'];
      else if (product.name.includes('Chino') || product.name.includes('Trousers')) categoryId = categories['Trousers'];
      else categoryId = categories['T-Shirts'];

      return {
        ...product,
        category: categoryId,
        createdBy: adminUser._id,
        ratings: {
          average: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          count: Math.floor(Math.random() * 50) + 10 // 10-60 reviews
        }
      };
    });

    // Insert products
    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`Created ${createdProducts.length} clothing products`);

    console.log('Clothing products seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding clothing products:', error);
    process.exit(1);
  }
};

seedClothingProducts();
