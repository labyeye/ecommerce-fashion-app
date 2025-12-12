const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Job to automatically cancel pending orders after 12 hours
 * and restock product inventory
 */
async function cancelPendingOrders() {
  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // Find all pending orders created more than 12 hours ago
    const pendingOrders = await Order.find({
      status: 'pending',
      'payment.status': 'pending',
      createdAt: { $lt: twelveHoursAgo },
    });

    console.log(`Found ${pendingOrders.length} pending orders to cancel`);

    for (const order of pendingOrders) {
      try {
        // Restock inventory for each item
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          
          if (!product) {
            console.warn(`Product ${item.product} not found for order ${order._id}`);
            continue;
          }

          // Find the specific size and color combination
          if (item.size) {
            const sizeIndex = product.sizes.findIndex(
              (s) => s.size === item.size
            );
            if (sizeIndex !== -1) {
              product.sizes[sizeIndex].stock += item.quantity;
            }
          }

          if (item.color) {
            const colorIndex = product.colors.findIndex(
              (c) => c.name === item.color
            );
            if (colorIndex !== -1) {
              product.colors[colorIndex].stock += item.quantity;
            }
          }

          await product.save();
          console.log(
            `Restocked ${item.quantity} units for product ${product.name} (Order: ${order.orderNumber})`
          );
        }

        // Update order status to cancelled
        order.status = 'cancelled';
        order.payment.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = 'Payment not completed within 12 hours';
        
        await order.save();
        
        console.log(`Order ${order.orderNumber} automatically cancelled and inventory restocked`);
      } catch (itemError) {
        console.error(`Error processing order ${order._id}:`, itemError);
      }
    }

    return {
      success: true,
      cancelledCount: pendingOrders.length,
      message: `Successfully cancelled ${pendingOrders.length} pending orders`,
    };
  } catch (error) {
    console.error('Error in cancelPendingOrders job:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { cancelPendingOrders };
