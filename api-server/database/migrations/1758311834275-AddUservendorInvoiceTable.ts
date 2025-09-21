import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUservendorInvoiceTable1758311834275 implements MigrationInterface {
    name = 'AddUservendorInvoiceTable1758311834275'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clerkId" character varying(255) NOT NULL, CONSTRAINT "UQ_59318cd1fa4b0f8fdea9232d041" UNIQUE ("clerkId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor" ("createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "address" character varying(300) NOT NULL, "phone" character varying(25), "email" character varying(100), "userId" uuid, CONSTRAINT "PK_931a23f6231a57604f5a0e32780" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor_invoice" ("createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceNumber" character varying(255) NOT NULL, "date" date, "dueDate" date, "subtotal" numeric NOT NULL, "totalAmount" numeric NOT NULL, "paymentTerms" character varying(100), "earlyPayDiscount" numeric(2), "userId" uuid, "vendorId" uuid, CONSTRAINT "PK_5fdd8bd3b210c59d4d054d02454" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vendor" ADD CONSTRAINT "FK_ac9f553292e6053115be74e4e59" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ADD CONSTRAINT "FK_cd0202102e7a2afb981552ae926" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" ADD CONSTRAINT "FK_25f4637a63f56941797786cfa02" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_invoice" DROP CONSTRAINT "FK_25f4637a63f56941797786cfa02"`);
        await queryRunner.query(`ALTER TABLE "vendor_invoice" DROP CONSTRAINT "FK_cd0202102e7a2afb981552ae926"`);
        await queryRunner.query(`ALTER TABLE "vendor" DROP CONSTRAINT "FK_ac9f553292e6053115be74e4e59"`);
        await queryRunner.query(`DROP TABLE "vendor_invoice"`);
        await queryRunner.query(`DROP TABLE "vendor"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
