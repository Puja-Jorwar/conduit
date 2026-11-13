const axios = require('axios');

class RazorpayConnector {
  /**
   * Initialize Razorpay client with key & secret
   * @param {object} config { key_id: '...', key_secret: '...' }
   */
  constructor(config) {
    if (!config.key_id || !config.key_secret) {
      throw new Error('Razorpay integration requires key_id and key_secret');
    }
    
    this.keyId = config.key_id;
    this.keySecret = config.key_secret;
    
    this.client = axios.create({
      baseURL: 'https://api.razorpay.com/v1',
      auth: {
        username: this.keyId,
        password: this.keySecret
      },
      timeout: 10000 // 10 second timeout
    });
  }

  /**
   * Fetch payments within a Unix timestamp range
   * @param {number} fromTimestamp Unix timestamp in seconds
   * @param {number} toTimestamp Unix timestamp in seconds
   * @returns {Promise<Array>} List of payments
   */
  async fetchPayments(fromTimestamp, toTimestamp) {
    try {
      const response = await this.client.get('/payments', {
        params: {
          from: fromTimestamp,
          to: toTimestamp,
          count: 100 // Fetch up to 100 payments per batch
        }
      });
      
      return response.data.items || [];
    } catch (error) {
      console.error('❌ Razorpay Fetch Error:', error.response?.data || error.message);
      throw new Error(`Razorpay API Error: ${error.response?.data?.error?.description || error.message}`);
    }
  }

  /**
   * Normalize raw Razorpay payment data to standard schema
   * @param {object} raw
   * @returns {object} Standardized payment object
   */
  normalize(raw) {
    const amountInRupees = raw.amount / 100; // Razorpay uses paise
    const gstRate = 0.18; // Standard 18% GST for services in India
    
    // Calculate GST breakdown (assumes fee + tax details)
    const baseAmount = amountInRupees / (1 + gstRate);
    const gstAmount = amountInRupees - baseAmount;

    return {
      payment_id: raw.id,
      amount: amountInRupees,
      currency: raw.currency,
      status: raw.status,
      method: raw.method,
      email: raw.email,
      contact: raw.contact,
      fee: raw.fee ? raw.fee / 100 : 0,
      tax: raw.tax ? raw.tax / 100 : 0,
      gst_amount: parseFloat(gstAmount.toFixed(2)),
      description: raw.description || '',
      created_at: new Date(raw.created_at * 1000).toISOString()
    };
  }
}

module.exports = RazorpayConnector;
