const cron = require('node-cron');
const { bulkSyncOrdersFromDelhivery } = require('../services/shipmentCancellationService');

/**
 * Scheduled job to sync order statuses from Delhivery
 * Runs every 6 hours to check for cancellations and status updates
 */
function initializeDelhiverySync() {
  // Check if sync is enabled via environment variable
  const syncEnabled = process.env.DELHIVERY_AUTO_SYNC_ENABLED !== 'false';
  
  if (!syncEnabled) {
    console.log('Delhivery auto-sync is disabled via DELHIVERY_AUTO_SYNC_ENABLED=false');
    return;
  }

  // Get sync interval from environment (default: every 6 hours)
  // Cron format: '0 */6 * * *' = every 6 hours
  // '0 */4 * * *' = every 4 hours
  // '0 */2 * * *' = every 2 hours
  const cronSchedule = process.env.DELHIVERY_SYNC_CRON || '0 */6 * * *';
  
  console.log(`Initializing Delhivery auto-sync with schedule: ${cronSchedule}`);

  // Schedule the job
  cron.schedule(cronSchedule, async () => {
    console.log('Starting scheduled Delhivery bulk sync...');
    
    try {
      const result = await bulkSyncOrdersFromDelhivery({
        limit: parseInt(process.env.DELHIVERY_SYNC_LIMIT || '100')
      });

      if (result.success) {
        console.log('Scheduled Delhivery bulk sync completed successfully');
        console.log(`Results: ${result.results.synced}/${result.results.total} synced, ${result.results.cancelled} cancelled, ${result.results.errors} errors`);
        
        // Log any cancellations detected
        if (result.results.cancelled > 0) {
          console.log(`⚠️ ${result.results.cancelled} order cancellations detected and processed`);
        }
      } else {
        console.error('Scheduled Delhivery bulk sync failed:', result.error);
      }
    } catch (error) {
      console.error('Error in scheduled Delhivery sync:', error);
    }
  });

  console.log('Delhivery auto-sync job scheduled successfully');
}

/**
 * Manual trigger for Delhivery sync (can be called via admin endpoint)
 */
async function triggerManualSync(options = {}) {
  console.log('Manual Delhivery sync triggered');
  
  try {
    const result = await bulkSyncOrdersFromDelhivery({
      limit: options.limit || parseInt(process.env.DELHIVERY_SYNC_LIMIT || '100')
    });

    return result;
  } catch (error) {
    console.error('Error in manual Delhivery sync:', error);
    return {
      success: false,
      error: error.message || 'Manual sync failed'
    };
  }
}

module.exports = {
  initializeDelhiverySync,
  triggerManualSync
};
