import { Controller, Post, Body, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import * as xml2js from 'xml2js';

/**
 * SOAP Controller for SIMA Platform
 * Provides SOAP/XML web service for legacy system integration
 * 
 * WSDL available at: /api/reports/soap?wsdl
 */
@ApiTags('SOAP Services')
@Controller('reports/soap')
export class SoapController {
  
  /**
   * SOAP endpoint for report generation
   * Accepts SOAP envelope and returns SOAP response
   */
  @Post()
  @Header('Content-Type', 'application/xml')
  @ApiOperation({ summary: 'SOAP endpoint for legacy integration' })
  @ApiBody({ description: 'SOAP envelope XML' })
  @ApiResponse({ status: 200, description: 'SOAP response XML' })
  async handleSoapRequest(
    @Body() body: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      // Parse SOAP envelope
      const parser = new xml2js.Parser({ explicitArray: false });
      const envelope = await parser.parseStringPromise(body);
      
      // Extract SOAP body
      const soapBody = envelope['soap:Envelope']?.['soap:Body'] || 
                       envelope['soapenv:Envelope']?.['soapenv:Body'] ||
                       envelope['Envelope']?.['Body'];
      
      if (!soapBody) {
        res.status(400).send(this.createSoapFault('Invalid SOAP envelope'));
        return;
      }

      // Route to appropriate operation
      let response: string;
      
      if (soapBody['GetAssetReport']) {
        response = await this.handleGetAssetReport(soapBody['GetAssetReport']);
      } else if (soapBody['GetInventorySummary']) {
        response = await this.handleGetInventorySummary(soapBody['GetInventorySummary']);
      } else if (soapBody['GetAssetByLocation']) {
        response = await this.handleGetAssetByLocation(soapBody['GetAssetByLocation']);
      } else {
        response = this.createSoapFault('Unknown SOAP operation');
      }

      res.send(response);
    } catch (error) {
      res.status(500).send(this.createSoapFault(`Server error: ${error.message}`));
    }
  }

  /**
   * Generate WSDL for the SOAP service
   */
  @Post('wsdl')
  @Header('Content-Type', 'application/xml')
  @ApiOperation({ summary: 'Get WSDL definition' })
  async getWsdl(@Res() res: Response): Promise<void> {
    res.send(this.generateWsdl());
  }

  private async handleGetAssetReport(params: any): Promise<string> {
    const tenantId = params.tenantId || 'default';
    const reportType = params.reportType || 'INVENTORY';
    
    // Simulated report data
    const reportData = {
      reportId: `RPT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      tenantId,
      reportType,
      totalAssets: 150,
      totalValue: 250000,
      assetsByStatus: {
        active: 120,
        maintenance: 20,
        disposed: 10,
      },
    };

    return this.createSoapResponse('GetAssetReportResponse', reportData);
  }

  private async handleGetInventorySummary(params: any): Promise<string> {
    const tenantId = params.tenantId || 'default';
    
    const summaryData = {
      tenantId,
      generatedAt: new Date().toISOString(),
      summary: {
        totalItems: 150,
        totalValue: 250000,
        categories: [
          { name: 'Electronics', count: 50, value: 100000 },
          { name: 'Furniture', count: 70, value: 80000 },
          { name: 'Vehicles', count: 30, value: 70000 },
        ],
      },
    };

    return this.createSoapResponse('GetInventorySummaryResponse', summaryData);
  }

  private async handleGetAssetByLocation(params: any): Promise<string> {
    const locationId = params.locationId || 'LOC-001';
    
    const locationData = {
      locationId,
      locationName: 'Main Building',
      assets: [
        { id: 'ASSET-001', name: 'Laptop Dell', status: 'ACTIVE' },
        { id: 'ASSET-002', name: 'Projector Epson', status: 'ACTIVE' },
        { id: 'ASSET-003', name: 'Office Chair', status: 'MAINTENANCE' },
      ],
    };

    return this.createSoapResponse('GetAssetByLocationResponse', locationData);
  }

  private createSoapResponse(operation: string, data: any): string {
    const builder = new xml2js.Builder({
      rootName: 'soap:Envelope',
      headless: true,
      renderOpts: { pretty: true },
    });

    const envelope = {
      '$': {
        'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:sima': 'http://sima-platform.uce.edu.ec/soap',
      },
      'soap:Body': {
        [`sima:${operation}`]: data,
      },
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.buildObject(envelope)}`;
  }

  private createSoapFault(message: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>${message}</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;
  }

  private generateWsdl(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://sima-platform.uce.edu.ec/soap"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             name="SIMAReportService"
             targetNamespace="http://sima-platform.uce.edu.ec/soap">

  <types>
    <xsd:schema targetNamespace="http://sima-platform.uce.edu.ec/soap">
      <xsd:element name="GetAssetReport">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="tenantId" type="xsd:string"/>
            <xsd:element name="reportType" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <xsd:element name="GetInventorySummary">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="tenantId" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <xsd:element name="GetAssetByLocation">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="locationId" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>

  <message name="GetAssetReportRequest">
    <part name="parameters" element="tns:GetAssetReport"/>
  </message>
  
  <message name="GetAssetReportResponse">
    <part name="parameters" element="tns:GetAssetReportResponse"/>
  </message>

  <portType name="SIMAReportPortType">
    <operation name="GetAssetReport">
      <input message="tns:GetAssetReportRequest"/>
      <output message="tns:GetAssetReportResponse"/>
    </operation>
  </portType>

  <binding name="SIMAReportBinding" type="tns:SIMAReportPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetAssetReport">
      <soap:operation soapAction="http://sima-platform.uce.edu.ec/soap/GetAssetReport"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <service name="SIMAReportService">
    <port name="SIMAReportPort" binding="tns:SIMAReportBinding">
      <soap:address location="http://localhost:3000/api/reports/soap"/>
    </port>
  </service>
</definitions>`;
  }
}
