import pino from 'pino';
import { AppDataSource } from '@config';

import { Manga } from '@/modules/manga/entities/manga.entity';
import { Chapter } from '@/modules/manga/entities/chapter.entity';
import { Page } from '@/modules/manga/entities/page.entity';
import { Tag } from '@/modules/manga/entities/tag.entity';
import { Report } from '@/modules/manga/entities/report.entity';
import { Comment } from '@/modules/manga/entities/comment.entity';
import { Favorite } from '@/modules/manga/entities/favorite.entity';
import { Rating } from '@/modules/manga/entities/rating.entity';
import { ReadingHistory } from '@/modules/manga/entities/reading-history.entity';

import { MangaRepository } from '@/modules/manga/repositories/manga.repository';
import { ChapterRepository } from '@/modules/manga/repositories/chapter.repository';
import { PageRepository } from '@/modules/manga/repositories/page.repository';
import { TagRepository } from '@/modules/manga/repositories/tag.repository';
import { CommentRepository } from '@/modules/manga/repositories/comment.repository';
import { FavoriteRepository } from '@/modules/manga/repositories/favorite.repository';
import { RatingRepository } from '@/modules/manga/repositories/rating.repository';
import { ReadingHistoryRepository } from '@/modules/manga/repositories/reading-history.repository';

import { MangaService } from '@/modules/manga/services/manga.service';
import { ChapterService } from '@/modules/manga/services/chapter.service';
import { PageService } from '@/modules/manga/services/page.service';
import { TagService } from '@/modules/manga/services/tag.service';
import { CommentService } from '@/modules/manga/services/comment.service';
import { FavoriteService } from '@/modules/manga/services/favorite.service';
import { RatingService } from '@/modules/manga/services/rating.service';
import { ReadingHistoryService } from '@/modules/manga/services/reading-history.service';

import { MangaController } from '@/modules/manga/controllers/manga.controller';
import { ChapterController } from '@/modules/manga/controllers/chapter.controller';
import { PageController } from '@/modules/manga/controllers/page.controller';
import { TagController } from '@/modules/manga/controllers/tag.controller';
import { CommentController } from '@/modules/manga/controllers/comment.controller';
import { FavoriteController } from '@/modules/manga/controllers/favorite.controller';
import { RatingController } from '@/modules/manga/controllers/rating.controller';
import { ReadingHistoryController } from '@/modules/manga/controllers/reading-history.controller';

const mangaLogger = pino({ name: 'manga-module' });
const chapterLogger = pino({ name: 'chapter-module' });
const pageLogger = pino({ name: 'page-module' });
const tagLogger = pino({ name: 'tag-module' });
const commentLogger = pino({ name: 'comment-module' });
const favoriteLogger = pino({ name: 'favorite-module' });
const ratingLogger = pino({ name: 'rating-module' });
const readingHistoryLogger = pino({ name: 'reading-history-module' });

const mangaRepository = new MangaRepository(
  AppDataSource.getRepository(Manga),
  AppDataSource.getRepository(Tag),
  AppDataSource.getRepository(Report),
);

const chapterRepository = new ChapterRepository(AppDataSource.getRepository(Chapter));

const pageRepository = new PageRepository(AppDataSource.getRepository(Page), AppDataSource.getRepository(Chapter));

const tagRepository = new TagRepository(AppDataSource.getRepository(Tag));

const commentRepository = new CommentRepository(AppDataSource.getTreeRepository(Comment));

const favoriteRepository = new FavoriteRepository(AppDataSource.getRepository(Favorite));

const ratingRepository = new RatingRepository(AppDataSource.getRepository(Rating));

const readingHistoryRepository = new ReadingHistoryRepository(AppDataSource.getRepository(ReadingHistory));

const mangaService = new MangaService(mangaRepository, mangaLogger);
const chapterService = new ChapterService(chapterRepository, mangaRepository, chapterLogger);
const pageService = new PageService(pageRepository, chapterRepository, pageLogger);
const tagService = new TagService(tagRepository, tagLogger);
const commentService = new CommentService(commentRepository, mangaRepository, chapterRepository, commentLogger);
const favoriteService = new FavoriteService(favoriteRepository, mangaRepository, favoriteLogger);
const ratingService = new RatingService(ratingRepository, mangaRepository, ratingLogger);
const readingHistoryService = new ReadingHistoryService(readingHistoryRepository, mangaRepository, readingHistoryLogger);

const mangaController = new MangaController(mangaService);
const chapterController = new ChapterController(chapterService);
const pageController = new PageController(pageService);
const tagController = new TagController(tagService);
const commentController = new CommentController(commentService);
const favoriteController = new FavoriteController(favoriteService);
const ratingController = new RatingController(ratingService);
const readingHistoryController = new ReadingHistoryController(readingHistoryService);

export { mangaController, chapterController, pageController, tagController, commentController };
export { favoriteController, ratingController, readingHistoryController };
export const mangaRouter = mangaController.router;
export const chapterRouter = chapterController.router;
export const pageRouter = pageController.router;
export const tagRouter = tagController.router;
export const commentRouter = commentController.router;
export const favoriteRouter = favoriteController.router;
export const ratingRouter = ratingController.router;
export const readingHistoryRouter = readingHistoryController.router;
