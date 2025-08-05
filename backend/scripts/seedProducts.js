const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
require('dotenv').config();


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected for seeding'))
    .catch(err => console.error('MongoDB connection error:', err));
const getAdminUserId = async () => {
    
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
        throw new Error('No admin user found in database');
    }
    return adminUser._id;
};

const seedCategories = async (adminUserId) => {
    await Category.deleteMany();

    const categories = [
        {
            name: 'Protein Shakes',
            slug: 'protein-shakes',
            description: 'Premium protein shakes for fitness enthusiasts',
            image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
            createdBy: adminUserId
        },
        {
            name: 'Variety Packs',
            slug: 'variety-packs',
            description: 'Try all our flavors in one convenient pack',
            image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
            createdBy: adminUserId
        }
    ];

    const createdCategories = await Category.insertMany(categories);
    return {
        shakesCategory: createdCategories[0]._id,
        varietyCategory: createdCategories[1]._id
    };
};


const seedProducts = async (categoryIds, adminUserId) => {
    await Product.deleteMany();

    const products = [
        {
            sku: 'VITAL-STRWB-001',
            name: 'Vital Strawberry Protein Shake',
            description: 'Your daily protein fix, dressed as a treat. Tastes like dessert, performs like a pro.',
            shortDescription: 'Strawberry flavored protein shake',
            price: 149,
            comparePrice: 179,
            category: categoryIds.shakesCategory,
            brand: 'Vital',
            images: [
                {
                    url: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg',
                    alt: 'Strawberry Protein Shake',
                    isPrimary: true
                }
            ],
            stock: {
                quantity: 100,
                lowStockThreshold: 10,
                trackStock: true
            },
            variants: [
                {
                  name: 'Pack Size',
                  options: ['1', '6', '12', '24'],
                  prices: [
                    { size: 1, price: 149 },
                    { size: 6, price: 799 },
                    { size: 12, price: 1499 },
                    { size: 24, price: 2799 }
                  ]
                }
              ],
            attributes: [
                { name: 'Flavor', value: 'Strawberry' },
                { name: 'Protein', value: '25g' },
                { name: 'Sugar', value: 'No Added Sugar' }
            ],
            tags: ['protein', 'shake', 'strawberry', 'fitness'],
            status: 'active',
            isFeatured: true,
            isBestSeller: true,
            weight: 500,
            dimensions: {
                length: 8,
                width: 8,
                height: 20
            },
            seo: {
                title: 'Strawberry Protein Shake | Vital',
                description: 'Premium strawberry protein shake with 25g complete protein',
                keywords: ['protein', 'shake', 'strawberry', 'fitness']
            },
            createdBy: adminUserId
        },
        {
            sku: 'VITAL-CHOCO-001',
            name: 'Vital Chocolate Protein Shake',
            description: 'Classic flavour, smarter fuel. Rich taste of real cocoa with 25g of clean, complete protein.',
            shortDescription: 'Chocolate flavored protein shake',
            price: 149,
            comparePrice: 179,
            category: categoryIds.shakesCategory,
            brand: 'Vital',
            images: [
                {
                    url: 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg',
                    alt: 'Chocolate Protein Shake',
                    isPrimary: true
                }
            ],
            stock: {
                quantity: 100,
                lowStockThreshold: 10,
                trackStock: true
            },
            variants: [
                {
                  name: 'Pack Size',
                  options: ['1', '6', '12', '24'],
                  prices: [
                    { size: 1, price: 149 },
                    { size: 6, price: 799 },
                    { size: 12, price: 1499 },
                    { size: 24, price: 2799 }
                  ]
                }
              ],
            attributes: [
                { name: 'Flavor', value: 'Chocolate' },
                { name: 'Protein', value: '25g' },
                { name: 'Sugar', value: 'No Added Sugar' }
            ],
            tags: ['protein', 'shake', 'chocolate', 'fitness'],
            status: 'active',
            isFeatured: true,
            isBestSeller: true,
            weight: 500,
            dimensions: {
                length: 8,
                width: 8,
                height: 20
            },
            seo: {
                title: 'Chocolate Protein Shake | Vital',
                description: 'Premium chocolate protein shake with 25g complete protein',
                keywords: ['protein', 'shake', 'chocolate', 'fitness']
            },
            createdBy: adminUserId
        },
        {
            sku: 'VITAL-VANILLA-001',
            name: 'Vital Vanilla Protein Shake',
            description: 'Simple doesn\'t mean boring. Smooth, balanced, and endlessly drinkable everyday essential.',
            shortDescription: 'Vanilla flavored protein shake',
            price: 149,
            comparePrice: 179,
            category: categoryIds.shakesCategory,
            brand: 'Vital',
            images: [
                {
                    url: 'https://images.pexels.com/photos/414262/pexels-photo-414262.jpeg',
                    alt: 'Vanilla Protein Shake',
                    isPrimary: true
                }
            ],
            stock: {
                quantity: 100,
                lowStockThreshold: 10,
                trackStock: true
            },
            variants: [
                {
                  name: 'Pack Size',
                  options: ['1', '6', '12', '24'],
                  prices: [
                    { size: 1, price: 149 },
                    { size: 6, price: 799 },
                    { size: 12, price: 1499 },
                    { size: 24, price: 2799 }
                  ]
                }
              ],
            attributes: [
                { name: 'Flavor', value: 'Vanilla' },
                { name: 'Protein', value: '25g' },
                { name: 'Sugar', value: 'No Added Sugar' }
            ],
            tags: ['protein', 'shake', 'vanilla', 'fitness'],
            status: 'active',
            isFeatured: true,
            weight: 500,
            dimensions: {
                length: 8,
                width: 8,
                height: 20
            },
            seo: {
                title: 'Vanilla Protein Shake | Vital',
                description: 'Premium vanilla protein shake with 25g complete protein',
                keywords: ['protein', 'shake', 'vanilla', 'fitness']
            },
            createdBy: adminUserId
        },
        {
            sku: 'VITAL-COFFEE-001',
            name: 'Vital Coffee Protein Shake',
            description: 'Your morning brew just got an upgrade. Daily protein and caffeine kick in one smooth bottle.',
            shortDescription: 'Coffee flavored protein shake',
            price: 159,
            comparePrice: 189,
            category: categoryIds.shakesCategory,
            brand: 'Vital',
            images: [
                {
                    url: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg',
                    alt: 'Coffee Protein Shake',
                    isPrimary: true
                }
            ],
            stock: {
                quantity: 100,
                lowStockThreshold: 10,
                trackStock: true
            },
            variants: [
                {
                  name: 'Pack Size',
                  options: ['1', '6', '12', '24'],
                  prices: [
                    { size: 1, price: 159 },
                    { size: 6, price: 849 },
                    { size: 12, price: 1599 },
                    { size: 24, price: 2999 }
                  ]
                }
              ],
            attributes: [
                { name: 'Flavor', value: 'Coffee' },
                { name: 'Protein', value: '25g' },
                { name: 'Caffeine', value: '100mg' }
            ],
            tags: ['protein', 'shake', 'coffee', 'energy'],
            status: 'active',
            isFeatured: true,
            isBestSeller: true,
            weight: 500,
            dimensions: {
                length: 8,
                width: 8,
                height: 20
            },
            seo: {
                title: 'Coffee Protein Shake | Vital',
                description: 'Premium coffee protein shake with 25g complete protein and 100mg caffeine',
                keywords: ['protein', 'shake', 'coffee', 'energy']
            },
            createdBy: adminUserId
        },
        {
            sku: 'VITAL-VARIETY-001',
            name: 'Vital Variety Pack',
            description: 'All the flavours. All the functions. One pack. Perfect for those who can\'t pick just one.',
            shortDescription: 'Variety pack with all flavors',
            price: 599,
            comparePrice: 699,
            category: categoryIds.varietyCategory,
            brand: 'Vital',
            images: [
                {
                    url: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg',
                    alt: 'Variety Pack',
                    isPrimary: true
                }
            ],
            stock: {
                quantity: 100,
                lowStockThreshold: 10,
                trackStock: true
            },
            variants: [
                {
                  name: 'Pack Size',
                  options: ['1', '6', '12', '24'],
                  prices: [
                    { size: 1, price: 149 },
                    { size: 6, price: 799 },
                    { size: 12, price: 1499 },
                    { size: 24, price: 2799 }
                  ]
                }
              ],
            attributes: [
                { name: 'Flavor', value: 'Mixed' },
                { name: 'Protein', value: '25g' },
                { name: 'Variety', value: 'All 4 flavors' }
            ],
            tags: ['protein', 'shake', 'variety', 'sampler'],
            status: 'active',
            isFeatured: true,
            isBestSeller: true,
            weight: 2000,
            dimensions: {
                length: 15,
                width: 15,
                height: 20
            },
            seo: {
                title: 'Protein Shake Variety Pack | Vital',
                description: 'Try all our premium protein shake flavors in one convenient pack',
                keywords: ['protein', 'shake', 'variety', 'sampler']
            },
            createdBy: adminUserId
        }
    ];

    await Product.insertMany(products);
    console.log('Products seeded successfully');
};


const runSeed = async () => {
    try {
        const adminUserId = await getAdminUserId();
        const categoryIds = await seedCategories(adminUserId);
        await seedProducts(categoryIds, adminUserId);
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

runSeed();
