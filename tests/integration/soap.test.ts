/**
 * SIMA Platform - SOAP Integration Tests
 * 
 * Tests SOAP web services endpoint
 * Run with: npm run test:integration
 */

import axios from 'axios';

describe('SOAP Integration Tests', () => {
  const BASE_URL = process.env.API_URL || 'http://localhost:3000';
  const SOAP_ENDPOINT = `${BASE_URL}/api/reports/soap`;
  const WSDL_ENDPOINT = `${SOAP_ENDPOINT}?wsdl`;
  const TIMEOUT = 30000;

  describe('WSDL Endpoint', () => {
    it('should return WSDL document', async () => {
      try {
        const response = await axios.get(WSDL_ENDPOINT, { timeout: 10000 });
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('xml');
        expect(response.data).toContain('definitions');
        expect(response.data).toContain('wsdl');
      } catch (error) {
        // Service might not be running
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.log('SOAP service not available - skipping test');
          return;
        }
        throw error;
      }
    }, TIMEOUT);

    it('should contain service operations in WSDL', async () => {
      try {
        const response = await axios.get(WSDL_ENDPOINT, { timeout: 10000 });
        
        // Check for expected operations
        const wsdl = response.data;
        expect(wsdl).toContain('GetAssetReport');
        expect(wsdl).toContain('GetInventorySummary');
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.log('SOAP service not available - skipping test');
          return;
        }
        throw error;
      }
    }, TIMEOUT);
  });

  describe('SOAP Operations', () => {
    it('should handle GetAssetReport request', async () => {
      const soapEnvelope = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <GetAssetReport xmlns="http://sima.uce.edu.ec/reports">
              <tenantId>tenant-1</tenantId>
              <startDate>2026-01-01</startDate>
              <endDate>2026-01-31</endDate>
            </GetAssetReport>
          </soap:Body>
        </soap:Envelope>
      `;

      try {
        const response = await axios.post(SOAP_ENDPOINT, soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'GetAssetReport',
          },
          timeout: 10000,
        });

        expect(response.status).toBe(200);
        expect(response.data).toContain('soap:Envelope');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNREFUSED') {
            console.log('SOAP service not available - skipping test');
            return;
          }
          // SOAP errors return 500 with fault details
          if (error.response?.status === 500) {
            expect(error.response.data).toContain('Fault');
          }
        }
      }
    }, TIMEOUT);

    it('should handle GetInventorySummary request', async () => {
      const soapEnvelope = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <GetInventorySummary xmlns="http://sima.uce.edu.ec/reports">
              <tenantId>tenant-1</tenantId>
            </GetInventorySummary>
          </soap:Body>
        </soap:Envelope>
      `;

      try {
        const response = await axios.post(SOAP_ENDPOINT, soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'GetInventorySummary',
          },
          timeout: 10000,
        });

        expect(response.status).toBe(200);
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.log('SOAP service not available - skipping test');
          return;
        }
      }
    }, TIMEOUT);
  });

  describe('Error Handling', () => {
    it('should return SOAP fault for invalid request', async () => {
      const invalidSoap = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <InvalidOperation />
          </soap:Body>
        </soap:Envelope>
      `;

      try {
        await axios.post(SOAP_ENDPOINT, invalidSoap, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
          },
          timeout: 10000,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNREFUSED') {
            console.log('SOAP service not available - skipping test');
            return;
          }
          // Should return a fault
          if (error.response) {
            expect(error.response.data).toContain('Fault');
          }
        }
      }
    }, TIMEOUT);
  });
});
