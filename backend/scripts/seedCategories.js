const mongoose = require('mongoose');
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/fashionstore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for category seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCategories = async () => {
  try {
    console.log('Starting category seeding...');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Sample categories for navigation and homepage
    const categories = [
      {
        name: 'Women\'s Collection',
        slug: 'womens-collection',
        description: 'Elegant styles for the modern woman',
        image: {
          url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          alt: 'Women\'s Fashion Collection'
        },
        isActive: true,
        sortOrder: 1,
        showInNavigation: true,
        showInDropdown: true,
        color: '#F4F1E9',
        icon: '👗'
      },
      {
        name: 'Trending Now',
        slug: 'trending-now',
        description: 'Latest fashion trends and styles',
        image: {
          url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          alt: 'Trending Fashion'
        },
        isActive: true,
        sortOrder: 2,
        showInNavigation: true,
        showInDropdown: true,
        color: '#2B463C',
        icon: '🔥'
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Complete your look with our accessories',
        image: {
          url: 'https://images.unsplash.com/photo-1506629905270-11674752ca40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          alt: 'Fashion Accessories'
        },
        isActive: true,
        sortOrder: 3,
        showInNavigation: true,
        showInDropdown: true,
        color: '#688F4E',
        icon: '💎'
      },
      {
        name: 'Summer Collection',
        slug: 'summer-collection',
        description: 'Light and breezy summer styles',
        image: {
          url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          alt: 'Summer Fashion'
        },
        isActive: true,
        sortOrder: 4,
        showInNavigation: true,
        showInDropdown: true,
        color: '#FFE5B4',
        icon: '☀️'
      }
    ];

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Display created categories
    const allCategories = await Category.find({ isActive: true, showInNavigation: true })
      .sort({ sortOrder: 1 });
    
    console.log('\nCreated Categories:');
    allCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) - Order: ${cat.sortOrder}`);
    });

    console.log('\nCategories seeded successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding
const runSeeding = async () => {
  await connectDB();
  await seedCategories();
};

runSeeding();
