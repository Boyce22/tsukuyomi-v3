import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokenToUser1771689498991 implements MigrationInterface {
    name = 'AddRefreshTokenToUser1771689498991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "refreshToken" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "refreshToken"`);
    }

}
