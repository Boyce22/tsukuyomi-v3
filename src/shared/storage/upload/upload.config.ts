import { ALLOWED_IMAGES, UPLOAD_LIMITS } from './upload.constants';

import { uploadMiddleware, uploadMultipleMiddleware } from '@middlewares';

export const UPLOAD_MIDDLEWARE = Object.freeze({
  PROFILE_PICTURE: uploadMiddleware({
    allowedMimes: ALLOWED_IMAGES,
    maxSize: UPLOAD_LIMITS.PROFILE_PICTURE,
    fieldName: 'profilePicture',
  }),

  BANNER: uploadMiddleware({
    allowedMimes: ALLOWED_IMAGES,
    maxSize: UPLOAD_LIMITS.BANNER,
    fieldName: 'banner',
  }),

  MANGA_COVER: uploadMiddleware({
    allowedMimes: ALLOWED_IMAGES,
    maxSize: UPLOAD_LIMITS.MANGA_COVER,
    fieldName: 'cover',
  }),

  MANGA_PAGES: uploadMultipleMiddleware({
    allowedMimes: ALLOWED_IMAGES,
    maxSize: UPLOAD_LIMITS.MANGA_PAGE,
    fieldName: 'pages',
    maxFiles: 150,
    useDisk: true,
  }),
});
