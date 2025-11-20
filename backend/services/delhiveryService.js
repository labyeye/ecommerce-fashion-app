const axios = require("axios");
const Order = require("../models/Order");

const API_KEY =
  process.env.DELHIVERY_API_KEY || "8976acf224d7787aed465acb1a436ff778c96b23";
const CMU_URL = "https://track.delhivery.com/api/cmu/create.json?format=json";
const TRACK_URL = "https://track.delhivery.com/api/v1/packages/json/";

async function createShipmentForOrder(order) {
  // Helper: sanitize phone to 10-digit Indian mobile if possible
  function sanitizePhone(phoneRaw) {
    if (!phoneRaw) return "";
    const digits = ("" + phoneRaw).replace(/\D+/g, "");
    if (digits.length === 10) return digits;
    // strip leading country code 91 if present
    if (digits.length > 10 && digits.endsWith(digits.slice(-10)))
      return digits.slice(-10);
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
    if (digits.length >= 10) return digits.slice(-10);
    return digits;
  }

  try {
    // Re-fetch the order with populated product details so we can build clean product names
    const fullOrder = await Order.findById(order._id).populate("items.product");
    const useOrder = fullOrder || order;

    // Build consignee from order shippingAddress
    const sAddr = useOrder.shippingAddress || {};
    const consignee = {
      name: `${sAddr.firstName || ""} ${sAddr.lastName || ""}`.trim(),
      phone: sanitizePhone(sAddr.phone || ""),
      email: sAddr.email || "",
      address: sAddr.street || "",
      city: sAddr.city || "",
      state: sAddr.state || "",
      pincode: sAddr.zipCode || sAddr.pincode || "",
    };

    const destPin = consignee.pincode;
    // Pre-validate destination pincode
    const pinCheck = await checkPincodeServiceability(destPin).catch((e) => ({
      success: false,
      error: e,
    }));
    if (
      !pinCheck ||
      !pinCheck.success ||
      !pinCheck.data ||
      !pinCheck.data.deliverable
    ) {
      return {
        success: false,
        error: {
          message: `Destination pincode ${destPin} is not serviceable by Delhivery`,
          code: "PINCODE_NOT_SERVICEABLE",
          raw: pinCheck,
        },
        order: useOrder || null,
      };
    }

    if (!consignee.phone || consignee.phone.length < 10) {
      return {
        success: false,
        error: {
          message: `Missing or invalid phone for consignee on order ${order.orderNumber}`,
          code: "MISSING_PHONE",
        },
        order: useOrder || null,
      };
    }

    // Build products description (only product names) and total quantity/value
    const itemsSource = useOrder.items || [];
    const itemsList = [];
    let totalQty = 0;
    let totalValue = 0;
    for (const it of itemsSource) {
      // prefer populated product title, then fallback to name fields
      const rawName =
        (it.product && (it.product.title || it.product.name)) ||
        it.productName ||
        it.name ||
        "";
      // sanitize names that may have quantity appended like "Item x2" or " x2"
      const cleanedName =
        ("" + rawName).replace(/\s*(?:Item)?\s*x?\s*\d+\s*$/i, "").trim() ||
        "Product";
      const qty = Number(it.quantity || 0) || 1;
      const price = Number(it.price || 0) || 0;
      const total = Number(it.total != null ? it.total : price * qty) || 0;
      itemsList.push({ name: cleanedName, qty, price, total });
      totalQty += qty;
      totalValue += total;
    }

    const products_desc = itemsList.map((i) => i.name).join(" | ");

    // Build pickup_location using environment seller info; force name to match account if provided
    const pickup_location = {
      name: process.env.SELLER_NAME || "NS designs",
      add: process.env.SELLER_ADD || process.env.SELLER_ADDRESS || "",
      city: process.env.SELLER_CITY || "",
      state: process.env.SELLER_STATE || "",
      pin: process.env.SELLER_PINCODE || process.env.SELLER_PIN || "",
      phone: process.env.SELLER_PHONE || "",
    };
    // Ensure exact name if user required
    if (
      process.env.FORCE_PICKUP_NAME === "NS designs" ||
      !process.env.SELLER_NAME
    ) {
      pickup_location.name = "NS designs";
    }

    const defaultWeight = Number(process.env.DELHIVERY_DEFAULT_WEIGHT || 0.5);
    const package_type = process.env.DELHIVERY_PACKAGE_TYPE || "Packet";

    // Build CMU-compliant flattened shipment object (only allowed keys)
    const paymentMode =
      order.payment && order.payment.method === "cod" ? "COD" : "Prepaid";
    const sellerName = process.env.SELLER_NAME || "NS designs";
    const sellerAdd =
      process.env.SELLER_ADD || process.env.SELLER_ADDRESS || "";
    const sellerInv = order.orderNumber;
    const sellerInvDate = (order.createdAt || new Date())
      .toISOString()
      .slice(0, 10);

    const shipment = {
      // CMU approved keys only
      client_order_id: order.orderNumber,
      name: consignee.name,
      add: consignee.address,
      city: consignee.city,
      state: consignee.state,
      pin: consignee.pincode,
      country: "India",
      phone: consignee.phone,
      payment_mode: paymentMode,
      total_amount: Number(order.total || totalValue || 0),
      cod_amount:
        paymentMode === "COD" ? Number(order.total || totalValue || 0) : 0,
      seller_name: sellerName,
      seller_add: sellerAdd,
      seller_inv: sellerInv,
      seller_inv_date: sellerInvDate,
      products_desc,
      weight: defaultWeight,
      shipment_height: undefined,
      shipment_width: undefined,
      shipment_length: undefined,
    };

    const payload = { pickup_location, shipments: [shipment] };
    // CMU expects urlencoded format=json&data=<json>
    const formData = new URLSearchParams();
    formData.append("format", "json");
    formData.append("data", JSON.stringify(payload));

    console.debug(
      "Delhivery CMU payload (data):",
      JSON.stringify(payload, null, 2)
    );

    const res = await axios.post(CMU_URL, formData.toString(), {
      headers: {
        Authorization: `Token ${API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 15000,
    });

    const data = res && res.data ? res.data : {};

    // Log payload & raw response for debugging
    console.debug("Delhivery CMU sent payload:", JSON.stringify(payload));
    console.debug("Delhivery CMU raw response:", JSON.stringify(data));

    // Structured error helper
    function buildErrorObj(msg, p, raw) {
      return {
        message: msg,
        remarks:
          p && (p.remarks || p.remark) ? p.remarks || p.remark : undefined,
        packageStatus: p && p.status ? p.status : undefined,
        rawResponse: raw,
      };
    }

    // Per requirements: consider shipment successful ONLY when
    // data.success === true AND packages[0].status === 'Success' AND packages[0].waybill exists
    let awb = "";
    const pkgs = data && Array.isArray(data.packages) ? data.packages : [];
    const primaryPkg = pkgs.length ? pkgs[0] : null;

    if (data && data.success === true && primaryPkg) {
      const pkgStatus = (primaryPkg.status || "").toString();
      const waybill =
        primaryPkg.waybill ||
        primaryPkg.waybill_number ||
        primaryPkg.awb ||
        primaryPkg.waybill_no ||
        "";
      if (pkgStatus.toLowerCase() === "success" && waybill) {
        awb = waybill;
      } else {
        // Detect known carrier remarks such as insufficient prepaid balance
        const rawRemarks = (primaryPkg && (primaryPkg.remarks || primaryPkg.remark)) || (data && (data.remarks || data.remark)) || "";
        const insufficientBalance = /insufficient\s+balance|insufficient\s+funds|prepaid\s+balance/i.test(rawRemarks);
        const friendlyMessage = insufficientBalance
          ? "Delhivery prepaid balance is insufficient, please recharge wallet"
          : "Delhivery reported package not successful or missing waybill";

        const err = buildErrorObj(
          friendlyMessage,
          primaryPkg,
          data
        );
        if (insufficientBalance) err.code = "DELHIVERY_INSUFFICIENT_BALANCE";
        // persist failure info
        const shipmentDoc = {
          rawResponse: data,
          sentPayload: payload,
          carrier: "Delhivery",
          lastSyncedAt: new Date(),
          status: "failed",
        };
        const savedFail = await Order.findByIdAndUpdate(
          order._id,
          { $set: { shipment: shipmentDoc } },
          { new: true }
        ).catch((e) => {
          console.error("Failed to save failed shipmentDoc:", e);
          return null;
        });
        console.error(
          "Delhivery package indicated failure for order",
          order._id,
          err
        );
        return {
          success: false,
          error: err,
          order: savedFail || useOrder || null,
        };
      }
    } else {
      // No packages or data.success false: return structured error
      // Detect common remark for insufficient balance in the overall response
      const overallRemarks = (data && (data.remarks || data.remark || (data.message || ''))) || '';
      const insufficientBalanceOverall = /insufficient\s+balance|insufficient\s+funds|prepaid\s+balance/i.test(overallRemarks);
      const friendlyOverallMessage = insufficientBalanceOverall
        ? "Delhivery prepaid balance is insufficient, please recharge wallet"
        : "Delhivery did not return success === true or packages[] missing";

      const err = buildErrorObj(
        friendlyOverallMessage,
        primaryPkg,
        data
      );
      if (insufficientBalanceOverall) err.code = "DELHIVERY_INSUFFICIENT_BALANCE";
      const shipmentDoc = {
        rawResponse: data,
        sentPayload: payload,
        carrier: "Delhivery",
        lastSyncedAt: new Date(),
        status: "failed",
      };
      const savedFail = await Order.findByIdAndUpdate(
        order._id,
        { $set: { shipment: shipmentDoc } },
        { new: true }
      ).catch((e) => {
        console.error("Failed to save failed shipmentDoc:", e);
        return null;
      });
      console.error(
        "Delhivery create returned non-success for order",
        order._id,
        err
      );
      return {
        success: false,
        error: err,
        order: savedFail || useOrder || null,
      };
    }

    // Success: persist AWB to order (shipment and top-level fields)
    const shipmentDoc = {
      rawResponse: data,
      sentPayload: payload,
      carrier: "Delhivery",
      lastSyncedAt: new Date(),
      awb,
      waybill: awb,
      shipment_status: "created",
      trackingUrl: `https://track.delhivery.com/?waybill=${awb}`,
      status: "created",
    };
    const updatePayload = {
      $set: {
        shipment: shipmentDoc,
        status: "confirmed",
        awb: awb,
        trackingNumber: awb,
      },
    };
    const updated = await Order.findByIdAndUpdate(order._id, updatePayload, {
      new: true,
    }).catch((e) => {
      console.error("Failed to persist shipment to order:", e);
      return null;
    });
    console.debug(
      "Order shipment saved result:",
      updated && updated.shipment ? "ok" : "failed to update"
    );
    return {
      success: true,
      data: { awb },
      raw: data,
      order: updated || useOrder || null,
    };
  } catch (err) {
    console.error(
      "Delhivery createShipment error:",
      err && err.response
        ? err.response.data || err.response.statusText
        : err.message
    );
    const errorObj =
      err && err.response
        ? err.response.data || err.response.statusText
        : err.message;
    return {
      success: false,
      error: {
        message:
          typeof errorObj === "string" ? errorObj : JSON.stringify(errorObj),
      },
      order: null,
    };
  }
}

async function fetchTrackingForAwb(awb) {
  try {
    const url = `${TRACK_URL}?waybill=${encodeURIComponent(awb)}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Token ${API_KEY}` },
      timeout: 15000,
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error(
      "Delhivery fetchTracking error:",
      err && err.response
        ? err.response.data || err.response.statusText
        : err.message
    );
    return {
      success: false,
      error:
        err && err.response
          ? err.response.data || err.response.statusText
          : err.message,
    };
  }
}
async function checkPincodeServiceability(pincode) {
  try {
    if (!pincode) return { success: false, error: "No pincode provided" };
    const candidates = [
      `https://staging-express.delhivery.com/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(
        pincode
      )}`,
      `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(
        pincode
      )}`,
    ];

    let lastErr = null;
    for (const url of candidates) {
      try {
        const res = await require("axios").get(url, {
          headers: { Authorization: `Token ${API_KEY}` },
          timeout: 10000,
        });
        const data = res.data;
        if (Array.isArray(data)) {
          if (data.length === 0) {
            return {
              success: true,
              data: {
                deliverable: false,
                message: "Not serviceable (empty response)",
                raw: data,
              },
            };
          }

          const rec = data[0] || {};
          const remark = (rec.remark || "").toString().trim();
          const deliverable = remark === "";
          const message = remark ? remark : "Serviceable";

          return {
            success: true,
            data: {
              deliverable,
              estDays: rec.transit_days || rec.estDays,
              message,
              raw: data,
            },
          };
        }
        if (data && Array.isArray(data.delivery_codes)) {
          if (data.delivery_codes.length === 0) {
            return {
              success: true,
              data: {
                deliverable: false,
                message: "Not serviceable (delivery_codes empty)",
                raw: data,
              },
            };
          }

          const entry = data.delivery_codes[0] || {};
          const postal = entry.postal_code || entry.postal || entry;
          const remark =
            postal && (postal.remarks || postal.remark)
              ? (postal.remarks || postal.remark).toString().trim()
              : "";
          const hasPin =
            postal && (postal.pin || postal.postal_code || postal.pin_code);
          const deliverable = remark === "" && Boolean(hasPin);
          const message = remark
            ? remark
            : deliverable
            ? "Serviceable"
            : "Not serviceable";

          return {
            success: true,
            data: {
              deliverable,
              estDays: postal && (postal.transit_days || postal.estDays),
              message,
              raw: data,
            },
          };
        }
        if (data) {
          return {
            success: true,
            data: {
              deliverable: false,
              message: "Unknown response shape",
              raw: data,
            },
          };
        }
      } catch (err) {
        lastErr = {
          message: err && err.message ? err.message : String(err),
          status: err && err.response ? err.response.status : undefined,
          data: err && err.response ? err.response.data : undefined,
          url,
        };
        continue;
      }
    }

    return { success: false, error: lastErr || "No response from Delhivery" };
  } catch (err) {
    console.error(
      "checkPincodeServiceability error",
      err && err.message ? err.message : err
    );
    return {
      success: false,
      error: err && err.message ? err.message : "Unknown error",
    };
  }
}

async function createReversePickupForExchange(exchange) {
  try {
    const order = exchange.order || (exchange.orderId ? await Order.findById(exchange.orderId) : null);
    if (!order) return { success: false, error: 'Order not found on exchange' };

    // pickup_location should be customer's address (pickup from customer)
    const cAddr = order.shippingAddress || {};
    const pickup_location = {
      name: `${cAddr.firstName || ''} ${cAddr.lastName || ''}`.trim(),
      add: cAddr.street || '',
      city: cAddr.city || '',
      state: cAddr.state || '',
      pin: cAddr.zipCode || cAddr.pincode || '',
      phone: (cAddr.phone && String(cAddr.phone)) || ''
    };

    // consignee will be seller (return destination)
    const sellerName = process.env.SELLER_NAME || 'NS designs';
    const sellerAdd = process.env.SELLER_ADD || process.env.SELLER_ADDRESS || '';
    const shipment = {
      client_order_id: `${exchange._id}-reverse`,
      name: sellerName,
      add: sellerAdd,
      city: process.env.SELLER_CITY || '',
      state: process.env.SELLER_STATE || '',
      pin: process.env.SELLER_PINCODE || process.env.SELLER_PIN || '',
      country: 'India',
      phone: process.env.SELLER_PHONE || '',
      payment_mode: 'Prepaid',
      total_amount: 0,
      cod_amount: 0,
      seller_name: sellerName,
      seller_add: sellerAdd,
      seller_inv: order.orderNumber || '',
      seller_inv_date: (order.createdAt || new Date()).toISOString().slice(0,10),
      products_desc: (exchange.items && exchange.items.map(it => (it.product && it.product.name) || it.note || 'Item').join(' | ')) || 'Returned items',
      weight: Number(process.env.DELHIVERY_DEFAULT_WEIGHT || 0.5)
    };

    const payload = { pickup_location, shipments: [shipment] };
    const formData = new URLSearchParams();
    formData.append('format', 'json');
    formData.append('data', JSON.stringify(payload));

    const res = await axios.post(CMU_URL, formData.toString(), {
      headers: {
        Authorization: `Token ${API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000
    });

    const data = res && res.data ? res.data : {};
    const pkgs = data && Array.isArray(data.packages) ? data.packages : [];
    const primaryPkg = pkgs.length ? pkgs[0] : null;
    if (data && data.success === true && primaryPkg) {
      const waybill = primaryPkg.waybill || primaryPkg.awb || primaryPkg.waybill_number || '';
      if (waybill) {
        return { success: true, data: { awb: waybill }, raw: data };
      }
    }
    return { success: false, error: 'Delhivery did not return AWB for reverse pickup', raw: data };
  } catch (err) {
    console.error('createReversePickupForExchange error:', err && err.message ? err.message : err);
    return { success: false, error: err && err.response ? err.response.data || err.response.statusText : err.message };
  }
}

async function createForwardShipmentForExchange(exchange) {
  try {
    const order = exchange.order || (exchange.orderId ? await Order.findById(exchange.orderId) : null);
    if (!order) return { success: false, error: 'Order not found on exchange' };

    // pickup_location = seller (same as createShipmentForOrder)
    const pickup_location = {
      name: process.env.SELLER_NAME || 'NS designs',
      add: process.env.SELLER_ADD || process.env.SELLER_ADDRESS || '',
      city: process.env.SELLER_CITY || '',
      state: process.env.SELLER_STATE || '',
      pin: process.env.SELLER_PINCODE || process.env.SELLER_PIN || '',
      phone: process.env.SELLER_PHONE || ''
    };

    // consignee = customer
    const cAddr = order.shippingAddress || {};
    const shipment = {
      client_order_id: `${exchange._id}-forward`,
      name: `${cAddr.firstName || ''} ${cAddr.lastName || ''}`.trim(),
      add: cAddr.street || '',
      city: cAddr.city || '',
      state: cAddr.state || '',
      pin: cAddr.zipCode || cAddr.pincode || '',
      country: 'India',
      phone: (cAddr.phone && String(cAddr.phone)) || '',
      payment_mode: 'Prepaid',
      total_amount: 0,
      cod_amount: 0,
      seller_name: process.env.SELLER_NAME || 'NS designs',
      seller_add: process.env.SELLER_ADD || process.env.SELLER_ADDRESS || '',
      seller_inv: order.orderNumber || '',
      seller_inv_date: (order.createdAt || new Date()).toISOString().slice(0,10),
      products_desc: (exchange.items && exchange.items.map(it => (it.product && it.product.name) || it.note || 'Item').join(' | ')) || 'Replacement items',
      weight: Number(process.env.DELHIVERY_DEFAULT_WEIGHT || 0.5)
    };

    const payload = { pickup_location, shipments: [shipment] };
    const formData = new URLSearchParams();
    formData.append('format', 'json');
    formData.append('data', JSON.stringify(payload));

    const res = await axios.post(CMU_URL, formData.toString(), {
      headers: {
        Authorization: `Token ${API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000
    });

    const data = res && res.data ? res.data : {};
    const pkgs = data && Array.isArray(data.packages) ? data.packages : [];
    const primaryPkg = pkgs.length ? pkgs[0] : null;
    if (data && data.success === true && primaryPkg) {
      const waybill = primaryPkg.waybill || primaryPkg.awb || primaryPkg.waybill_number || '';
      if (waybill) {
        return { success: true, data: { awb: waybill }, raw: data, pickupDate: new Date() };
      }
    }
    return { success: false, error: 'Delhivery did not return AWB for forward shipment', raw: data };
  } catch (err) {
    console.error('createForwardShipmentForExchange error:', err && err.message ? err.message : err);
    return { success: false, error: err && err.response ? err.response.data || err.response.statusText : err.message };
  }
}

module.exports = {
  createShipmentForOrder,
  fetchTrackingForAwb,
  checkPincodeServiceability,
  createReversePickupForExchange,
  createForwardShipmentForExchange
};

