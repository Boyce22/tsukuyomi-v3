import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMangaReportsTable1773009879831 implements MigrationInterface {
  name = 'CreateMangaReportsTable1773009879831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "c0"."manga_reports_reason_enum" AS ENUM('INAPPROPRIATE_CONTENT', 'SPAM', 'COPYRIGHT', 'WRONG_INFO', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "c0"."manga_reports" ("id" uuid NOT NULL, "reason" "c0"."manga_reports_reason_enum" NOT NULL, "description" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "mangaId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_ea4e396304db1a86b9827d118df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_4530621b9b9cba964496d163c9" ON "c0"."manga_reports" ("mangaId") `);
    await queryRunner.query(`CREATE INDEX "IDX_74bee9989c5b3be1e95b082b00" ON "c0"."manga_reports" ("userId") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fa338498060f9374be9abf6dbf" ON "c0"."manga_reports" ("mangaId", "userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "c0"."manga_reports" ADD CONSTRAINT "FK_4530621b9b9cba964496d163c94" FOREIGN KEY ("mangaId") REFERENCES "c0"."mangas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "c0"."manga_reports" ADD CONSTRAINT "FK_74bee9989c5b3be1e95b082b00d" FOREIGN KEY ("userId") REFERENCES "c0"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "c0"."manga_reports" DROP CONSTRAINT "FK_74bee9989c5b3be1e95b082b00d"`);
    await queryRunner.query(`ALTER TABLE "c0"."manga_reports" DROP CONSTRAINT "FK_4530621b9b9cba964496d163c94"`);
    await queryRunner.query(`DROP INDEX "c0"."IDX_fa338498060f9374be9abf6dbf"`);
    await queryRunner.query(`DROP INDEX "c0"."IDX_74bee9989c5b3be1e95b082b00"`);
    await queryRunner.query(`DROP INDEX "c0"."IDX_4530621b9b9cba964496d163c9"`);
    await queryRunner.query(`DROP TABLE "c0"."manga_reports"`);
    await queryRunner.query(`DROP TYPE "c0"."manga_reports_reason_enum"`);
  }
}
