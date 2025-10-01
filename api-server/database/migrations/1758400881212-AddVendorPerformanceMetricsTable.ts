import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVendorPerformanceMetricsTable1758400881212 implements MigrationInterface {
    name = 'AddVendorPerformanceMetricsTable1758400881212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vendor_performance_metrics" ("createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalSpend" numeric(10,2) NOT NULL, "avgInvoiceAmount" numeric(10,2) NOT NULL, "invoiceCount" integer NOT NULL, "paymentConsistency" numeric(5,2) NOT NULL, "spendTrend" character varying NOT NULL, "seasonalPatterns" json NOT NULL, "complianceScore" numeric(5,2) NOT NULL, "analysisDate" date NOT NULL, "analysisPeriodDays" integer NOT NULL, "vendorId" uuid, "userId" uuid, CONSTRAINT "REL_9cdb603ebad973361c670e8a3b" UNIQUE ("vendorId"), CONSTRAINT "PK_e391f9ce103efb2cde9e7760bdd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "subtotal" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "totalAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "paidAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vendor_performance_metrics" ADD CONSTRAINT "FK_9cdb603ebad973361c670e8a3b4" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_performance_metrics" ADD CONSTRAINT "FK_dc1d6142a42bcbada6d5f85cddd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_performance_metrics" DROP CONSTRAINT "FK_dc1d6142a42bcbada6d5f85cddd"`);
        await queryRunner.query(`ALTER TABLE "vendor_performance_metrics" DROP CONSTRAINT "FK_9cdb603ebad973361c670e8a3b4"`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "paidAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "totalAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ALTER COLUMN "subtotal" TYPE numeric`);
        await queryRunner.query(`DROP TABLE "vendor_performance_metrics"`);
    }

}
