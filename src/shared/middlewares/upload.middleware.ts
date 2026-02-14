import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '@/shared/errors/app-error';

export const uploadMiddleware = (config: { maxSize: number; allowedMimes: readonly string[] }) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxSize },
    fileFilter: (_req, file, cb) => {
      if (config.allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError(`Invalid file type. Allowed: ${config.allowedMimes.join(', ')}`));
      }
    },
  });

  const handleMulterError = (err: any, _req: Request, _res: Response, next: NextFunction): void => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new AppError(`File too large. Maximum size: ${config.maxSize / (1024 * 1024)}MB`, 400));
      } else {
        next(new AppError(`Upload error: ${err.message}`));
      }
    } else {
      next(err);
    }
  };

  return [upload.single('file'), handleMulterError];
};
