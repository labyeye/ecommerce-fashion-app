const express = require('express');
const router = express.Router();
const NavigationLink = require('../models/NavigationLink');
const Category = require('../models/Category');
const { protect: auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all navigation links
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const navigationLinks = await NavigationLink.find()
      .populate('category', 'name slug')
      .populate('dropdownItems.category', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: navigationLinks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get public navigation (for website header)
router.get('/public', async (req, res) => {
  try {
    const navigationLinks = await NavigationLink.find({ 
      isActive: true, 
      showInNavigation: true 
    })
      .populate('category', 'name slug')
      .populate('dropdownItems.category', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: navigationLinks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single navigation link
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const navigationLink = await NavigationLink.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('dropdownItems.category', 'name slug');

    if (!navigationLink) {
      return res.status(404).json({
        success: false,
        message: 'Navigation link not found'
      });
    }

    res.json({
      success: true,
      data: navigationLink
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new navigation link
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      url,
      type,
      category,
      isActive,
      showInNavigation,
      sortOrder,
      hasDropdown,
      dropdownItems,
      icon
    } = req.body;

    const navigationLink = new NavigationLink({
      name,
      url,
      type: type || 'page',
      category: category || null,
      isActive: isActive !== undefined ? isActive : true,
      showInNavigation: showInNavigation !== undefined ? showInNavigation : true,
      sortOrder: sortOrder || 0,
      hasDropdown: hasDropdown || false,
      dropdownItems: dropdownItems || [],
      icon,
      createdBy: req.user.id
    });

    await navigationLink.save();

    const populatedLink = await NavigationLink.findById(navigationLink._id)
      .populate('category', 'name slug')
      .populate('dropdownItems.category', 'name slug');

    res.status(201).json({
      success: true,
      data: populatedLink
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Navigation link slug already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update navigation link
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const navigationLink = await NavigationLink.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .populate('dropdownItems.category', 'name slug');

    if (!navigationLink) {
      return res.status(404).json({
        success: false,
        message: 'Navigation link not found'
      });
    }

    res.json({
      success: true,
      data: navigationLink
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete navigation link
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const navigationLink = await NavigationLink.findById(req.params.id);

    if (!navigationLink) {
      return res.status(404).json({
        success: false,
        message: 'Navigation link not found'
      });
    }

    await NavigationLink.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Navigation link deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
