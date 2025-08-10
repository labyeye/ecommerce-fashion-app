const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
require('dotenv').config();

const fashionProducts = [
  {
    name: "Elegant Silk Jumpsuit",
    description: "A sophisticated silk jumpsuit perfect for evening events. Features a flattering wide-leg cut and adjustable waist tie.",
    shortDescription: "Luxurious silk jumpsuit with wide-leg design",
    price: 4999,
    comparePrice: 7999,
    sku: "JS001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 8, price: 4999 },
      { size: "S", stock: 15, price: 4999 },
      { size: "M", stock: 20, price: 4999 },
      { size: "L", stock: 12, price: 4999 },
      { size: "XL", stock: 5, price: 4999 }
    ],
    colors: [
      {
        name: "Emerald Green",
        hexCode: "#50C878",
        images: [
          { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Emerald Green Silk Jumpsuit" },
          { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Emerald Green Jumpsuit Back View" }
        ],
        stock: 30
      },
      {
        name: "Midnight Black",
        hexCode: "#000000",
        images: [
          { url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Black Silk Jumpsuit" }
        ],
        stock: 25
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Silk Jumpsuit", isPrimary: true }
    ],
    material: "100% Silk",
    careInstructions: "Dry clean only, store on hangers",
    fit: "regular",
    tags: ["jumpsuit", "silk", "elegant", "evening", "formal"],
    isFeatured: true,
    isNewArrival: true
  },
  {
    name: "Bohemian Kaftan Dress",
    description: "Flowing kaftan dress with intricate embroidered patterns. Perfect for beach vacations or casual summer days.",
    shortDescription: "Embroidered bohemian kaftan for effortless style",
    price: 2999,
    comparePrice: 4499,
    sku: "KF001",
    brand: "FLAUNT",
    sizes: [
      { size: "S", stock: 12, price: 2999 },
      { size: "M", stock: 18, price: 2999 },
      { size: "L", stock: 15, price: 2999 },
      { size: "XL", stock: 8, price: 2999 }
    ],
    colors: [
      {
        name: "Turquoise Blue",
        hexCode: "#40E0D0",
        images: [
          { url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Turquoise Kaftan" },
          { url: "https://images.unsplash.com/photo-1564584217132-2271339fbe7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Kaftan Detail View" }
        ],
        stock: 25
      },
      {
        name: "Coral Pink",
        hexCode: "#FF7F7F",
        images: [
          { url: "https://images.unsplash.com/photo-1571513722275-4b79ccb80fd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Coral Pink Kaftan" }
        ],
        stock: 20
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Bohemian Kaftan", isPrimary: true }
    ],
    material: "Cotton-Silk Blend",
    careInstructions: "Hand wash cold, air dry",
    fit: "loose",
    tags: ["kaftan", "bohemian", "summer", "embroidered", "beach"],
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: "Two-Piece Coord Set",
    description: "Modern coordinates set featuring a crop top and high-waisted pants. Perfect for brunch or casual outings.",
    shortDescription: "Stylish two-piece coordinate set",
    price: 3499,
    comparePrice: 5299,
    sku: "CS001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 10, price: 3499 },
      { size: "S", stock: 20, price: 3499 },
      { size: "M", stock: 25, price: 3499 },
      { size: "L", stock: 15, price: 3499 },
      { size: "XL", stock: 8, price: 3499 }
    ],
    colors: [
      {
        name: "Blush Pink",
        hexCode: "#FFB6C1",
        images: [
          { url: "https://images.unsplash.com/photo-1596519677267-218d61d3d9b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Blush Pink Coord Set" },
          { url: "https://images.unsplash.com/photo-1544957992-20514f595d6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Coord Set Styling" }
        ],
        stock: 35
      },
      {
        name: "Sage Green",
        hexCode: "#9CAF88",
        images: [
          { url: "https://images.unsplash.com/photo-1564584217132-2271339fbe7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Sage Green Coord Set" }
        ],
        stock: 28
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1596519677267-218d61d3d9b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Coord Set", isPrimary: true }
    ],
    material: "Cotton-Polyester Blend",
    careInstructions: "Machine wash cold, tumble dry low",
    fit: "regular",
    tags: ["coord set", "two piece", "crop top", "trendy", "casual"],
    isFeatured: true,
    isNewArrival: true
  },
  {
    name: "Floral Maxi Dress",
    description: "Elegant maxi dress with beautiful floral prints. Features a V-neckline and flowing silhouette perfect for special occasions.",
    shortDescription: "Romantic floral maxi dress",
    price: 3999,
    comparePrice: 6499,
    sku: "DR001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 6, price: 3999 },
      { size: "S", stock: 15, price: 3999 },
      { size: "M", stock: 22, price: 3999 },
      { size: "L", stock: 18, price: 3999 },
      { size: "XL", stock: 10, price: 3999 }
    ],
    colors: [
      {
        name: "Navy Floral",
        hexCode: "#001f3f",
        images: [
          { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Navy Floral Maxi Dress" },
          { url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Maxi Dress Detail" }
        ],
        stock: 32
      },
      {
        name: "Burgundy Floral",
        hexCode: "#800020",
        images: [
          { url: "https://images.unsplash.com/photo-1566479179817-c4c96a6e08e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Burgundy Floral Dress" }
        ],
        stock: 25
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Floral Maxi Dress", isPrimary: true }
    ],
    material: "Chiffon",
    careInstructions: "Hand wash or dry clean, hang to dry",
    fit: "regular",
    tags: ["dress", "maxi", "floral", "elegant", "occasion"],
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: "Classic White Button Shirt",
    description: "Timeless white button-down shirt that's a wardrobe essential. Crisp cotton fabric with a tailored fit.",
    shortDescription: "Essential white cotton button shirt",
    price: 1899,
    comparePrice: 2999,
    sku: "SH001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 12, price: 1899 },
      { size: "S", stock: 25, price: 1899 },
      { size: "M", stock: 30, price: 1899 },
      { size: "L", stock: 20, price: 1899 },
      { size: "XL", stock: 15, price: 1899 }
    ],
    colors: [
      {
        name: "Pure White",
        hexCode: "#FFFFFF",
        images: [
          { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "White Button Shirt" },
          { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Shirt Detail" }
        ],
        stock: 45
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "White Button Shirt", isPrimary: true }
    ],
    material: "100% Cotton",
    careInstructions: "Machine wash warm, iron if needed",
    fit: "slim",
    tags: ["shirt", "white", "cotton", "classic", "essential"],
    isFeatured: false,
    isNewArrival: false
  },
  {
    name: "Denim Midi Skirt",
    description: "Versatile denim midi skirt with a flattering A-line silhouette. Features button-front detail and functional pockets.",
    shortDescription: "Classic denim midi skirt",
    price: 2299,
    comparePrice: 3499,
    sku: "SK001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 8, price: 2299 },
      { size: "S", stock: 18, price: 2299 },
      { size: "M", stock: 25, price: 2299 },
      { size: "L", stock: 20, price: 2299 },
      { size: "XL", stock: 12, price: 2299 }
    ],
    colors: [
      {
        name: "Medium Wash",
        hexCode: "#4682B4",
        images: [
          { url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Medium Wash Denim Skirt" }
        ],
        stock: 35
      },
      {
        name: "Dark Wash",
        hexCode: "#1e3a8a",
        images: [
          { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Dark Wash Denim Skirt" }
        ],
        stock: 28
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Denim Midi Skirt", isPrimary: true }
    ],
    material: "98% Cotton, 2% Elastane",
    careInstructions: "Machine wash cold, hang dry",
    fit: "regular",
    tags: ["skirt", "denim", "midi", "casual", "versatile"],
    isFeatured: false,
    isNewArrival: true
  },
  {
    name: "Printed Wrap Blouse",
    description: "Elegant wrap blouse with artistic prints. Features 3/4 sleeves and a flattering wrap design.",
    shortDescription: "Artistic printed wrap blouse",
    price: 2799,
    comparePrice: 4299,
    sku: "BL001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 10, price: 2799 },
      { size: "S", stock: 20, price: 2799 },
      { size: "M", stock: 28, price: 2799 },
      { size: "L", stock: 22, price: 2799 },
      { size: "XL", stock: 15, price: 2799 }
    ],
    colors: [
      {
        name: "Abstract Blue",
        hexCode: "#4169E1",
        images: [
          { url: "https://images.unsplash.com/photo-1564584217132-2271339fbe7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Abstract Blue Wrap Blouse" }
        ],
        stock: 40
      },
      {
        name: "Floral Coral",
        hexCode: "#FF6347",
        images: [
          { url: "https://images.unsplash.com/photo-1571513722275-4b79ccb80fd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Floral Coral Blouse" }
        ],
        stock: 35
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1564584217132-2271339fbe7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Printed Wrap Blouse", isPrimary: true }
    ],
    material: "Polyester Crepe",
    careInstructions: "Machine wash cold, hang dry",
    fit: "regular",
    tags: ["blouse", "wrap", "printed", "elegant", "work"],
    isFeatured: false,
    isNewArrival: false
  },
  {
    name: "High-Waisted Wide Leg Pants",
    description: "Contemporary wide-leg pants with a high waist for a flattering silhouette. Perfect for both casual and formal occasions.",
    shortDescription: "High-waisted wide leg trousers",
    price: 3299,
    comparePrice: 4999,
    sku: "PT001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 8, price: 3299 },
      { size: "S", stock: 18, price: 3299 },
      { size: "M", stock: 25, price: 3299 },
      { size: "L", stock: 20, price: 3299 },
      { size: "XL", stock: 12, price: 3299 }
    ],
    colors: [
      {
        name: "Charcoal Grey",
        hexCode: "#36454F",
        images: [
          { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Charcoal Wide Leg Pants" }
        ],
        stock: 35
      },
      {
        name: "Cream",
        hexCode: "#F5F5DC",
        images: [
          { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Cream Wide Leg Pants" }
        ],
        stock: 28
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Wide Leg Pants", isPrimary: true }
    ],
    material: "Polyester-Viscose Blend",
    careInstructions: "Dry clean recommended or machine wash gentle",
    fit: "regular",
    tags: ["pants", "wide leg", "high waist", "formal", "contemporary"],
    isFeatured: true,
    isNewArrival: false
  },
  {
    name: "Embellished Evening Gown",
    description: "Stunning evening gown with intricate beadwork and sequin details. Perfect for formal events and special occasions.",
    shortDescription: "Elegant embellished evening gown",
    price: 8999,
    comparePrice: 12999,
    sku: "EG001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 3, price: 8999 },
      { size: "S", stock: 8, price: 8999 },
      { size: "M", stock: 12, price: 8999 },
      { size: "L", stock: 10, price: 8999 },
      { size: "XL", stock: 5, price: 8999 }
    ],
    colors: [
      {
        name: "Midnight Navy",
        hexCode: "#191970",
        images: [
          { url: "https://images.unsplash.com/photo-1566479179817-c4c96a6e08e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Midnight Navy Evening Gown" }
        ],
        stock: 20
      },
      {
        name: "Classic Black",
        hexCode: "#000000",
        images: [
          { url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Black Evening Gown" }
        ],
        stock: 18
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1566479179817-c4c96a6e08e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Evening Gown", isPrimary: true }
    ],
    material: "Silk with Beadwork",
    careInstructions: "Dry clean only, professional care recommended",
    fit: "regular",
    tags: ["gown", "evening", "formal", "embellished", "luxury"],
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: "Casual Linen Blazer",
    description: "Relaxed linen blazer perfect for summer styling. Features a relaxed fit and unstructured design.",
    shortDescription: "Relaxed summer linen blazer",
    price: 4299,
    comparePrice: 6499,
    sku: "BZ001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 6, price: 4299 },
      { size: "S", stock: 15, price: 4299 },
      { size: "M", stock: 20, price: 4299 },
      { size: "L", stock: 18, price: 4299 },
      { size: "XL", stock: 12, price: 4299 }
    ],
    colors: [
      {
        name: "Natural Beige",
        hexCode: "#F5F5DC",
        images: [
          { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Beige Linen Blazer" }
        ],
        stock: 35
      },
      {
        name: "Olive Green",
        hexCode: "#808000",
        images: [
          { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Olive Linen Blazer" }
        ],
        stock: 30
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Linen Blazer", isPrimary: true }
    ],
    material: "100% Linen",
    careInstructions: "Machine wash cold, air dry, iron while damp",
    fit: "oversized",
    tags: ["blazer", "linen", "casual", "summer", "unstructured"],
    isFeatured: false,
    isNewArrival: true
  },
  {
    name: "Pleated Midi Skirt",
    description: "Elegant pleated midi skirt that moves beautifully. Perfect for both work and weekend styling.",
    shortDescription: "Classic pleated midi skirt",
    price: 2899,
    comparePrice: 4299,
    sku: "PS001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 10, price: 2899 },
      { size: "S", stock: 22, price: 2899 },
      { size: "M", stock: 28, price: 2899 },
      { size: "L", stock: 20, price: 2899 },
      { size: "XL", stock: 15, price: 2899 }
    ],
    colors: [
      {
        name: "Dusty Rose",
        hexCode: "#DCAE96",
        images: [
          { url: "https://images.unsplash.com/photo-1571513722275-4b79ccb80fd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Dusty Rose Pleated Skirt" }
        ],
        stock: 40
      },
      {
        name: "Navy Blue",
        hexCode: "#000080",
        images: [
          { url: "https://images.unsplash.com/photo-1564584217132-2271339fbe7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Navy Pleated Skirt" }
        ],
        stock: 35
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1571513722275-4b79ccb80fd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Pleated Midi Skirt", isPrimary: true }
    ],
    material: "Polyester Crepe",
    careInstructions: "Machine wash cold, hang dry, steam if needed",
    fit: "regular",
    tags: ["skirt", "pleated", "midi", "elegant", "versatile"],
    isFeatured: false,
    isNewArrival: false
  },
  {
    name: "Cropped Denim Jacket",
    description: "Classic cropped denim jacket with a modern twist. Features distressed details and a flattering cropped length.",
    shortDescription: "Trendy cropped denim jacket",
    price: 3799,
    comparePrice: 5499,
    sku: "DJ001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 8, price: 3799 },
      { size: "S", stock: 18, price: 3799 },
      { size: "M", stock: 25, price: 3799 },
      { size: "L", stock: 20, price: 3799 },
      { size: "XL", stock: 15, price: 3799 }
    ],
    colors: [
      {
        name: "Light Wash",
        hexCode: "#87CEEB",
        images: [
          { url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Light Wash Denim Jacket" }
        ],
        stock: 45
      },
      {
        name: "Dark Wash",
        hexCode: "#1e3a8a",
        images: [
          { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Dark Wash Denim Jacket" }
        ],
        stock: 40
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Cropped Denim Jacket", isPrimary: true }
    ],
    material: "100% Cotton Denim",
    careInstructions: "Machine wash cold, tumble dry low",
    fit: "regular",
    tags: ["jacket", "denim", "cropped", "casual", "trendy"],
    isFeatured: true,
    isNewArrival: true
  },
  {
    name: "Satin Slip Dress",
    description: "Luxurious satin slip dress with delicate spaghetti straps. Perfect for layering or wearing alone for evening occasions.",
    shortDescription: "Elegant satin slip dress",
    price: 3599,
    comparePrice: 5299,
    sku: "SD001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 6, price: 3599 },
      { size: "S", stock: 15, price: 3599 },
      { size: "M", stock: 22, price: 3599 },
      { size: "L", stock: 18, price: 3599 },
      { size: "XL", stock: 10, price: 3599 }
    ],
    colors: [
      {
        name: "Champagne Gold",
        hexCode: "#F7E7CE",
        images: [
          { url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Champagne Satin Slip Dress" }
        ],
        stock: 35
      },
      {
        name: "Emerald Green",
        hexCode: "#50C878",
        images: [
          { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Emerald Satin Slip Dress" }
        ],
        stock: 30
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Satin Slip Dress", isPrimary: true }
    ],
    material: "100% Silk Satin",
    careInstructions: "Dry clean only, store on hangers",
    fit: "slim",
    tags: ["dress", "slip", "satin", "elegant", "evening"],
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: "Oversized Knit Sweater",
    description: "Cozy oversized knit sweater perfect for layering. Features a relaxed fit and soft texture for ultimate comfort.",
    shortDescription: "Cozy oversized knit sweater",
    price: 2999,
    comparePrice: 4499,
    sku: "SW001",
    brand: "FLAUNT",
    sizes: [
      { size: "XS", stock: 12, price: 2999 },
      { size: "S", stock: 20, price: 2999 },
      { size: "M", stock: 25, price: 2999 },
      { size: "L", stock: 22, price: 2999 },
      { size: "XL", stock: 18, price: 2999 }
    ],
    colors: [
      {
        name: "Cream",
        hexCode: "#F5F5DC",
        images: [
          { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Cream Knit Sweater" }
        ],
        stock: 40
      },
      {
        name: "Camel Brown",
        hexCode: "#C19A6B",
        images: [
          { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Camel Knit Sweater" }
        ],
        stock: 37
      }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Oversized Knit Sweater", isPrimary: true }
    ],
    material: "Cotton-Wool Blend",
    careInstructions: "Hand wash cold, lay flat to dry",
    fit: "oversized",
    tags: ["sweater", "knit", "oversized", "cozy", "layering"],
    isFeatured: false,
    isNewArrival: false
  }
];

const seedProducts = async () => {
  try {
    console.log('Starting 15 products seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');

    // Get categories
    const categories = await Category.find({ isActive: true });
    if (categories.length === 0) {
      console.log('No categories found. Please run the categories seed first.');
      process.exit(1);
    }

    console.log(`Found ${categories.length} categories`);

    // Find or create an admin user for createdBy field
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating a default admin user...');
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@flaunt.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true
      });
      console.log('Created default admin user');
    }
    console.log(`Using admin user: ${adminUser.email}`);

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Assign random categories to products and add createdBy
    const productsWithCategories = fashionProducts.map(product => ({
      ...product,
      category: categories[Math.floor(Math.random() * categories.length)]._id,
      createdBy: adminUser._id
    }));

    // Create products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`Created ${createdProducts.length} fashion products`);

    console.log('15 Fashion products seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
