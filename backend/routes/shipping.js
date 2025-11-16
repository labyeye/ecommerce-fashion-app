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
    // Include configured pickup point (seller) info from environment so frontend can show ETA from pickup
    const pickupInfo = {
      name: process.env.SELLER_NAME || "NS designs",
      pin: process.env.SELLER_PINCODE || process.env.SELLER_PIN || "",
      processingDays: Number(process.env.SELLER_PROCESSING_DAYS || process.env.SHIPMENT_PROCESSING_DAYS || 1),
    };

    // If carrier did not provide estDays, use a conservative fallback (configurable)
    const carrierEst = typeof data.estDays === 'number' ? Number(data.estDays) : null;
    const fallbackDays = Number(process.env.SHIPMENT_FALLBACK_DAYS || 5);
    const estDays = carrierEst !== null ? carrierEst : fallbackDays;
    const fallbackUsed = carrierEst === null;

    return res.json({
      deliverable: Boolean(data.deliverable),
      estDays,
      fallback: fallbackUsed,
      message: data.message || (data.deliverable ? 'Serviceable' : 'Not serviceable'),
      raw: data.raw || null,
      pickup: pickupInfo,
    });
  } catch (err) {
    console.error('Shipping check error', err);
    return res.status(500).json({ success: false, message: 'Failed to check pincode', error: err.message || String(err) });
  }
});

module.exports = router;
