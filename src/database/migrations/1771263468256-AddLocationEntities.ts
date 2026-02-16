import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationEntities1771263468256 implements MigrationInterface {
    name = 'AddLocationEntities1771263468256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "c0"."cities" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "stateId" integer NOT NULL, "latitude" numeric, "longitude" numeric, CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a0ae8d83b7d32359578c486e7f" ON "c0"."cities" ("name") `);
        await queryRunner.query(`CREATE TABLE "c0"."states" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "countryId" integer NOT NULL, CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fe52f02449eaf27be2b2cb7acd" ON "c0"."states" ("name") `);
        await queryRunner.query(`CREATE TABLE "c0"."countries" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "iso" character varying(3) NOT NULL, CONSTRAINT "UQ_a1c0d005a87cc318b4ddda4d925" UNIQUE ("iso"), CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fa1376321185575cf2226b1491" ON "c0"."countries" ("name") `);
        await queryRunner.query(`CREATE TABLE "c0"."timezones" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "abbreviation" character varying(10) NOT NULL, "gmtOffset" integer NOT NULL, "gmtOffsetName" character varying(20) NOT NULL, "tzName" character varying NOT NULL, "zoneName" character varying NOT NULL, "countryId" integer NOT NULL, CONSTRAINT "PK_589871db156cc7f92942334ab7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b6248bf632ed7b73d6e96a2621" ON "c0"."timezones" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c7ec626ba5f8d4aa87ebb8d113" ON "c0"."timezones" ("zoneName", "countryId") `);
        await queryRunner.query(`ALTER TABLE "c0"."cities" ADD CONSTRAINT "FK_ded8a17cd090922d5bac8a2361f" FOREIGN KEY ("stateId") REFERENCES "c0"."states"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."states" ADD CONSTRAINT "FK_76ac7edf8f44e80dff569db7321" FOREIGN KEY ("countryId") REFERENCES "c0"."countries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."timezones" ADD CONSTRAINT "FK_978bd92c90a5e7cd9bd1150b304" FOREIGN KEY ("countryId") REFERENCES "c0"."countries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "c0"."timezones" DROP CONSTRAINT "FK_978bd92c90a5e7cd9bd1150b304"`);
        await queryRunner.query(`ALTER TABLE "c0"."states" DROP CONSTRAINT "FK_76ac7edf8f44e80dff569db7321"`);
        await queryRunner.query(`ALTER TABLE "c0"."cities" DROP CONSTRAINT "FK_ded8a17cd090922d5bac8a2361f"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_c7ec626ba5f8d4aa87ebb8d113"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_b6248bf632ed7b73d6e96a2621"`);
        await queryRunner.query(`DROP TABLE "c0"."timezones"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_fa1376321185575cf2226b1491"`);
        await queryRunner.query(`DROP TABLE "c0"."countries"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_fe52f02449eaf27be2b2cb7acd"`);
        await queryRunner.query(`DROP TABLE "c0"."states"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_a0ae8d83b7d32359578c486e7f"`);
        await queryRunner.query(`DROP TABLE "c0"."cities"`);
    }

}
