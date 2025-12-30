import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitalSchema1766768137828 implements MigrationInterface {
    name = 'CreateInitalSchema1766768137828'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "c0"."tags" ("id" uuid NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, "description" text, "type" "c0"."tags_type_enum" NOT NULL DEFAULT 'genre', "color" character varying(7), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "usageCount" integer NOT NULL DEFAULT '0', "createdById" uuid, "updatedById" uuid, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d90243459a697eadb8ad56e909" ON "c0"."tags" ("name") `);
        await queryRunner.query(`CREATE TABLE "c0"."pages" ("id" uuid NOT NULL, "number" integer NOT NULL, "imageUrl" character varying(500) NOT NULL, "thumbnailUrl" character varying(500), "width" integer, "height" integer, "fileSize" integer, "format" character varying(10), "hash" character varying(64), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "isActive" boolean NOT NULL DEFAULT true, "isProcessed" boolean NOT NULL DEFAULT false, "chapterId" uuid NOT NULL, "createdById" uuid, "updatedById" uuid, CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ff5d10b3ea5b3295cf2ac4f24e" ON "c0"."pages" ("chapterId") `);
        await queryRunner.query(`CREATE TABLE "c0"."comments" ("id" uuid NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "isActive" boolean NOT NULL DEFAULT true, "isEdited" boolean NOT NULL DEFAULT false, "isPinned" boolean NOT NULL DEFAULT false, "isSpoiler" boolean NOT NULL DEFAULT false, "likeCount" integer NOT NULL DEFAULT '0', "dislikeCount" integer NOT NULL DEFAULT '0', "replyCount" integer NOT NULL DEFAULT '0', "mangaId" uuid, "chapterId" uuid, "userId" uuid NOT NULL, "parentCommentId" uuid, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "c0"."chapters" ("id" uuid NOT NULL, "number" double precision NOT NULL, "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "publishedAt" TIMESTAMP WITH TIME ZONE, "viewCount" integer NOT NULL DEFAULT '0', "pageCount" integer NOT NULL DEFAULT '0', "commentCount" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "mangaId" uuid NOT NULL, "createdById" uuid, "updatedById" uuid, CONSTRAINT "UQ_ca1f9ef451ff9cba38945967abb" UNIQUE ("slug"), CONSTRAINT "PK_a2bbdbb4bdc786fe0cb0fcfc4a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ca1f9ef451ff9cba38945967ab" ON "c0"."chapters" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_7301f587a038330b1d7abb6668" ON "c0"."chapters" ("mangaId") `);
        await queryRunner.query(`CREATE TABLE "c0"."ratings" ("id" uuid NOT NULL, "score" numeric(3,2) NOT NULL, "review" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "mangaId" uuid NOT NULL, CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4d0b0e3a4c4af854d225154ba4" ON "c0"."ratings" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_53e4eaafe4365f8e459cc086ce" ON "c0"."ratings" ("mangaId") `);
        await queryRunner.query(`CREATE TABLE "c0"."favorites" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "mangaId" uuid NOT NULL, CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e747534006c6e3c2f09939da60" ON "c0"."favorites" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d85fedf5ac0108a3cb262a68d7" ON "c0"."favorites" ("mangaId") `);
        await queryRunner.query(`CREATE TABLE "c0"."mangas" ("id" uuid NOT NULL, "title" character varying(255) NOT NULL, "description" text, "coverUrl" character varying(500) NOT NULL, "bannerUrl" character varying(500), "isMature" boolean NOT NULL DEFAULT false, "status" "c0"."mangas_status_enum" NOT NULL DEFAULT 'ACTIVED', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "publicationDate" date, "completionDate" date, "averageRating" numeric(3,2) NOT NULL DEFAULT '0', "ratingCount" integer NOT NULL DEFAULT '0', "viewCount" integer NOT NULL DEFAULT '0', "favoriteCount" integer NOT NULL DEFAULT '0', "commentCount" integer NOT NULL DEFAULT '0', "chapterCount" integer NOT NULL DEFAULT '0', "author" character varying(255), "artist" character varying(255), "publisher" character varying(255), "alternativeTitles" text, "originalLanguage" character varying(10) NOT NULL DEFAULT 'ja', "slug" character varying(255) NOT NULL, "createdById" uuid, "updatedById" uuid, CONSTRAINT "UQ_c9cd91a6960157ee562c2dc8613" UNIQUE ("slug"), CONSTRAINT "PK_caf32b0b7ecd79d3bbc459b989b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f18fdb8b77e26c81d96f0b782e" ON "c0"."mangas" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_c9cd91a6960157ee562c2dc861" ON "c0"."mangas" ("slug") `);
        await queryRunner.query(`CREATE TABLE "c0"."reading_history" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "chaptersRead" integer NOT NULL DEFAULT '0', "pagesRead" integer NOT NULL DEFAULT '0', "lastChapterReadId" uuid, "lastPageReadId" uuid, "lastReadAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "mangaId" uuid NOT NULL, "status" "c0"."reading_history_status_enum" NOT NULL DEFAULT 'reading', CONSTRAINT "PK_fea39783024da119636add4bc21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0a84665f42ef7d9ed671a6828e" ON "c0"."reading_history" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3df1ae401e85e47c5607205e12" ON "c0"."reading_history" ("mangaId") `);
        await queryRunner.query(`CREATE TABLE "c0"."users" ("id" uuid NOT NULL, "name" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "userName" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "biography" text, "birthDate" date, "email" character varying(255) NOT NULL, "role" "c0"."users_role_enum" NOT NULL DEFAULT 'USER', "isVerified" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "lastPasswordChange" TIMESTAMP WITH TIME ZONE, "emailVerifiedAt" TIMESTAMP WITH TIME ZONE, "verificationToken" character varying(255), "resetPasswordToken" character varying(255), "resetPasswordExpires" TIMESTAMP WITH TIME ZONE, "profilePictureUrl" character varying(500), "bannerUrl" character varying(500), "address" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "lastLoginAt" TIMESTAMP WITH TIME ZONE, "mangasCreated" integer NOT NULL DEFAULT '0', "chaptersCreated" integer NOT NULL DEFAULT '0', "commentsCount" integer NOT NULL DEFAULT '0', "favoritesCount" integer NOT NULL DEFAULT '0', "ratingsCount" integer NOT NULL DEFAULT '0', "showMatureContent" boolean NOT NULL DEFAULT true, "preferredLanguage" character varying NOT NULL DEFAULT 'en', "theme" character varying NOT NULL DEFAULT 'light', CONSTRAINT "UQ_226bb9aa7aa8a69991209d58f59" UNIQUE ("userName"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "c0"."manga_tags" ("manga_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_d091ae0d32f5cab6730e63803c9" PRIMARY KEY ("manga_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1109d1c70cab1729fc7b701b04" ON "c0"."manga_tags" ("manga_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1148bf09ecca3c6ad1a18bd30a" ON "c0"."manga_tags" ("tag_id") `);
        await queryRunner.query(`CREATE TABLE "c0"."comments_closure" ("id_ancestor" uuid NOT NULL, "id_descendant" uuid NOT NULL, CONSTRAINT "PK_a02e5093a5d47a64f1fd473d1ef" PRIMARY KEY ("id_ancestor", "id_descendant"))`);
        await queryRunner.query(`CREATE INDEX "IDX_89a2762362d968c2939b6fab19" ON "c0"."comments_closure" ("id_ancestor") `);
        await queryRunner.query(`CREATE INDEX "IDX_d2164211fd6ab117cfb2ab8ba9" ON "c0"."comments_closure" ("id_descendant") `);
        await queryRunner.query(`ALTER TABLE "c0"."tags" ADD CONSTRAINT "FK_e56de5f3dcb3c112de1e983b8e7" FOREIGN KEY ("createdById") REFERENCES "c0"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."tags" ADD CONSTRAINT "FK_613bccbbe697ffcb6d454c8c137" FOREIGN KEY ("updatedById") REFERENCES "c0"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."pages" ADD CONSTRAINT "FK_ff5d10b3ea5b3295cf2ac4f24e4" FOREIGN KEY ("chapterId") REFERENCES "c0"."chapters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."pages" ADD CONSTRAINT "FK_bb4fdf76de17813bc13db0bf0d2" FOREIGN KEY ("createdById") REFERENCES "c0"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."pages" ADD CONSTRAINT "FK_abca8d9b8b2493ed32972042b27" FOREIGN KEY ("updatedById") REFERENCES "c0"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."comments" ADD CONSTRAINT "FK_73ac4fbcb3bde1d213db60d2cbf" FOREIGN KEY ("mangaId") REFERENCES "c0"."mangas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."comments" ADD CONSTRAINT "FK_8dc14e6a6a0c24a0ce1bc74380d" FOREIGN KEY ("chapterId") REFERENCES "c0"."chapters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."comments" ADD CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749" FOREIGN KEY ("userId") REFERENCES "c0"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."comments" ADD CONSTRAINT "FK_4875672591221a61ace66f2d4f9" FOREIGN KEY ("parentCommentId") REFERENCES "c0"."comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."chapters" ADD CONSTRAINT "FK_7301f587a038330b1d7abb66686" FOREIGN KEY ("mangaId") REFERENCES "c0"."mangas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."chapters" ADD CONSTRAINT "FK_31eee0bf1ffa9a42d06d8dad2e6" FOREIGN KEY ("createdById") REFERENCES "c0"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."chapters" ADD CONSTRAINT "FK_89f68ec0e0c159e03dd265e7795" FOREIGN KEY ("updatedById") REFERENCES "c0"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."ratings" ADD CONSTRAINT "FK_4d0b0e3a4c4af854d225154ba40" FOREIGN KEY ("userId") REFERENCES "c0"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."ratings" ADD CONSTRAINT "FK_53e4eaafe4365f8e459cc086ce1" FOREIGN KEY ("mangaId") REFERENCES "c0"."mangas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."favorites" ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "c0"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."favorites" ADD CONSTRAINT "FK_d85fedf5ac0108a3cb262a68d70" FOREIGN KEY ("mangaId") REFERENCES "c0"."mangas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."mangas" ADD CONSTRAINT "FK_cc22de2e0e8a61868f9a973956f" FOREIGN KEY ("createdById") REFERENCES "c0"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."mangas" ADD CONSTRAINT "FK_caeec1afc6eff8ab4d447ab0357" FOREIGN KEY ("updatedById") REFERENCES "c0"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."reading_history" ADD CONSTRAINT "FK_430f7bf314cbcd6daf4d25b3aaf" FOREIGN KEY ("lastChapterReadId") REFERENCES "c0"."chapters"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."reading_history" ADD CONSTRAINT "FK_f98374aa608f580c8391ecc7574" FOREIGN KEY ("lastPageReadId") REFERENCES "c0"."pages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."reading_history" ADD CONSTRAINT "FK_0a84665f42ef7d9ed671a6828e4" FOREIGN KEY ("userId") REFERENCES "c0"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."reading_history" ADD CONSTRAINT "FK_3df1ae401e85e47c5607205e124" FOREIGN KEY ("mangaId") REFERENCES "c0"."mangas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_tags" ADD CONSTRAINT "FK_1109d1c70cab1729fc7b701b04f" FOREIGN KEY ("manga_id") REFERENCES "c0"."mangas"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_tags" ADD CONSTRAINT "FK_1148bf09ecca3c6ad1a18bd30a5" FOREIGN KEY ("tag_id") REFERENCES "c0"."tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."comments_closure" ADD CONSTRAINT "FK_89a2762362d968c2939b6fab193" FOREIGN KEY ("id_ancestor") REFERENCES "c0"."comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."comments_closure" ADD CONSTRAINT "FK_d2164211fd6ab117cfb2ab8ba96" FOREIGN KEY ("id_descendant") REFERENCES "c0"."comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "c0"."comments_closure" DROP CONSTRAINT "FK_d2164211fd6ab117cfb2ab8ba96"`);
        await queryRunner.query(`ALTER TABLE "c0"."comments_closure" DROP CONSTRAINT "FK_89a2762362d968c2939b6fab193"`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_tags" DROP CONSTRAINT "FK_1148bf09ecca3c6ad1a18bd30a5"`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_tags" DROP CONSTRAINT "FK_1109d1c70cab1729fc7b701b04f"`);
        await queryRunner.query(`ALTER TABLE "c0"."reading_history" DROP CONSTRAINT "FK_3df1ae401e85e47c5607205e124"`);
        await queryRunner.query(`ALTER TABLE "c0"."reading_history" DROP CONSTRAINT "FK_0a84665f42ef7d9ed671a6828e4"`);
        await queryRunner.query(`ALTER TABLE "c0"."reading_history" DROP CONSTRAINT "FK_f98374aa608f580c8391ecc7574"`);
        await queryRunner.query(`ALTER TABLE "c0"."reading_history" DROP CONSTRAINT "FK_430f7bf314cbcd6daf4d25b3aaf"`);
        await queryRunner.query(`ALTER TABLE "c0"."mangas" DROP CONSTRAINT "FK_caeec1afc6eff8ab4d447ab0357"`);
        await queryRunner.query(`ALTER TABLE "c0"."mangas" DROP CONSTRAINT "FK_cc22de2e0e8a61868f9a973956f"`);
        await queryRunner.query(`ALTER TABLE "c0"."favorites" DROP CONSTRAINT "FK_d85fedf5ac0108a3cb262a68d70"`);
        await queryRunner.query(`ALTER TABLE "c0"."favorites" DROP CONSTRAINT "FK_e747534006c6e3c2f09939da60f"`);
        await queryRunner.query(`ALTER TABLE "c0"."ratings" DROP CONSTRAINT "FK_53e4eaafe4365f8e459cc086ce1"`);
        await queryRunner.query(`ALTER TABLE "c0"."ratings" DROP CONSTRAINT "FK_4d0b0e3a4c4af854d225154ba40"`);
        await queryRunner.query(`ALTER TABLE "c0"."chapters" DROP CONSTRAINT "FK_89f68ec0e0c159e03dd265e7795"`);
        await queryRunner.query(`ALTER TABLE "c0"."chapters" DROP CONSTRAINT "FK_31eee0bf1ffa9a42d06d8dad2e6"`);
        await queryRunner.query(`ALTER TABLE "c0"."chapters" DROP CONSTRAINT "FK_7301f587a038330b1d7abb66686"`);
        await queryRunner.query(`ALTER TABLE "c0"."comments" DROP CONSTRAINT "FK_4875672591221a61ace66f2d4f9"`);
        await queryRunner.query(`ALTER TABLE "c0"."comments" DROP CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749"`);
        await queryRunner.query(`ALTER TABLE "c0"."comments" DROP CONSTRAINT "FK_8dc14e6a6a0c24a0ce1bc74380d"`);
        await queryRunner.query(`ALTER TABLE "c0"."comments" DROP CONSTRAINT "FK_73ac4fbcb3bde1d213db60d2cbf"`);
        await queryRunner.query(`ALTER TABLE "c0"."pages" DROP CONSTRAINT "FK_abca8d9b8b2493ed32972042b27"`);
        await queryRunner.query(`ALTER TABLE "c0"."pages" DROP CONSTRAINT "FK_bb4fdf76de17813bc13db0bf0d2"`);
        await queryRunner.query(`ALTER TABLE "c0"."pages" DROP CONSTRAINT "FK_ff5d10b3ea5b3295cf2ac4f24e4"`);
        await queryRunner.query(`ALTER TABLE "c0"."tags" DROP CONSTRAINT "FK_613bccbbe697ffcb6d454c8c137"`);
        await queryRunner.query(`ALTER TABLE "c0"."tags" DROP CONSTRAINT "FK_e56de5f3dcb3c112de1e983b8e7"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_d2164211fd6ab117cfb2ab8ba9"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_89a2762362d968c2939b6fab19"`);
        await queryRunner.query(`DROP TABLE "c0"."comments_closure"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_1148bf09ecca3c6ad1a18bd30a"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_1109d1c70cab1729fc7b701b04"`);
        await queryRunner.query(`DROP TABLE "c0"."manga_tags"`);
        await queryRunner.query(`DROP TABLE "c0"."users"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_3df1ae401e85e47c5607205e12"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_0a84665f42ef7d9ed671a6828e"`);
        await queryRunner.query(`DROP TABLE "c0"."reading_history"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_c9cd91a6960157ee562c2dc861"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_f18fdb8b77e26c81d96f0b782e"`);
        await queryRunner.query(`DROP TABLE "c0"."mangas"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_d85fedf5ac0108a3cb262a68d7"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_e747534006c6e3c2f09939da60"`);
        await queryRunner.query(`DROP TABLE "c0"."favorites"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_53e4eaafe4365f8e459cc086ce"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_4d0b0e3a4c4af854d225154ba4"`);
        await queryRunner.query(`DROP TABLE "c0"."ratings"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_7301f587a038330b1d7abb6668"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_ca1f9ef451ff9cba38945967ab"`);
        await queryRunner.query(`DROP TABLE "c0"."chapters"`);
        await queryRunner.query(`DROP TABLE "c0"."comments"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_ff5d10b3ea5b3295cf2ac4f24e"`);
        await queryRunner.query(`DROP TABLE "c0"."pages"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_d90243459a697eadb8ad56e909"`);
        await queryRunner.query(`DROP TABLE "c0"."tags"`);
    }

}
