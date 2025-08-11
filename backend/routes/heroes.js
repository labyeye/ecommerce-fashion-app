const express = require('express');
const router = express.Router();
const Hero = require('../models/Hero');
const { protect, isAdmin } = require('../middleware/auth');

// @desc    Get all active heroes (public)
// @route   GET /api/heroes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const heroes = await Hero.getActiveHeroes();
    
    res.json({
      success: true,
      data: heroes
    });
  } catch (error) {
    console.error('Error fetching heroes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heroes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all heroes (admin only)
// @route   GET /api/heroes/admin
// @access  Private/Admin

// @desc    Create new hero
// @route   POST /api/heroes
// @access  Private/Admin
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const hero = await Hero.create(req.body);
    
    res.status(201).json({
      success: true,
      data: hero
    });
  } catch (error) {
    console.error('Error creating hero:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create hero',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update hero
// @route   PUT /api/heroes/:id
// @access  Private/Admin
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }
    
    res.json({
      success: true,
      data: hero
    });
  } catch (error) {
    console.error('Error updating hero:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update hero',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete hero
// @route   DELETE /api/heroes/:id
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const hero = await Hero.findByIdAndDelete(req.params.id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }

    // Update sort order of remaining heroes
    await Hero.updateMany(
      { sortOrder: { $gt: hero.sortOrder } },
      { $inc: { sortOrder: -1 } }
    );
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting hero:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to delete hero',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update hero sort order
// @route   PUT /api/heroes/sort/:id
// @access  Private/Admin
router.put('/sort/:id', protect, isAdmin, async (req, res) => {
  try {
    const { sortOrder } = req.body;
    const hero = await Hero.findById(req.params.id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }

    // If moving up (lower number)
    if (sortOrder < hero.sortOrder) {
      await Hero.updateMany(
        {
          _id: { $ne: hero._id },
          sortOrder: { $gte: sortOrder, $lt: hero.sortOrder }
        },
        { $inc: { sortOrder: 1 } }
      );
    }
    // If moving down (higher number)
    else if (sortOrder > hero.sortOrder) {
      await Hero.updateMany(
        {
          _id: { $ne: hero._id },
          sortOrder: { $gt: hero.sortOrder, $lte: sortOrder }
        },
        { $inc: { sortOrder: -1 } }
      );
    }

    hero.sortOrder = sortOrder;
    await hero.save();
    
    res.json({
      success: true,
      data: hero
    });
  } catch (error) {
    console.error('Error updating hero sort order:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update hero sort order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
router.get('/admin', protect, isAdmin, async (req, res) => {
  try {
    const heroes = await Hero.find().sort({ sortOrder: 1 });
    
    res.json({
      success: true,
      data: heroes
    });
  } catch (error) {
    console.error('Error fetching heroes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heroes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
// @route   GET /api/heroes/all
// @access  Private/Admin
router.get('/all', protect, isAdmin, async (req, res) => {
  try {
    const heroes = await Hero.find().sort({ order: 1 });
    
    res.json({
      success: true,
      data: {
        heroes,
        total: heroes.length
      }
    });
  } catch (error) {
    console.error('Error fetching all heroes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heroes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single hero
// @route   GET /api/heroes/:id
// @access  Private/Admin
router.get('/:id', protect, isAdmin, async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }
    
    res.json({
      success: true,
      data: { hero }
    });
  } catch (error) {
    console.error('Error fetching hero:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create new hero
// @route   POST /api/heroes
// @access  Private/Admin
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const hero = await Hero.create(req.body);
    
    res.status(201).json({
      success: true,
      data: { hero },
      message: 'Hero created successfully'
    });
  } catch (error) {
    console.error('Error creating hero:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create hero',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update hero
// @route   PUT /api/heroes/:id
// @access  Private/Admin
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const hero = await Hero.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }
    
    res.json({
      success: true,
      data: { hero },
      message: 'Hero updated successfully'
    });
  } catch (error) {
    console.error('Error updating hero:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update hero',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete hero
// @route   DELETE /api/heroes/:id
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const hero = await Hero.findByIdAndDelete(req.params.id);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Hero deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hero:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Toggle hero active status
// @route   PATCH /api/heroes/:id/toggle
// @access  Private/Admin
router.patch('/:id/toggle', protect, isAdmin, async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }
    
    hero.isActive = !hero.isActive;
    await hero.save();
    
    res.json({
      success: true,
      data: { hero },
      message: `Hero ${hero.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling hero status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle hero status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Reorder heroes
// @route   PUT /api/heroes/reorder
// @access  Private/Admin
router.put('/reorder', protect, isAdmin, async (req, res) => {
  try {
    const { heroIds } = req.body; // Array of hero IDs in new order
    
    if (!Array.isArray(heroIds)) {
      return res.status(400).json({
        success: false,
        message: 'heroIds must be an array'
      });
    }
    
    // Update order for each hero
    const updatePromises = heroIds.map((heroId, index) => 
      Hero.findByIdAndUpdate(heroId, { order: index + 1 })
    );
    
    await Promise.all(updatePromises);
    
    // Fetch updated heroes
    const heroes = await Hero.find().sort({ order: 1 });
    
    res.json({
      success: true,
      data: { heroes },
      message: 'Heroes reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering heroes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder heroes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
