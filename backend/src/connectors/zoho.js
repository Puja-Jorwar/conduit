const axios = require('axios');

class ZohoConnector {
  /**
   * Initialize Zoho CRM client
   * @param {object} config { client_id: '...', client_secret: '...', refresh_token: '...' }
   */
  constructor(config) {
    if (!config.client_id || !config.client_secret || !config.refresh_token) {
      throw new Error('Zoho CRM integration requires client_id, client_secret, and refresh_token');
    }

    this.clientId = config.client_id;
    this.clientSecret = config.client_secret;
    this.refreshToken = config.refresh_token;
    this.accessToken = null;
  }

  /**
   * Request a fresh access token using the refresh token
   */
  async refreshAccessToken() {
    try {
      const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
        params: {
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
        }
      });

      if (!response.data.access_token) {
        throw new Error(response.data.error || 'Failed to refresh Zoho access token');
      }

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('❌ Zoho Token Refresh Error:', error.response?.data || error.message);
      throw new Error(`Zoho Auth Error: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Fetch contacts from Zoho CRM
   * @returns {Promise<Array>} List of contacts
   */
  async fetchContacts() {
    if (!this.accessToken) {
      await this.refreshAccessToken();
    }

    try {
      const response = await axios.get('https://www.zohoapis.in/crm/v3/Contacts', {
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`
        },
        params: {
          per_page: 50 // Limit batches to 50
        }
      });

      return response.data.data || [];
    } catch (error) {
      // If unauthorized, token might have expired, try once more after refresh
      if (error.response?.status === 401) {
        console.log('🔄 Zoho access token expired. Refreshing token and retrying...');
        await this.refreshAccessToken();
        
        const retryResponse = await axios.get('https://www.zohoapis.in/crm/v3/Contacts', {
          headers: {
            Authorization: `Zoho-oauthtoken ${this.accessToken}`
          }
        });
        return retryResponse.data.data || [];
      }

      console.error('❌ Zoho Fetch Error:', error.response?.data || error.message);
      throw new Error(`Zoho API Error: ${error.message}`);
    }
  }

  /**
   * Normalize Zoho CRM Contact structure into standardized format
   */
  normalize(raw) {
    return {
      contact_id: raw.id,
      name: raw.Full_Name || `${raw.First_Name || ''} ${raw.Last_Name || ''}`.trim(),
      email: raw.Email || '',
      phone: raw.Phone || raw.Mobile || '',
      company: raw.Account_Name?.name || '',
      created_at: raw.Created_Time
    };
  }
}

module.exports = ZohoConnector;
