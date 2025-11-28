const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxLength: [200, 'Job title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
    default: 'Full-time'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxLength: [200, 'Location cannot exceed 200 characters']
  },
  experience: {
    type: String,
    required: [true, 'Experience requirement is required'],
    trim: true,
    maxLength: [100, 'Experience cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  responsibilities: {
    type: String,
    required: [true, 'Responsibilities are required'],
    trim: true
  },
  skills: {
    type: String,
    required: [true, 'Skills are required'],
    trim: true
  },
  salary: {
    type: String,
    trim: true,
    default: null
  },
  postDate: {
    type: Date,
    default: Date.now
  },
  googleFormLink: {
    type: String,
    required: [true, 'Google Form link is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ status: 1, postDate: -1 });
jobSchema.index({ type: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
