const mongoose = require('mongoose');

const navigationLinkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['category', 'page', 'external'],
    default: 'page'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showInNavigation: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  hasDropdown: {
    type: Boolean,
    default: false
  },
  dropdownItems: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  icon: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate slug from name before validation so the slug exists when Mongoose runs validators
navigationLinkSchema.pre('validate', async function(next) {
  try {
    if ((this.isModified('name') || !this.slug) && this.name) {
      let baseSlug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      let newSlug = baseSlug;
      let counter = 0;

      // If the document already has an _id (update case), exclude it from uniqueness check
      const queryExcludedId = this._id ? { _id: { $ne: this._id } } : {};

      // Loop until we find a slug that doesn't exist
      // eslint-disable-next-line no-await-in-loop
      while (await mongoose.models.NavigationLink.exists({ slug: newSlug, ...queryExcludedId })) {
        counter += 1;
        newSlug = `${baseSlug}-${counter}`;
      }

      this.slug = newSlug;
    }
    next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error generating unique slug for NavigationLink (pre-validate):', err);
    next(err);
  }
});

// Also handle findOneAndUpdate() calls (if used elsewhere) so that
// updating the name via findOneAndUpdate will produce a slug.
navigationLinkSchema.pre('findOneAndUpdate', function(next) {
  try {
    const update = this.getUpdate();
    if (update && update.name) {
      const name = update.name;
      // Generate a unique slug for the new name (async checks via mongoose)
      let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      let newSlug = baseSlug;
      // We can't use async/await directly here (this hook isn't async), so perform a synchronous-looking check
      // by using a promise and waiting via then. This is a little hacky but avoids changing hook type.
      const queryExcludedId = this.getQuery() && this.getQuery()._id ? { _id: { $ne: this.getQuery()._id } } : {};
      const ensureUnique = async () => {
        let counter = 0;
        // eslint-disable-next-line no-await-in-loop
        while (await mongoose.models.NavigationLink.exists({ slug: newSlug, ...queryExcludedId })) {
          counter += 1;
          newSlug = `${baseSlug}-${counter}`;
        }
        return newSlug;
      };

      // Update the payload once the unique slug is resolved
      // setUpdate will be called inside the promise resolution
      // eslint-disable-next-line promise/catch-or-return
      ensureUnique().then((resolvedSlug) => {
        this.setUpdate({ ...update, slug: resolvedSlug });
        next();
      }).catch(err => {
        // eslint-disable-next-line no-console
        console.error('Error generating slug in findOneAndUpdate hook', err);
        next(err);
      });
      // return here because we'll call next() from the promise resolution
      return;
    }
  } catch (err) {
    // If anything goes wrong, allow the operation to continue and let validation surface
    // an error back to the caller.
    // eslint-disable-next-line no-console
    console.error('Error generating slug in findOneAndUpdate hook', err);
  }
  next();
});

module.exports = mongoose.model('NavigationLink', navigationLinkSchema);
