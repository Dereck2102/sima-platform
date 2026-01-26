// Centralized Kafka topics for inter-service communication.
export enum KAFKA_TOPICS {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  ASSET_CREATED = 'asset.created',
  ASSET_UPDATED = 'asset.updated',
  AUDIT_LOG = 'audit.log',
  TELEMETRY = 'telemetry.data',
  NOTIFICATION = 'notification.send',
}
