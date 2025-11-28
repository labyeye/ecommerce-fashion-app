const express = require('express');
const { body, validationResult } = require('express-validator');
const ContactSubmission = require('../models/ContactSubmission');
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @desc    Submit contact form
// @route   POST /api/contact/submit
// @access  Public
router.post('/submit', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be between 1-100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be between 1-200 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message is required and must be between 1-2000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const userAgent = req.get('User-Agent') || 'Unknown';

    // Create contact submission
    const contactSubmission = await ContactSubmission.create({
      name,
      email,
      subject,
      message,
      ipAddress,
      userAgent
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
      data: {
        id: contactSubmission._id,
        submittedAt: contactSubmission.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form. Please try again later.'
    });
  }
});

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/contact/submissions
// @access  Admin only
router.get('/submissions', protect, adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      ContactSubmission.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ContactSubmission.countDocuments(query)
    ]);

    // Calculate stats
    const stats = await ContactSubmission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: submissions.length,
          totalRecords: total
        },
        stats: {
          total,
          new: statusStats.new || 0,
          read: statusStats.read || 0,
          replied: statusStats.replied || 0,
          resolved: statusStats.resolved || 0
        }
      }
    });

  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact submissions'
    });
  }
});

// @desc    Update contact submission status (Admin only)
// @route   PUT /api/contact/submissions/:id/status
// @access  Admin only
router.put('/submissions/:id/status', protect, adminAuth, [
  body('status')
    .isIn(['new', 'read', 'replied', 'resolved'])
    .withMessage('Status must be one of: new, read, replied, resolved')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: submission
    });

  } catch (error) {
    console.error('Update contact submission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact submission status'
    });
  }
});

// @desc    Get single contact submission (Admin only)
// @route   GET /api/contact/submissions/:id
// @access  Admin only
router.get('/submissions/:id', protect, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await ContactSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Mark as read if it was new
    if (submission.status === 'new') {
      submission.status = 'read';
      await submission.save();
    }

    res.status(200).json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Get contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact submission'
    });
  }
});

// @desc    Delete contact submission (Admin only)
// @route   DELETE /api/contact/submissions/:id
// @access  Admin only
router.delete('/submissions/:id', protect, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await ContactSubmission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact submission'
    });
  }
});

module.exports = router;