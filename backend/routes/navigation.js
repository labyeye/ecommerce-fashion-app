const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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
    // Temporary debug log to help diagnose 400 responses from clients
    console.log('POST /api/navigation payload:', JSON.stringify(req.body));
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

    // Helper: treat empty strings (or whitespace-only strings) as null for ObjectId fields
    // Also ensure we only keep values that are valid ObjectId strings
    const normalizeCategoryValue = (val) => {
      if (val === undefined || val === null) return null;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed === '') return null;
        // Accept only valid ObjectId strings; otherwise normalize to null
        if (mongoose.Types.ObjectId.isValid(trimmed)) return trimmed;
        return null;
      }
      // If it's already an ObjectId or other truthy value, keep it
      return val;
    };

    const sanitizedDropdown = Array.isArray(dropdownItems)
      ? dropdownItems
          .filter(it => it && it.name && it.url)
          .map(it => ({ ...it, category: normalizeCategoryValue(it.category) }))
      : [];

    const navigationLink = new NavigationLink({
      name,
      url,
      type: type || 'page',
      category: normalizeCategoryValue(category),
      isActive: isActive !== undefined ? isActive : true,
      showInNavigation: showInNavigation !== undefined ? showInNavigation : true,
      sortOrder: sortOrder || 0,
      hasDropdown: hasDropdown || false,
        dropdownItems: sanitizedDropdown,
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
    // Provide richer error details for validation errors to the client (dev-friendly)
    if (error && error.name === 'ValidationError') {
      const details = {};
      Object.keys(error.errors || {}).forEach(key => {
        details[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details
      });
    }

    if (error && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Navigation link slug already exists',
        keyValue: error.keyValue || null
      });
    }

    console.error('Navigation POST error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create navigation link'
    });
  }
});

// Update navigation link
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    // Load existing doc so pre('save') middleware (slug generation) runs and
    // so we can sanitize dropdown items before saving (avoid empty items causing validation errors).
    const navigationLink = await NavigationLink.findById(req.params.id);
    if (!navigationLink) {
      return res.status(404).json({
        success: false,
        message: 'Navigation link not found'
      });
    }

    // Only assign allowed fields from body
    const updatable = ['name','url','type','category','isActive','showInNavigation','sortOrder','hasDropdown','dropdownItems','icon'];
    updatable.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        navigationLink[field] = req.body[field];
      }
    });

    // Normalize empty strings to null for category fields (top-level and dropdown items)
    const normalizeVal = (val) => {
      if (val === undefined || val === null) return null;
      if (typeof val === 'string') return val.trim() === '' ? null : val;
      return val;
    };

    if (Array.isArray(req.body.dropdownItems)) {
      // If the client sent dropdownItems, rebuild them from the incoming payload (safe sanitization)
      navigationLink.dropdownItems = req.body.dropdownItems
        .filter(it => it && it.name && it.url)
        .map(it => ({ ...it, category: normalizeVal(it.category) }));
    } else if (Array.isArray(navigationLink.dropdownItems)) {
      // Fallback: sanitize existing dropdownItems on the loaded document
      navigationLink.dropdownItems = navigationLink.dropdownItems
        .filter(it => it && it.name && it.url)
        .map(it => ({ ...it, category: normalizeVal(it.category) }));
    }

    // Normalize top-level category
    navigationLink.category = normalizeVal(navigationLink.category);

    await navigationLink.save();

    const populated = await NavigationLink.findById(navigationLink._id)
      .populate('category', 'name slug')
      .populate('dropdownItems.category', 'name slug');

    res.json({
      success: true,
      data: populated
    });
  } catch (error) {
    // Provide richer error details for validation errors to the client (dev-friendly)
    if (error && error.name === 'ValidationError') {
      const details = {};
      Object.keys(error.errors || {}).forEach(key => {
        details[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details
      });
    }

    if (error && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Navigation link slug already exists',
        keyValue: error.keyValue || null
      });
    }

    console.error('Navigation PUT error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update navigation link'
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
