const axios = require('axios');

class TallyConnector {
  /**
   * Initialize Tally connector
   * @param {object} config { tally_host: 'http://localhost:9000', company_name: '...' }
   */
  constructor(config) {
    this.tallyHost = config.tally_host || 'http://localhost:9000';
    this.companyName = config.company_name;

    if (!this.companyName) {
      throw new Error('Tally integration requires the exact Tally Company Name');
    }
  }

  /**
   * Fetch invoices from Tally XML Server
   */
  async fetchInvoices() {
    // Tally ERP reads XML requests via HTTP POST
    const tallyXMLRequest = `
      <ENVELOPE>
        <HEADER>
          <VERSION>1</VERSION>
          <TALLYREQUEST>Export</TALLYREQUEST>
          <TYPE>Data</TYPE>
          <ID>Vouchers</ID>
        </HEADER>
        <BODY>
          <DESC>
            <STATICVARIABLES>
              <SVCOMPANYNAME>${this.companyName}</SVCOMPANYNAME>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
            <TDL>
              <TDLMESSAGE>
                <REPORT NAME="VouchersReport">
                  <USE>Vouchers Report</USE>
                </REPORT>
              </TDLMESSAGE>
            </TDL>
          </DESC>
        </BODY>
      </ENVELOPE>
    `.trim();

    try {
      const response = await axios.post(this.tallyHost, tallyXMLRequest, {
        headers: { 'Content-Type': 'text/xml' },
        timeout: 10000 // 10s timeout
      });

      // Tally returns XML data. Here we would parse XML to JSON.
      // For MVP testing, if local tally host is offline, we throw a clear error.
      return this.parseTallyXML(response.data);
    } catch (error) {
      console.error('❌ Tally Connection Error:', error.message);
      throw new Error(`Tally Server Offline: Unable to connect to local host ${this.tallyHost}. Ensure Tally is running and port is open.`);
    }
  }

  parseTallyXML(xmlData) {
    // In production, we use xml2js parser. Returning empty list or mocking return values if needed.
    return [];
  }

  normalize(rawInvoice) {
    return {
      invoice_number: rawInvoice.VOUCHERNUMBER || '',
      party_name: rawInvoice.PARTYNAME || '',
      amount: parseFloat(rawInvoice.AMOUNT) || 0,
      date: rawInvoice.DATE || new Date().toISOString()
    };
  }
}

module.exports = TallyConnector;
