const API_BASE_URL = 'https://ecommerce-fashion-app-som7.vercel.app';

export async function logEvent(eventType: string, metadata: any = {}) {
  try {
    const payload = {
      eventType,
      page: metadata.page || window.location.pathname,
      metadata,
      sessionId: metadata.sessionId || (typeof window !== 'undefined' && window.sessionStorage ? sessionStorage.getItem('sessionId') : null),
    };

    await fetch(`${API_BASE_URL}/api/activity/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // swallow errors - analytics should be best-effort
    // console.debug('logEvent failed', err);
  }
}
