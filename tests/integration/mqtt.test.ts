/**
 * SIMA Platform - MQTT Integration Tests
 * 
 * Tests MQTT broker connectivity and pub/sub functionality
 * Run with: npm run test:integration
 */

import * as mqtt from 'mqtt';

describe('MQTT Integration Tests', () => {
  const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
  const TIMEOUT = 15000;

  let client: mqtt.MqttClient;

  afterEach((done) => {
    if (client && client.connected) {
      client.end(false, {}, done);
    } else {
      done();
    }
  });

  describe('Connection', () => {
    it('should connect to MQTT broker', (done) => {
      client = mqtt.connect(MQTT_URL, {
        clientId: `test-connection-${Date.now()}`,
        connectTimeout: TIMEOUT,
      });

      client.on('connect', () => {
        expect(client.connected).toBe(true);
        done();
      });

      client.on('error', (err) => {
        done(err);
      });
    }, TIMEOUT);

    it('should handle connection failure gracefully', (done) => {
      const badClient = mqtt.connect('mqtt://nonexistent-host:1883', {
        clientId: `test-fail-${Date.now()}`,
        connectTimeout: 2000,
        reconnectPeriod: 0,
      });

      const timeout = setTimeout(() => {
        badClient.end();
        // Connection attempt timed out as expected
        done();
      }, 3000);

      badClient.on('error', () => {
        clearTimeout(timeout);
        badClient.end();
        // Error received as expected for bad connection
        done();
      });
    }, 10000);
  });

  describe('Publish/Subscribe', () => {
    it('should publish and receive message on sima/test topic', (done) => {
      const testTopic = 'sima/test';
      const testMessage = `test-${Date.now()}`;

      client = mqtt.connect(MQTT_URL, {
        clientId: `test-pubsub-${Date.now()}`,
      });

      client.on('connect', () => {
        client.subscribe(testTopic, (err) => {
          if (err) {
            done(err);
            return;
          }

          client.publish(testTopic, testMessage);
        });
      });

      client.on('message', (topic, payload) => {
        if (topic === testTopic && payload.toString() === testMessage) {
          expect(topic).toBe(testTopic);
          expect(payload.toString()).toBe(testMessage);
          done();
        }
      });

      client.on('error', done);
    }, TIMEOUT);

    it('should publish to sima/assets/+/location topic', (done) => {
      const assetId = 'asset-123';
      const testTopic = `sima/assets/${assetId}/location`;
      const locationData = JSON.stringify({
        assetId,
        latitude: -0.1807,
        longitude: -78.4678,
        timestamp: new Date().toISOString(),
      });

      client = mqtt.connect(MQTT_URL, {
        clientId: `test-location-${Date.now()}`,
      });

      client.on('connect', () => {
        client.subscribe('sima/assets/+/location', (err) => {
          if (err) {
            done(err);
            return;
          }

          client.publish(testTopic, locationData);
        });
      });

      client.on('message', (topic, payload) => {
        const data = JSON.parse(payload.toString());
        expect(data.assetId).toBe(assetId);
        expect(data.latitude).toBeDefined();
        expect(data.longitude).toBeDefined();
        done();
      });

      client.on('error', done);
    }, TIMEOUT);

    it('should publish notifications to sima/notifications topic', (done) => {
      const testTopic = 'sima/notifications';
      const notification = JSON.stringify({
        type: 'ASSET_CREATED',
        payload: { assetId: 'asset-456', name: 'Test Asset' },
        timestamp: new Date().toISOString(),
      });

      client = mqtt.connect(MQTT_URL, {
        clientId: `test-notify-${Date.now()}`,
      });

      client.on('connect', () => {
        client.subscribe(testTopic, (err) => {
          if (err) {
            done(err);
            return;
          }

          client.publish(testTopic, notification);
        });
      });

      client.on('message', (topic, payload) => {
        if (topic === testTopic) {
          const data = JSON.parse(payload.toString());
          expect(data.type).toBe('ASSET_CREATED');
          expect(data.payload.assetId).toBe('asset-456');
          done();
        }
      });

      client.on('error', done);
    }, TIMEOUT);
  });

  describe('QoS Levels', () => {
    it('should support QoS 0 (at most once)', (done) => {
      const topic = 'sima/test/qos0';
      const message = 'qos0-test';

      client = mqtt.connect(MQTT_URL, {
        clientId: `test-qos0-${Date.now()}`,
      });

      client.on('connect', () => {
        client.subscribe(topic, { qos: 0 }, (err) => {
          if (err) return done(err);
          client.publish(topic, message, { qos: 0 });
        });
      });

      client.on('message', (t, p) => {
        if (t === topic) {
          expect(p.toString()).toBe(message);
          done();
        }
      });
    }, TIMEOUT);

    it('should support QoS 1 (at least once)', (done) => {
      const topic = 'sima/test/qos1';
      const message = 'qos1-test';

      client = mqtt.connect(MQTT_URL, {
        clientId: `test-qos1-${Date.now()}`,
      });

      client.on('connect', () => {
        client.subscribe(topic, { qos: 1 }, (err) => {
          if (err) return done(err);
          client.publish(topic, message, { qos: 1 });
        });
      });

      client.on('message', (t, p) => {
        if (t === topic) {
          expect(p.toString()).toBe(message);
          done();
        }
      });
    }, TIMEOUT);
  });
});
