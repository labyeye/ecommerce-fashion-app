const mongoose = require('mongoose');
const Category = require('../models/Category');
const NavigationLink = require('../models/NavigationLink');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected for seeding'))
    .catch(err => console.error('MongoDB connection error:', err));

const seedFashionCategories = async () => {
    try {
        console.log('Starting fashion categories seeding...');

        // Get admin user
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            adminUser = await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@flaunt.com',
                password: 'admin123',
                role: 'admin',
                isVerified: true
            });
            console.log('Created admin user');
        }

        // Delete existing categories to start fresh
        await Category.deleteMany({});
        await NavigationLink.deleteMany({});
        console.log('Cleared existing categories and navigation');

        // Create the 4 main categories you requested
        const categories = [
            {
                name: 'Jumpsuit',
                slug: 'jumpsuit',
                description: 'Stylish and comfortable jumpsuits for every occasion',
                sortOrder: 1,
                showInNavigation: true,
                showInDropdown: true,
                color: '#8B7355',
                createdBy: adminUser._id
            },
            {
                name: 'Kaftan',
                slug: 'kaftan',
                description: 'Elegant and flowing kaftans perfect for comfort and style',
                sortOrder: 2,
                showInNavigation: true,
                showInDropdown: true,
                color: '#D4CFC7',
                createdBy: adminUser._id
            },
            {
                name: 'Coord Set',
                slug: 'coord-set',
                description: 'Perfectly coordinated sets for a polished look',
                sortOrder: 3,
                showInNavigation: true,
                showInDropdown: true,
                color: '#B5A084',
                createdBy: adminUser._id
            },
            {
                name: 'Dress',
                slug: 'dress',
                description: 'Beautiful dresses for every season and occasion',
                sortOrder: 4,
                showInNavigation: true,
                showInDropdown: true,
                color: '#8B7355',
                createdBy: adminUser._id
            }
        ];

        const createdCategories = await Category.insertMany(categories);
        console.log(`Created ${createdCategories.length} categories`);

        // Create navigation structure
        const navigationLinks = [
            {
                name: 'Home',
                slug: 'home',
                url: '/',
                type: 'page',
                isActive: true,
                showInNavigation: true,
                sortOrder: 1,
                hasDropdown: false,
                createdBy: adminUser._id
            },
            {
                name: 'About',
                slug: 'about',
                url: '/about',
                type: 'page',
                isActive: true,
                showInNavigation: true,
                sortOrder: 2,
                hasDropdown: false,
                createdBy: adminUser._id
            },
            {
                name: 'Products',
                slug: 'products',
                url: '/products',
                type: 'category',
                isActive: true,
                showInNavigation: true,
                sortOrder: 3,
                hasDropdown: true,
                dropdownItems: createdCategories.map((cat, index) => ({
                    name: cat.name,
                    url: `/products?category=${cat._id}`,
                    category: cat._id,
                    isActive: true,
                    sortOrder: index + 1
                })),
                createdBy: adminUser._id
            },
            {
                name: 'Blogs',
                slug: 'blogs',
                url: '/blogs',
                type: 'page',
                isActive: true,
                showInNavigation: true,
                sortOrder: 4,
                hasDropdown: false,
                createdBy: adminUser._id
            },
            {
                name: 'Contact',
                slug: 'contact',
                url: '/contact',
                type: 'page',
                isActive: true,
                showInNavigation: true,
                sortOrder: 5,
                hasDropdown: false,
                createdBy: adminUser._id
            }
        ];

        const createdNavigation = await NavigationLink.insertMany(navigationLinks);
        console.log(`Created ${createdNavigation.length} navigation links`);

        console.log('Fashion categories and navigation seeded successfully!');
        console.log('Categories created:', createdCategories.map(cat => cat.name));
        console.log('Navigation links created:', createdNavigation.map(nav => nav.name));

    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedFashionCategories();
