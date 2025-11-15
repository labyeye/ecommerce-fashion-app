const axios = require('axios');
const Order = require('../models/Order');

const API_KEY = process.env.DELHIVERY_API_KEY || '8976acf224d7787aed465acb1a436ff778c96b23';
const CMU_URL = 'https://track.delhivery.com/api/cmu/create.json';
const TRACK_URL = 'https://track.delhivery.com/api/v1/packages/json/';

async function createShipmentForOrder(order) {
  try {
    // Build minimal payload accepted by Delhivery CMU API
    const payload = {
      shipments: [
        {
          order: order.orderNumber,
          pickup_location: 'Seller Address',
          payment_mode: order.payment && order.payment.method === 'cod' ? 'COD' : 'Prepaid',
          order_amount: order.total,
          consignments: [
            {
              consignee: {
                name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
                phone: order.shippingAddress.phone,
                address: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                pincode: order.shippingAddress.zipCode
              },
              items: order.items.map(it => ({
                name: it.product && it.product.name ? it.product.name : 'Item',
                quantity: it.quantity
              }))
            }
          ]
        }
      ]
    };

    const res = await axios.post(CMU_URL, payload, {
      headers: {
        Authorization: `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    // Persist response summary to order
    const data = res.data || {};
    const shipmentInfo = {};

    // Delhivery returns created shipments information in response.shipments or response.data
    if (data && data.shipments && Array.isArray(data.shipments) && data.shipments.length) {
      const s = data.shipments[0];
      shipmentInfo.awb = s.awb || s.waybill || s.waybill_number || '';
      shipmentInfo.shipmentId = s.shipment_id || s.id || '';
      shipmentInfo.trackingUrl = `https://track.delhivery.com/?waybill=${shipmentInfo.awb}`;
      shipmentInfo.status = 'created';
    } else if (data && data.success && data.data && data.data[0]) {
      const s = data.data[0];
      shipmentInfo.awb = s.awb || s.waybill || '';
      shipmentInfo.trackingUrl = `https://track.delhivery.com/?waybill=${shipmentInfo.awb}`;
      shipmentInfo.status = 'created';
    }

    order.shipment = order.shipment || {};
    order.shipment.rawResponse = data;
    if (shipmentInfo.awb) order.shipment.awb = shipmentInfo.awb;
    if (shipmentInfo.shipmentId) order.shipment.shipmentId = shipmentInfo.shipmentId;
    if (shipmentInfo.trackingUrl) order.shipment.trackingUrl = shipmentInfo.trackingUrl;
    order.shipment.status = shipmentInfo.status || 'created';
    order.shipment.carrier = 'Delhivery';
    order.shipment.lastSyncedAt = new Date();

    await order.save();

    return { success: true, data: shipmentInfo, raw: data };
  } catch (err) {
    console.error('Delhivery createShipment error:', err && err.response ? err.response.data || err.response.statusText : err.message);
    return { success: false, error: err && err.response ? err.response.data || err.response.statusText : err.message };
  }
}

async function fetchTrackingForAwb(awb) {
  try {
    const url = `${TRACK_URL}?waybill=${encodeURIComponent(awb)}`;
    const res = await axios.get(url, { headers: { Authorization: `Token ${API_KEY}` }, timeout: 15000 });
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Delhivery fetchTracking error:', err && err.response ? err.response.data || err.response.statusText : err.message);
    return { success: false, error: err && err.response ? err.response.data || err.response.statusText : err.message };
  }
}

/**
 * Check pincode serviceability using Delhivery public endpoints (best-effort).
 * Returns an object { success: boolean, data: any } where data may include
 * { deliverable: boolean, estDays?: number, message?: string, raw?: any }
 */
async function checkPincodeServiceability(pincode) {
  try {
    if (!pincode) return { success: false, error: 'No pincode provided' };

    const candidates = [
      `https://track.delhivery.com/api/pincode/json/?pincode=${encodeURIComponent(pincode)}`,
      `https://track.delhivery.com/api/v1/pincode/json/?pincode=${encodeURIComponent(pincode)}`,
      `https://track.delhivery.com/api/v1/pincode/${encodeURIComponent(pincode)}`,
    ];

    let lastErr = null;
    for (const url of candidates) {
      try {
        const res = await require('axios').get(url, {
          headers: { Authorization: `Token ${API_KEY}` },
          timeout: 10000,
        });
        const data = res.data;

        // Heuristic mapping
        // If Delhivery uses `serviceable` or similar fields
        if (data) {
          // Common shapes: { serviceable: true } or { pincode: { serviceability: true } } or { status: 'OK', data: [...] }
          let deliverable = false;
          let estDays = undefined;
          let message = '';

          if (typeof data.serviceable === 'boolean') {
            deliverable = data.serviceable;
            message = data.message || '';
          } else if (data.pincode && typeof data.pincode.serviceability !== 'undefined') {
            deliverable = Boolean(data.pincode.serviceability);
          } else if (data.status && data.status.toLowerCase && data.status.toLowerCase() === 'ok') {
            // If data.data present and non-empty, assume deliverable
            if (Array.isArray(data.data) && data.data.length > 0) deliverable = true;
          } else if (Array.isArray(data) && data.length > 0) {
            deliverable = true;
          }

          // If response contains transit days or service days field
          if (data.estDays) estDays = data.estDays;
          if (data.transit_days) estDays = data.transit_days;

          return { success: true, data: { deliverable, estDays, message, raw: data } };
        }
      } catch (err) {
        lastErr = err;
        continue; // try next candidate
      }
    }

    return { success: false, error: lastErr ? lastErr.message || String(lastErr) : 'No response from Delhivery' };
  } catch (err) {
    console.error('checkPincodeServiceability error', err && err.message ? err.message : err);
    return { success: false, error: err && err.message ? err.message : 'Unknown error' };
  }
}

module.exports = {
  createShipmentForOrder,
  fetchTrackingForAwb
  , checkPincodeServiceability
 };
