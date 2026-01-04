import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: true }) // Agrega createdAt y updatedAt automático
export class AuditLog {
  @Prop({ required: true })
  entityId: string; // El ID del activo (o lo que sea)

  @Prop({ required: true })
  entityType: string; // 'ASSET', 'USER', etc.

  @Prop({ required: true })
  action: string; // 'CREATED', 'UPDATED', 'DELETED'

  @Prop({ type: Object }) // Guardamos el JSON completo del cambio
  payload: any;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);