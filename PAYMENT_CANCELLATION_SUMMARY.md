# Payment Cancellation Flow - Implementation Summary

## Overview
Implemented a comprehensive payment cancellation and retry system for orders where payment fails or is cancelled.

## Features Implemented

### 1. PaymentCancelled Page (`/payment-cancelled`)
- **Location**: `/frontend/website/src/components/pages/PaymentCancelledPage.tsx`
- **Features**:
  - Displays order details (Order ID, status, total amount, items)
  - Shows countdown timer (12 hours from order creation)
  - "Pay Now" button to retry payment
  - Automatic navigation to order complete page on successful retry
  - Handles both pending and cancelled order states
  - Mobile-responsive design with Lucide icons

### 2. Retry Payment Backend Endpoint
- **Route**: `POST /api/payments/retry-payment`
- **Location**: `/backend/routes/payments.js`
- **Features**:
  - Validates order exists and belongs to user
  - Checks order status is 'pending'
  - Verifies payment window (12 hours) hasn't expired
  - Creates new Razorpay order without regenerating order ID
  - Returns Razorpay order details for frontend

### 3. Checkout Flow Update
- **Location**: `/frontend/website/src/components/pages/CheckoutPage.tsx`
- **Changes**:
  - Updated `modal.ondismiss` handler to navigate to PaymentCancelled page
  - Passes order ID via query parameter (`?orderId=...`)
  - Maintains existing order ID (no regeneration)

### 4. Automatic Order Cancellation Job
- **Location**: `/backend/jobs/cancelPendingOrders.js`
- **Schedule**: Runs every hour (configurable in server.js)
- **Features**:
  - Finds all pending orders older than 12 hours
  - Restocks product inventory (sizes and colors)
  - Updates order status to 'cancelled'
  - Sets cancellation reason: "Payment not completed within 12 hours"
  - Logs all operations for debugging

### 5. Server Integration
- **Location**: `/backend/server.js`
- **Changes**:
  - Added job scheduler after database connection
  - Initial run after 2 minutes of server startup
  - Subsequent runs every 60 minutes
  - Console logging for monitoring

### 6. App Routing
- **Location**: `/frontend/website/src/App.tsx`
- **Changes**:
  - Added PaymentCancelledPage import
  - Added route: `/payment-cancelled`

## User Flow

### Happy Path (Payment Retry Success)
1. User initiates payment at checkout
2. User cancels Razorpay modal → Redirected to PaymentCancelled page
3. Order remains in 'pending' status
4. User clicks "Pay Now" → New Razorpay modal opens
5. User completes payment → Order status updated to 'confirmed'
6. Redirected to OrderComplete page

### Timeout Path (12-Hour Expiry)
1. User initiates payment at checkout
2. User cancels Razorpay modal → Redirected to PaymentCancelled page
3. User doesn't retry payment for 12+ hours
4. Background job runs hourly, detects expired order
5. Order status changed to 'cancelled'
6. Product inventory restocked automatically
7. User sees "Order Cancelled" message on PaymentCancelled page

## Technical Details

### Order Status Flow
- **pending** → Order created, payment not completed (initial state)
- **confirmed** → Payment verified successfully (via retry or initial payment)
- **cancelled** → Payment not completed within 12 hours OR manually cancelled

### Inventory Management
- Inventory deducted when order created (during initial checkout)
- Inventory restocked when:
  - Order automatically cancelled after 12 hours
  - Handles both size-specific and color-specific stock
  - Prevents negative stock values

### Time Window
- 12 hours from order creation (`order.createdAt`)
- Countdown timer displayed on PaymentCancelled page
- Backend validates time window before allowing retry
- Automatic cancellation runs hourly to catch expired orders

### Data Preservation
- Order ID never regenerated (per requirement)
- Order document persists in database
- Order items, addresses, and totals remain unchanged
- Only payment details updated on successful retry

## Testing Checklist

### Frontend Tests
- [ ] PaymentCancelled page displays order details correctly
- [ ] Countdown timer shows accurate remaining time
- [ ] "Pay Now" button opens Razorpay modal
- [ ] Successful payment redirects to OrderComplete
- [ ] Cancelled orders show appropriate message
- [ ] Mobile responsive layout works correctly

### Backend Tests
- [ ] Retry endpoint rejects unauthorized users
- [ ] Retry endpoint rejects non-pending orders
- [ ] Retry endpoint rejects expired orders (>12 hours)
- [ ] Retry endpoint creates valid Razorpay order
- [ ] Payment verification updates order status to 'confirmed'

### Job Tests
- [ ] Cancellation job runs hourly
- [ ] Job correctly identifies orders older than 12 hours
- [ ] Inventory restocked for all order items
- [ ] Order status updated to 'cancelled'
- [ ] Job handles errors gracefully

## Environment Variables
No new environment variables required. Uses existing:
- `RAZORPAY_KEY_ID` - Razorpay API key
- `MONGODB_URI` - Database connection string

## Files Modified/Created

### Created
1. `/frontend/website/src/components/pages/PaymentCancelledPage.tsx`
2. `/backend/jobs/cancelPendingOrders.js`

### Modified
1. `/frontend/website/src/App.tsx` - Added route
2. `/frontend/website/src/components/pages/CheckoutPage.tsx` - Updated modal dismiss
3. `/backend/routes/payments.js` - Added retry endpoint
4. `/backend/server.js` - Added job scheduler

## Deployment Notes
- No database migrations required (uses existing Order schema)
- No additional dependencies needed
- Job runs in-process (no external scheduler required)
- Works with existing Razorpay integration
- Compatible with current Vercel deployment

## Future Enhancements (Optional)
- Email notifications when order cancelled
- Admin dashboard to view cancelled orders
- Configurable timeout duration (currently hardcoded 12 hours)
- Manual order cancellation by customer
- Payment failure analytics
