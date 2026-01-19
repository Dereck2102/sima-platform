import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

/**
 * MQTT Service for IoT device communication
 * Handles real-time device updates, sensor data, and commands
 */
@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient | null = null;
  private connected = false;

  // Topic patterns
  private readonly TOPICS = {
    ASSET_LOCATION: 'sima/assets/+/location',
    ASSET_STATUS: 'sima/assets/+/status',
    SENSOR_DATA: 'sima/sensors/+/data',
    COMMANDS: 'sima/commands/#',
    NOTIFICATIONS: 'sima/notifications',
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const mqttUrl = this.configService.get('MQTT_URL', 'mqtt://localhost:1883');
    const mqttEnabled = this.configService.get('MQTT_ENABLED', 'false') === 'true';

    if (!mqttEnabled) {
      this.logger.warn('MQTT is disabled. Set MQTT_ENABLED=true to enable.');
      return;
    }

    try {
      this.client = mqtt.connect(mqttUrl, {
        clientId: `sima-notification-${Date.now()}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        username: this.configService.get('MQTT_USERNAME'),
        password: this.configService.get('MQTT_PASSWORD'),
      });

      this.setupEventHandlers();
      await this.waitForConnection();
      await this.subscribeToTopics();
      
      this.logger.log('✅ MQTT client connected and subscribed');
    } catch (error) {
      this.logger.error('❌ Failed to initialize MQTT client:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.endAsync();
      this.logger.log('MQTT client disconnected');
    }
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.on('connect', () => {
      this.connected = true;
      this.logger.log('MQTT connected');
    });

    this.client.on('disconnect', () => {
      this.connected = false;
      this.logger.warn('MQTT disconnected');
    });

    this.client.on('error', (error) => {
      this.logger.error('MQTT error:', error);
    });

    this.client.on('message', (topic, payload) => {
      this.handleMessage(topic, payload);
    });
  }

  private async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MQTT connection timeout'));
      }, 10000);

      this.client?.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  private async subscribeToTopics() {
    if (!this.client || !this.connected) return;

    const topics = Object.values(this.TOPICS);
    
    for (const topic of topics) {
      await this.client.subscribeAsync(topic, { qos: 1 });
      this.logger.debug(`Subscribed to topic: ${topic}`);
    }
  }

  private handleMessage(topic: string, payload: Buffer) {
    try {
      const message = JSON.parse(payload.toString());
      this.logger.debug(`Received message on ${topic}:`, message);

      // Route message based on topic
      if (topic.includes('/location')) {
        this.handleLocationUpdate(topic, message);
      } else if (topic.includes('/status')) {
        this.handleStatusUpdate(topic, message);
      } else if (topic.includes('/sensors/')) {
        this.handleSensorData(topic, message);
      } else if (topic.includes('/commands/')) {
        this.handleCommand(topic, message);
      }
    } catch (error) {
      this.logger.error(`Failed to process message on ${topic}:`, error);
    }
  }

  private handleLocationUpdate(topic: string, message: any) {
    const assetId = this.extractAssetId(topic);
    this.logger.log(`Asset ${assetId} location updated: ${message.latitude}, ${message.longitude}`);
    // TODO: Update asset location in database
    // TODO: Emit event to WebSocket clients
  }

  private handleStatusUpdate(topic: string, message: any) {
    const assetId = this.extractAssetId(topic);
    this.logger.log(`Asset ${assetId} status updated: ${message.status}`);
    // TODO: Update asset status in database
  }

  private handleSensorData(topic: string, message: any) {
    const sensorId = this.extractSensorId(topic);
    this.logger.log(`Sensor ${sensorId} data: ${JSON.stringify(message)}`);
    // TODO: Store sensor data, trigger alerts if thresholds exceeded
  }

  private handleCommand(topic: string, message: any) {
    this.logger.log(`Command received on ${topic}: ${message.command}`);
    // TODO: Execute command
  }

  private extractAssetId(topic: string): string {
    const parts = topic.split('/');
    return parts[2] || 'unknown';
  }

  private extractSensorId(topic: string): string {
    const parts = topic.split('/');
    return parts[2] || 'unknown';
  }

  // Public methods for publishing messages

  /**
   * Publish notification to all subscribers
   */
  async publishNotification(notification: {
    type: string;
    title: string;
    message: string;
    tenantId: string;
    userId?: string;
    data?: any;
  }): Promise<void> {
    await this.publish(this.TOPICS.NOTIFICATIONS, notification);
  }

  /**
   * Publish asset location update
   */
  async publishAssetLocation(assetId: string, location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: string;
  }): Promise<void> {
    const topic = `sima/assets/${assetId}/location`;
    await this.publish(topic, {
      ...location,
      timestamp: location.timestamp || new Date().toISOString(),
    });
  }

  /**
   * Send command to device
   */
  async sendCommand(deviceId: string, command: {
    action: string;
    parameters?: any;
  }): Promise<void> {
    const topic = `sima/devices/${deviceId}/command`;
    await this.publish(topic, command);
  }

  private async publish(topic: string, message: any): Promise<void> {
    if (!this.client || !this.connected) {
      this.logger.warn('MQTT not connected, message not published');
      return;
    }

    try {
      await this.client.publishAsync(topic, JSON.stringify(message), { qos: 1 });
      this.logger.debug(`Published to ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish to ${topic}:`, error);
    }
  }

  /**
   * Check if MQTT is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
