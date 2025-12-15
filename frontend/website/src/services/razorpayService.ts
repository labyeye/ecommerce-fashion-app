// Razorpay service for frontend payment processing
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export class RazorpayService {
  private static instance: RazorpayService;
  private isScriptLoaded = false;

  static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  // Load Razorpay script dynamically
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (this.isScriptLoaded && window.Razorpay) {
        console.log('Razorpay script already loaded');
        resolve(true);
        return;
      }

      // Check if script already exists in DOM
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript && window.Razorpay) {
        console.log('Razorpay script found in DOM');
        this.isScriptLoaded = true;
        resolve(true);
        return;
      }

      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        this.isScriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  // Create Razorpay order
  async createOrder(orderData: any): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backend.flauntbynishi.com/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return data.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id: string;
  }): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backend.flauntbynishi.com/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      // Return the full parsed response so callers can inspect `success`,
      // `paymentStatus`, `shipmentStatus`, `shipmentError`, and `data`.
      // Backend sometimes returns the useful payload at top-level (for
      // shipment-created/failed flows) or nested under `data` for other
      // cases — returning the entire response object keeps the handling
      // consistent on the frontend and avoids `undefined` errors.
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Handle payment failure
  async handlePaymentFailure(orderId: string, error: any): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      await fetch('https://backend.flauntbynishi.com/api/payments/failure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          error: error,
        }),
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error reporting payment failure:', err);
    }
  }

  // Open Razorpay checkout
  async openCheckout(options: RazorpayOptions): Promise<void> {
    console.log('Opening Razorpay checkout...');
    const isLoaded = await this.loadRazorpayScript();
    
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not available');
    }

    console.log('Creating Razorpay instance with options:', options);
    
    try {
      const rzp = new window.Razorpay(options);
      console.log('Razorpay instance created, opening checkout...');
      rzp.open();
    } catch (error) {
      console.error('Error creating Razorpay instance:', error);
      throw new Error('Failed to open Razorpay checkout');
    }
  }
}

export default RazorpayService.getInstance();
