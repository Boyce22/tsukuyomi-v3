import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueIndex1766770950790 implements MigrationInterface {
    name = 'AddUniqueIndex1766770950790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "c0"."IDX_ca1f9ef451ff9cba38945967ab"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_c9cd91a6960157ee562c2dc861"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ca1f9ef451ff9cba38945967ab" ON "c0"."chapters" ("slug") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c9cd91a6960157ee562c2dc861" ON "c0"."mangas" ("slug") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "c0"."IDX_c9cd91a6960157ee562c2dc861"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_ca1f9ef451ff9cba38945967ab"`);
        await queryRunner.query(`CREATE INDEX "IDX_c9cd91a6960157ee562c2dc861" ON "c0"."mangas" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_ca1f9ef451ff9cba38945967ab" ON "c0"."chapters" ("slug") `);
    }

}
