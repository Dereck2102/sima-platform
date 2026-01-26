import { MigrationInterface, QueryRunner } from "typeorm";

export class 001InitSchema1769447059846 implements MigrationInterface {
    name = '001InitSchema1769447059846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "lastName" character varying, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'OPERATOR', "isActive" boolean NOT NULL DEFAULT true, "phone" character varying, "department" character varying, "avatar" character varying, "lastLogin" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."assets_type_enum" AS ENUM('HARDWARE', 'SOFTWARE', 'NETWORK', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."assets_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED')`);
        await queryRunner.query(`CREATE TABLE "assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assetCode" character varying NOT NULL, "name" character varying NOT NULL, "type" "public"."assets_type_enum" NOT NULL, "status" "public"."assets_status_enum" NOT NULL DEFAULT 'ACTIVE', "description" character varying NOT NULL, "location" character varying, "assignedTo" character varying, "purchasePrice" numeric(10,2) NOT NULL, "purchaseDate" TIMESTAMP, "warrantyExpiration" TIMESTAMP, "serialNumber" character varying, "model" character varying, "manufacturer" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_000a1e0b494ed91ad742b8274b6" UNIQUE ("assetCode"), CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "userName" character varying NOT NULL, "action" "public"."audit_logs_action_enum" NOT NULL, "resourceType" character varying NOT NULL, "resourceId" character varying, "resourceName" character varying, "oldValues" jsonb, "newValues" jsonb, "ipAddress" character varying, "userAgent" character varying, "description" character varying, "severity" character varying NOT NULL DEFAULT 'INFO', "errorMessage" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_09013c9e439b8761355df5f827" ON "audit_logs" ("resourceType", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_0ec936941eb8556fcd7a1f0eae" ON "audit_logs" ("action", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_99e589da8f9e9326ee0d01a028" ON "audit_logs" ("userId", "createdAt") `);
        await queryRunner.query(`CREATE TYPE "public"."devices_status_enum" AS ENUM('ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR')`);
        await queryRunner.query(`CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceId" character varying NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "status" "public"."devices_status_enum" NOT NULL DEFAULT 'OFFLINE', "location" character varying NOT NULL, "lastSeen" TIMESTAMP, "metadata" jsonb NOT NULL DEFAULT '{}', "firmware" character varying, "ipAddress" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_666c9b59efda8ca85b29157152c" UNIQUE ("deviceId"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "telemetry_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceId" character varying NOT NULL, "metric" character varying NOT NULL, "value" numeric(10,2) NOT NULL, "tags" jsonb, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5869a8f8f281ae50220a1ffdb51" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reports_type_enum" AS ENUM('SUMMARY', 'DETAILED', 'ANALYTICS')`);
        await queryRunner.query(`CREATE TYPE "public"."reports_status_enum" AS ENUM('processing', 'completed', 'failed', 'queued')`);
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(120) NOT NULL, "description" character varying(500), "type" "public"."reports_type_enum" NOT NULL, "status" "public"."reports_status_enum" NOT NULL DEFAULT 'processing', "parameters" jsonb, "requestedBy" character varying, "generatedAt" TIMESTAMP, "downloadUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying(255) NOT NULL, "mimeType" character varying(120) NOT NULL, "size" bigint NOT NULL, "description" character varying(255), "url" character varying(512), "uploadedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP TABLE "reports"`);
        await queryRunner.query(`DROP TYPE "public"."reports_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reports_type_enum"`);
        await queryRunner.query(`DROP TABLE "telemetry_data"`);
        await queryRunner.query(`DROP TABLE "devices"`);
        await queryRunner.query(`DROP TYPE "public"."devices_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99e589da8f9e9326ee0d01a028"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ec936941eb8556fcd7a1f0eae"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09013c9e439b8761355df5f827"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TABLE "assets"`);
        await queryRunner.query(`DROP TYPE "public"."assets_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assets_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
