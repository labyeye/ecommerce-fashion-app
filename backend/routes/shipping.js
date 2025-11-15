const express = require('express');
const router = express.Router();
const { checkPincodeServiceability } = require('../services/delhiveryService');

// GET /api/shipping/check?pincode=XXXXX
router.get('/check', async (req, res) => {
  const pincode = (req.query.pincode || '').toString().trim();
  if (!pincode) return res.status(400).json({ success: false, message: 'Pincode is required' });

  try {
    // Use Delhivery service to check pincode
    const result = await checkPincodeServiceability(pincode);
    if (!result.success) {
      return res.json({ deliverable: false, message: result.error || 'Serviceability unknown', raw: result.raw || null });
    }

    // Normalize response
    const data = result.data || {};
    return res.json({
      deliverable: Boolean(data.deliverable),
      estDays: data.estDays,
      message: data.message || (data.deliverable ? 'Serviceable' : 'Not serviceable'),
      raw: data.raw || null,
    });
  } catch (err) {
    console.error('Shipping check error', err);
    return res.status(500).json({ success: false, message: 'Failed to check pincode', error: err.message || String(err) });
  }
});

module.exports = router;
