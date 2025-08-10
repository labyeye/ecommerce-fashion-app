const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect: auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Multer configuration for category image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/categories/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all categories (for dropdown and navigation)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get navigation categories (for website header)
router.get('/navigation', async (req, res) => {
  try {
    const categories = await Category.find({ 
      isActive: true, 
      showInNavigation: true,
      parentCategory: null // Only root categories for main navigation
    })
      .populate({
        path: 'parentCategory',
        select: 'name slug'
      })
      .sort({ sortOrder: 1, name: 1 });

    // Get subcategories for dropdown
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await Category.find({
          parentCategory: category._id,
          isActive: true,
          showInDropdown: true
        }).sort({ sortOrder: 1, name: 1 });

        return {
          ...category.toObject(),
          subcategories
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithSubcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get homepage categories (for category cards section)
router.get('/homepage', async (req, res) => {
  try {
    const categories = await Category.find({ 
      isActive: true, 
      showInNavigation: true,
      parentCategory: null // Only root categories
    })
      .select('name slug description image isActive sortOrder showInNavigation color icon')
      .sort({ sortOrder: 1, name: 1 })
      .limit(2); // Only take first 2 categories for homepage cards

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single category
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new category
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      parentCategory,
      isActive,
      sortOrder,
      showInNavigation,
      seoTitle,
      seoDescription
    } = req.body;

    const category = new Category({
      name,
      description,
      image,
      parentCategory: parentCategory || null,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
      showInNavigation: showInNavigation !== undefined ? showInNavigation : true,
      seoTitle,
      seoDescription,
      createdBy: req.user.id
    });

    await category.save();

    const populatedCategory = await Category.findById(category._id)
      .populate('parentCategory', 'name slug');

    res.status(201).json({
      success: true,
      data: populatedCategory
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update category
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete category
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} products assigned to it.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentCategory: req.params.id });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${subcategoryCount} subcategories.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get products by category
router.get('/:id/products', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const products = await Product.find({ 
      category: req.params.id,
      status: 'active'
    }).populate('category', 'name slug');

    res.json({
      success: true,
      data: {
        category,
        products
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    } );
  }
});

// Create new category
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update category
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete category
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated products'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload category image
router.post('/upload-image', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/categories/${req.file.filename}`;

    res.json({
      success: true,
      imageUrl: imageUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;