/**
 * Upload result interface
 */
export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  thumbnailUrl?: string;
}

/**
 * Upload options interface
 */
export interface UploadOptions {
  folder?: string;
  filename?: string;
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Storage provider interface
 * Allows switching between Cloudinary, AWS S3, Backblaze, etc.
 */
export interface IStorageProvider {
  /**
   * Upload a file buffer to storage
   */
  upload(buffer: Buffer, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Upload multiple files
   */
  uploadMany(files: Buffer[], options?: UploadOptions): Promise<UploadResult[]>;

  /**
   * Delete a file from storage
   */
  delete(publicId: string): Promise<void>;

  /**
   * Delete multiple files
   */
  deleteMany(publicIds: string[]): Promise<void>;

  /**
   * Get file URL
   */
  getUrl(publicId: string): string;

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(publicId: string): string;
}
