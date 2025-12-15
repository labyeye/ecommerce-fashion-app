export async function trackEvent(event: string, page?: string, meta?: any) {
  try {
    // keep payload minimal, don't send sensitive info
    // legacy analytics endpoint
    await fetch('https://backend.flauntbynishi.com/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, page, meta }),
    });

    // also send to new activity logging endpoint (best-effort)
    try {
      await fetch('/api/activity/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: event, page, metadata: meta }),
      });
    } catch (e) {
      // ignore
    }
  } catch (err) {
    // swallow errors — analytics should not break UX
    // console.debug('Analytics track failed', err);
  }
}
