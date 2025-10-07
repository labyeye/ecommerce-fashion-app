const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes - no authentication required
// Get all published blogs
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, featured } = req.query;
    
    const query = { status: 'published' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    const blogs = await Blog.find(query)
      .select('title slug excerpt featuredImage images category readTime views isFeatured publishedAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching public blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
});

// Get single published blog by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Error fetching blog' });
  }
});

// Get blog categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { status: 'published' });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get featured blogs
router.get('/featured', async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      status: 'published', 
      isFeatured: true 
    })
    .select('title slug excerpt featuredImage images category readTime')
    .sort({ publishedAt: -1 })
    .limit(6);
    
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({ message: 'Error fetching featured blogs' });
  }
});

// Protected routes - require authentication
// Get all blogs (admin only)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { page = 1, limit = 20, status, category, search } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
});

// Get single blog by ID (admin only)
router.get('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Error fetching blog' });
  }
});

// Create new blog (admin only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const blogData = {
      ...req.body,
      author: {
        name: req.user.firstName + ' ' + req.user.lastName,
        email: req.user.email
      }
    };
    
    const blog = new Blog(blogData);
    await blog.save();
    
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Blog with this slug already exists' });
    }
    
    res.status(500).json({ message: 'Error creating blog' });
  }
});

// Update blog (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Blog with this slug already exists' });
    }
    
    res.status(500).json({ message: 'Error updating blog' });
  }
});

// Delete blog (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Error deleting blog' });
  }
});

// Update blog status (admin only)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { status } = req.body;
    
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error updating blog status:', error);
    res.status(500).json({ message: 'Error updating blog status' });
  }
});

// Toggle featured status (admin only)
router.patch('/:id/featured', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    blog.isFeatured = !blog.isFeatured;
    await blog.save();
    
    res.json(blog);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ message: 'Error updating featured status' });
  }
});

module.exports = router;
