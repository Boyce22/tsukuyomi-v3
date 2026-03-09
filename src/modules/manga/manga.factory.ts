import pino from 'pino';
import { AppDataSource } from '@config';

import { Manga } from '@/modules/manga/entities/manga.entity';
import { Chapter } from '@/modules/manga/entities/chapter.entity';
import { Page } from '@/modules/manga/entities/page.entity';
import { Tag } from '@/modules/manga/entities/tag.entity';
import { Report } from '@/modules/manga/entities/report.entity';

import { MangaRepository } from '@/modules/manga/repositories/manga.repository';
import { ChapterRepository } from '@/modules/manga/repositories/chapter.repository';
import { PageRepository } from '@/modules/manga/repositories/page.repository';
import { TagRepository } from '@/modules/manga/repositories/tag.repository';

import { MangaService } from '@/modules/manga/services/manga.service';
import { ChapterService } from '@/modules/manga/services/chapter.service';
import { PageService } from '@/modules/manga/services/page.service';
import { TagService } from '@/modules/manga/services/tag.service';

import { MangaController } from '@/modules/manga/controllers/manga.controller';
import { ChapterController } from '@/modules/manga/controllers/chapter.controller';
import { PageController } from '@/modules/manga/controllers/page.controller';
import { TagController } from '@/modules/manga/controllers/tag.controller';

const mangaLogger = pino({ name: 'manga-module' });
const chapterLogger = pino({ name: 'chapter-module' });
const pageLogger = pino({ name: 'page-module' });
const tagLogger = pino({ name: 'tag-module' });

const mangaRepository = new MangaRepository(
  AppDataSource.getRepository(Manga),
  AppDataSource.getRepository(Tag),
  AppDataSource.getRepository(Report),
);

const chapterRepository = new ChapterRepository(AppDataSource.getRepository(Chapter));

const pageRepository = new PageRepository(AppDataSource.getRepository(Page), AppDataSource.getRepository(Chapter));

const tagRepository = new TagRepository(AppDataSource.getRepository(Tag));

const mangaService = new MangaService(mangaRepository, mangaLogger);
const chapterService = new ChapterService(chapterRepository, mangaRepository, chapterLogger);
const pageService = new PageService(pageRepository, chapterRepository, pageLogger);
const tagService = new TagService(tagRepository, tagLogger);

const mangaController = new MangaController(mangaService);
const chapterController = new ChapterController(chapterService);
const pageController = new PageController(pageService);
const tagController = new TagController(tagService);

export { mangaController, chapterController, pageController, tagController };
export const mangaRouter = mangaController.router;
export const chapterRouter = chapterController.router;
export const pageRouter = pageController.router;
export const tagRouter = tagController.router;
