export async function trackEvent(event: string, page?: string, meta?: any) {
  try {
    // keep payload minimal, don't send sensitive info
    await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, page, meta }),
    });
  } catch (err) {
    // swallow errors — analytics should not break UX
    // console.debug('Analytics track failed', err);
  }
}
