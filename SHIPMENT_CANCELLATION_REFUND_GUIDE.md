# Shipment Cancellation & Automatic Refund System

## Overview

This document describes the comprehensive shipment cancellation and automatic refund system integrated with Delhivery and Razorpay. The system automatically detects shipment cancellations from Delhivery and processes refunds through Razorpay with full idempotency, error handling, and edge case management.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Features](#features)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Endpoints](#api-endpoints)
6. [Environment Variables](#environment-variables)
7. [Edge Cases Handled](#edge-cases-handled)
8. [Testing Guide](#testing-guide)
9. [Deployment Checklist](#deployment-checklist)

---

## Architecture

### System Flow

```
Delhivery Cancellation → Webhook/Sync → Order Cancellation → Refund Processing → Email Notification
                                ↓                    ↓                 ↓
                          Database Update    Inventory Restore    Customer Email
```

### Components

1. **Delhivery Integration**
   - Webhook listener for real-time cancellation events
   - Scheduled sync job (runs every 6 hours by default)
   - Manual sync trigger via admin panel

2. **Refund Processing**
   - Automatic refund initiation for paid orders
   - Idempotency to prevent duplicate refunds
   - Retry mechanism for failed refunds
   - COD order handling (no refund needed)

3. **Database Tracking**
   - Order model with refund status fields
   - Comprehensive timeline tracking
   - Cancellation source tracking

4. **Email Notifications**
   - Order cancellation email
   - Refund notification email with status

---

## Features

### ✅ Implemented Features

1. **Automatic Cancellation Detection**
   - Real-time webhook from Delhivery
   - Scheduled status sync (every 6 hours)
   - Manual sync trigger from admin panel

2. **Intelligent Refund Processing**
   - Full refund for orders cancelled before pickup
   - Configurable shipping charge deduction for post-pickup cancellations
   - Automatic COD order handling (no refund)
   - Idempotency - prevents duplicate refunds

3. **Edge Case Handling**
   - Shipment cancelled before pickup
   - Shipment cancelled after pickup but before delivery
   - COD orders (no Razorpay refund needed)
   - Multiple cancellation attempts
   - Razorpay refund failure or delay
   - Already cancelled orders
   - Orders without payment

4. **Comprehensive Tracking**
   - Refund status tracking (none, initiated, processing, completed, failed)
   - Refund ID storage
   - Attempt counter
   - Error message logging
   - Timeline entries for all events

5. **Security & Quality**
   - Webhook signature verification
   - Transaction-safe operations
   - Rate limiting on refund retries (1 hour minimum)
   - Detailed logging for debugging
   - Admin-only endpoints with authentication

6. **User Experience**
   - Email notifications for cancellations
   - Email notifications for refunds
   - Real-time status updates in dashboard
   - Clear refund status display for customers
   - Admin panel controls

---

## Backend Implementation

### 1. Order Model Updates

**File:** `backend/models/Order.js`

**New Fields:**
```javascript
payment: {
  method: "cod" | "razorpay" | ...,
  status: "pending" | "paid" | "failed" | "refunded" | "partially_refunded",
  refund: {
    status: "none" | "initiated" | "processing" | "completed" | "failed" | "partial",
    refundId: String,      // Razorpay refund ID
    amount: Number,        // Refund amount
    reason: String,        // Refund reason
    initiatedAt: Date,
    completedAt: Date,
    failedAt: Date,
    errorMessage: String,
    attempts: Number,      // Retry counter
    lastAttemptAt: Date
  }
},
cancellationSource: "admin" | "customer" | "delhivery_webhook" | "delhivery_sync" | "system",
shipment: {
  cancelledAt: Date,
  cancellationReason: String,
  cancelledBeforePickup: Boolean
}
```

### 2. Payment Service

**File:** `backend/services/paymentService.js`

**Key Functions:**

- `processOrderRefund(order, options)` - Main refund processing function with idempotency
- `checkRefundStatus(refundId)` - Check refund status from Razorpay
- `refundPayment(paymentId, amount)` - Low-level Razorpay refund call

**Features:**
- Idempotency checking
- COD order detection
- Payment status validation
- Retry mechanism with rate limiting
- Comprehensive error handling

### 3. Shipment Cancellation Service

**File:** `backend/services/shipmentCancellationService.js`

**Key Functions:**

- `handleShipmentCancellation(order, options)` - Complete cancellation workflow
- `syncOrderStatusFromDelhivery(awb)` - Sync single order from Delhivery
- `bulkSyncOrdersFromDelhivery(options)` - Sync multiple orders

**Workflow:**
1. Validate order status
2. Update shipment details
3. Cancel order in database
4. Restore product inventory
5. Send cancellation email
6. Process refund if applicable
7. Send refund notification email

### 4. Delhivery Webhook

**File:** `backend/routes/delhiveryWebhook.js`

**Endpoint:** `POST /api/shipping/delhivery/webhook`

**Features:**
- Webhook signature verification
- Cancellation status detection
- Before/after pickup determination
- Automatic refund trigger

**Cancellation Indicators:**
```javascript
- "cancel", "cancelled"
- "rto" (Return to Origin)
- "returned", "rejected"
- "rts" (Return to Sender)
```

### 5. Admin Routes

**File:** `backend/routes/admin.js`

**New Endpoints:**

1. `POST /api/admin/orders/:id/cancel`
   - Cancel order with automatic refund
   - Body: `{ reason, skipRefund }`

2. `POST /api/admin/orders/:id/refund`
   - Manual refund processing
   - Body: `{ amount, reason, deductShipping }`

3. `POST /api/admin/orders/:id/sync-delhivery`
   - Sync single order from Delhivery

4. `POST /api/admin/orders/bulk-sync-delhivery`
   - Bulk sync all active orders
   - Body: `{ limit }`

### 6. Scheduled Jobs

**File:** `backend/jobs/delhiveryStatusSync.js`

**Cron Schedule:**
```javascript
// Default: Every 6 hours
'0 */6 * * *'

// Configure via env:
DELHIVERY_SYNC_CRON='0 */4 * * *'  // Every 4 hours
```

**Features:**
- Configurable via environment variables
- Can be disabled: `DELHIVERY_AUTO_SYNC_ENABLED=false`
- Manual trigger available via admin API

### 7. Email Service

**File:** `backend/utils/emailService.js`

**New Function:** `sendRefundNotificationEmail(email, firstName, order, refundResult)`

**Email Content:**
- Refund amount and status
- Refund ID
- Expected timeline (5-7 business days)
- Order summary

---

## Frontend Implementation

### 1. Dashboard (Admin)

**File:** `frontend/dashboard/src/components/OrderDetails.tsx`

**Features:**
- Refund status display with color coding
- Cancel order button with automatic refund
- Manual refund button
- Sync Delhivery status button
- Refund details (ID, amount, dates, errors)
- Loading states for all actions

**UI Elements:**
```tsx
// Refund Status Badge
completed -> Green
failed -> Red
processing -> Blue
initiated -> Yellow

// Action Buttons
- Cancel Order & Refund (red)
- Process Refund (yellow)
- Sync Delhivery Status (indigo)
```

### 2. Website (Customer)

**File:** `frontend/website/src/components/pages/OrderDetailsPage.tsx`

**Features:**
- Refund information card
- Status with visual indicators
- Refund timeline
- Expected refund date
- Helpful messages

**Refund Status Messages:**
- **Completed:** "Your refund was processed on [date]. It should reflect in your account within 5-7 business days."
- **Processing:** "Your refund is being processed. It will be credited to your original payment method within 5-7 business days."

---

## API Endpoints

### Admin Endpoints

All admin endpoints require authentication and admin role.

#### 1. Cancel Order with Refund

```http
POST /api/admin/orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Customer request",
  "skipRefund": false  // Optional, default false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "order": { /* order object */ },
    "refundProcessed": true,
    "refundDetails": {
      "refundId": "rfnd_xyz123",
      "amount": 1500.00,
      "status": "processing"
    }
  }
}
```

#### 2. Process Refund

```http
POST /api/admin/orders/:id/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500.00,  // Optional, default: full order total
  "reason": "Manual refund",
  "deductShipping": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "order": { /* order object */ },
    "refund": {
      "refundId": "rfnd_xyz123",
      "amount": 1500.00,
      "status": "processing",
      "isCOD": false,
      "notPaid": false,
      "alreadyRefunded": false
    }
  }
}
```

#### 3. Sync Delhivery Status

```http
POST /api/admin/orders/:id/sync-delhivery
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Status synced successfully",
  "data": {
    "order": { /* order object */ },
    "status": "Delivered",
    "cancellationDetected": false
  }
}
```

#### 4. Bulk Sync

```http
POST /api/admin/orders/bulk-sync-delhivery
Authorization: Bearer <token>
Content-Type: application/json

{
  "limit": 100  // Optional, default: 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk sync completed successfully",
  "data": {
    "total": 50,
    "synced": 48,
    "cancelled": 2,
    "errors": 0,
    "details": [/* array of sync results */]
  }
}
```

### Webhook Endpoint

#### Delhivery Webhook

```http
POST /api/shipping/delhivery/webhook
X-Delhivery-Secret: <webhook_secret>
Content-Type: application/json

{
  "awb": "AWB123456",
  "status": "Cancelled",
  "current_status": "Cancelled - Customer Request"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## Environment Variables

Add these to your `.env` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Delhivery Configuration
DELHIVERY_API_KEY=your_delhivery_api_key
DELHIVERY_WEBHOOK_SECRET=your_webhook_secret

# Delhivery Auto-Sync Configuration
DELHIVERY_AUTO_SYNC_ENABLED=true
DELHIVERY_SYNC_CRON=0 */6 * * *  # Every 6 hours
DELHIVERY_SYNC_LIMIT=100          # Max orders per sync

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourstore.com
ADMIN_EMAIL=admin@yourstore.com

# Frontend URL
FRONTEND_URL=https://yourstore.com
```

---

## Edge Cases Handled

### 1. Shipment Cancelled Before Pickup

**Scenario:** Order cancelled before courier pickup

**Handling:**
- Full refund (no shipping charge deduction)
- Inventory restored immediately
- Email sent with cancellation reason
- Timeline entry: "Cancelled before pickup"

### 2. Shipment Cancelled After Pickup

**Scenario:** Order cancelled during transit/RTO

**Handling:**
- Refund with optional shipping deduction
- Inventory restored
- Email sent
- Timeline entry: "Cancelled after pickup"

### 3. COD Orders

**Scenario:** Cash on Delivery order cancelled

**Handling:**
- No refund processing (skip Razorpay)
- Order status updated to cancelled
- Inventory restored
- Email sent without refund information
- Return: `{ success: true, isCOD: true }`

### 4. Multiple Cancellation Attempts

**Scenario:** Delhivery sends multiple webhook events

**Handling:**
- Idempotency check - if already cancelled, skip
- If refund already processed, return success
- Log additional timeline entries
- No duplicate refunds

### 5. Razorpay Refund Failure

**Scenario:** Razorpay API fails or times out

**Handling:**
- Order marked as cancelled
- Refund status set to "failed"
- Error message stored
- Timeline entry with error details
- Retry mechanism with 1-hour cooldown
- Admin notification via timeline

### 6. Refund Retry Logic

**Scenario:** Admin attempts refund after previous failure

**Handling:**
- Check last attempt timestamp
- Enforce 1-hour minimum between attempts
- Increment attempt counter
- Clear previous error message
- Process refund
- Update timeline

### 7. Already Paid, Already Refunded

**Scenario:** Admin attempts refund on already refunded order

**Handling:**
- Check refund status
- Return: `{ success: true, alreadyRefunded: true }`
- No API call to Razorpay
- No duplicate transaction

### 8. Not Yet Paid

**Scenario:** Order cancelled but payment pending

**Handling:**
- Skip refund processing
- Update order status
- Return: `{ success: true, notPaid: true }`
- No Razorpay call

### 9. Partial Refunds

**Scenario:** Admin wants to refund partial amount

**Handling:**
- Accept custom amount parameter
- Validate amount ≤ order total
- Process partial refund
- Update order status to "partially_refunded"
- Store refund amount

### 10. Webhook Authentication Failure

**Scenario:** Invalid or missing webhook secret

**Handling:**
- Verify X-Delhivery-Secret header
- Return 401 if invalid
- Log warning
- Do not process event

---

## Testing Guide

### 1. Test Webhook Cancellation

```bash
curl -X POST https://backend.flauntbynishi.com/api/shipping/delhivery/webhook \
  -H "Content-Type: application/json" \
  -H "X-Delhivery-Secret: your_webhook_secret" \
  -d '{
    "awb": "AWB123456",
    "status": "Cancelled",
    "current_status": "Cancelled - Customer Request"
  }'
```

### 2. Test Admin Cancellation

```bash
curl -X POST https://backend.flauntbynishi.com/api/admin/orders/ORDER_ID/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "reason": "Testing cancellation flow"
  }'
```

### 3. Test Manual Refund

```bash
curl -X POST https://backend.flauntbynishi.com/api/admin/orders/ORDER_ID/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "amount": 1500,
    "reason": "Testing refund",
    "deductShipping": false
  }'
```

### 4. Test Sync Delhivery

```bash
curl -X POST https://backend.flauntbynishi.com/api/admin/orders/ORDER_ID/sync-delhivery \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Test Bulk Sync

```bash
curl -X POST https://backend.flauntbynishi.com/api/admin/orders/bulk-sync-delhivery \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"limit": 10}'
```

### Test Scenarios Checklist

- [ ] Webhook cancellation for prepaid order
- [ ] Webhook cancellation for COD order
- [ ] Admin cancellation with reason
- [ ] Manual refund for paid order
- [ ] Refund for order with no payment
- [ ] Refund for already refunded order
- [ ] Partial refund
- [ ] Sync single order
- [ ] Bulk sync multiple orders
- [ ] Cancellation email sent
- [ ] Refund email sent
- [ ] Frontend dashboard shows refund status
- [ ] Frontend website shows refund status
- [ ] Inventory restored after cancellation
- [ ] Timeline entries created correctly

---

## Deployment Checklist

### Pre-Deployment

- [ ] Update `.env` with production credentials
- [ ] Set `DELHIVERY_WEBHOOK_SECRET` to secure random string
- [ ] Configure `FRONTEND_URL` to production domain
- [ ] Set `ADMIN_EMAIL` for alerts
- [ ] Enable `DELHIVERY_AUTO_SYNC_ENABLED=true`
- [ ] Set appropriate `DELHIVERY_SYNC_CRON` schedule

### Backend Deployment

- [ ] Install dependencies: `npm install node-cron`
- [ ] Run database migration (Order model updates)
- [ ] Test webhook endpoint accessibility
- [ ] Configure webhook URL in Delhivery dashboard
- [ ] Verify Razorpay API credentials
- [ ] Check email service configuration
- [ ] Start server and verify cron job initialization

### Frontend Deployment

- [ ] Deploy updated dashboard
- [ ] Deploy updated website
- [ ] Test order details page
- [ ] Verify refund status display
- [ ] Test admin action buttons

### Post-Deployment

- [ ] Monitor webhook logs
- [ ] Check cron job execution
- [ ] Verify email delivery
- [ ] Test cancellation flow end-to-end
- [ ] Monitor Razorpay refund dashboard
- [ ] Check database for proper refund tracking

### Monitoring

- [ ] Set up alerts for refund failures
- [ ] Monitor webhook success rate
- [ ] Track refund processing times
- [ ] Review error logs daily
- [ ] Check customer emails are being sent

---

## Troubleshooting

### Webhook Not Triggering

1. Check Delhivery dashboard webhook configuration
2. Verify webhook URL is publicly accessible
3. Check webhook secret matches environment variable
4. Review server logs for incoming requests
5. Test webhook manually with curl

### Refund Not Processing

1. Check order payment status (must be "paid")
2. Verify Razorpay credentials
3. Check refund attempt counter and timestamp
4. Review error message in order.payment.refund
5. Check Razorpay dashboard for failed transactions
6. Verify payment ID exists

### Emails Not Sending

1. Check email service credentials
2. Verify EMAIL_USER and EMAIL_PASS
3. Check spam folder
4. Review email service logs
5. Test email service with simple email

### Cron Job Not Running

1. Check server logs for initialization message
2. Verify `DELHIVERY_AUTO_SYNC_ENABLED=true`
3. Check cron schedule syntax
4. Manually trigger sync via admin API
5. Review system cron logs

---

## Support

For issues or questions:

1. Check server logs: `backend/logs/`
2. Review order timeline in database
3. Check Razorpay dashboard for refund status
4. Check Delhivery tracking for shipment status
5. Contact development team with order number and error details

---

## Changelog

### Version 1.0.0 (December 2025)

- Initial implementation
- Delhivery webhook integration
- Razorpay automatic refund
- Scheduled status sync
- Email notifications
- Admin panel controls
- Customer-facing status display

---

**Last Updated:** December 15, 2025
