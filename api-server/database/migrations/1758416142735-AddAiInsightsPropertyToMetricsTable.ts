import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiInsightsPropertyToMetricsTable1758416142735 implements MigrationInterface {
    name = 'AddAiInsightsPropertyToMetricsTable1758416142735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "subtotal" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "totalAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "paidAmount" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "paidAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "totalAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "subtotal" TYPE numeric`);
    }

}
