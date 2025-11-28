const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @desc    Create a new job
// @route   POST /api/jobs/create
// @access  Admin only
router.post('/create', protect, adminAuth, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Job title is required and must be between 1-200 characters'),
  body('type')
    .isIn(['Full-time', 'Part-time', 'Internship', 'Contract'])
    .withMessage('Job type must be Full-time, Part-time, Internship, or Contract'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location is required and must be between 1-200 characters'),
  body('experience')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Experience requirement is required'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Job description is required'),
  body('responsibilities')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Responsibilities are required'),
  body('skills')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Skills are required'),
  body('googleFormLink')
    .trim()
    .isURL()
    .withMessage('Please provide a valid Google Form URL'),
  body('status')
    .optional()
    .isIn(['Active', 'Closed'])
    .withMessage('Status must be Active or Closed')
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

    const {
      title,
      type,
      location,
      experience,
      description,
      responsibilities,
      skills,
      salary,
      postDate,
      googleFormLink,
      status
    } = req.body;

    const job = await Job.create({
      title,
      type,
      location,
      experience,
      description,
      responsibilities,
      skills,
      salary: salary || null,
      postDate: postDate || Date.now(),
      googleFormLink,
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job posting'
    });
  }
});

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public (active jobs) / Admin (all jobs)
router.get('/', async (req, res) => {
  try {
    const {
      type,
      location,
      search,
      status,
      page = 1,
      limit = 20,
      sortBy = 'postDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // For public access, show only active jobs
    // For admin access (if user is authenticated), show all or filtered by status
    if (req.user && req.user.role === 'admin') {
      if (status) {
        query.status = status;
      }
    } else {
      query.status = 'Active';
    }

    if (type) {
      query.type = type;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get jobs with pagination
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: jobs.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job postings'
    });
  }
});

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // For public access, only show active jobs
    if (!req.user || req.user.role !== 'admin') {
      if (job.status !== 'Active') {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job details'
    });
  }
});

// @desc    Update job
// @route   PUT /api/jobs/update/:id
// @access  Admin only
router.put('/update/:id', protect, adminAuth, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Job title must be between 1-200 characters'),
  body('type')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Internship', 'Contract'])
    .withMessage('Job type must be Full-time, Part-time, Internship, or Contract'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1-200 characters'),
  body('googleFormLink')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid Google Form URL'),
  body('status')
    .optional()
    .isIn(['Active', 'Closed'])
    .withMessage('Status must be Active or Closed')
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
    const updateData = req.body;

    const job = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job posting'
    });
  }
});

// @desc    Delete job
// @route   DELETE /api/jobs/delete/:id
// @access  Admin only
router.delete('/delete/:id', protect, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job posting'
    });
  }
});

module.exports = router;
