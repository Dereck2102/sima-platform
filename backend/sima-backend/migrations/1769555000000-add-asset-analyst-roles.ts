import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetAnalystRoles1769555000000 implements MigrationInterface {
  name = 'AddAssetAnalystRoles1769555000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum_new" AS ENUM('SUPER_ADMIN', 'ADMIN', 'ASSET_MANAGER', 'ANALYST', 'MANAGER', 'OPERATOR', 'VIEWER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT, ALTER COLUMN "role" TYPE "public"."users_role_enum_new" USING "role"::text::"public"."users_role_enum_new"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'OPERATOR'`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."users_role_enum_new" RENAME TO "users_role_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "users" SET "role" = 'OPERATOR' WHERE "role" IN ('ASSET_MANAGER', 'ANALYST')`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum_old" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT, ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::text::"public"."users_role_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'OPERATOR'`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
  }
}
