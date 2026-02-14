import B2 from 'backblaze-b2';
import { IStorageProvider, UploadOptions, UploadResult } from './storage.interface';
import { env } from '@config';
import crypto from 'crypto';
import sharp from 'sharp';

/**
 * Backblaze B2 storage provider implementation
 */
export class BackblazeProvider implements IStorageProvider {
  private b2: B2;
  private bucketId: string;
  private bucketName: string;
  private downloadUrl: string;
  private authorized: boolean = false;

  constructor() {
    this.bucketId = env.BACKBLAZE_BUCKET_ID || '';
    this.bucketName = env.BACKBLAZE_BUCKET_NAME || '';
    this.downloadUrl = env.BACKBLAZE_DOWNLOAD_URL || '';

    this.b2 = new B2({
      applicationKeyId: env.BACKBLAZE_KEY_ID || '',
      applicationKey: env.BACKBLAZE_APP_KEY || '',
    });
  }

  private async authorize(): Promise<void> {
    if (!this.authorized) {
      await this.b2.authorize();
      this.authorized = true;
    }
  }

  async upload(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    await this.authorize();

    const metadata = await sharp(buffer).metadata();

    // Process image if needed
    let processedBuffer = buffer;
    if (options.maxWidth || options.maxHeight) {
      processedBuffer = await sharp(buffer)
        .resize(options.maxWidth, options.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: options.quality || 80 })
        .toBuffer();
    }

    const filename = options.filename || crypto.randomBytes(16).toString('hex');
    const fileName = options.folder ? `${options.folder}/${filename}` : filename;

    const uploadUrlResponse = await this.b2.getUploadUrl({
      bucketId: this.bucketId,
    });

    const uploadResponse = await this.b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: fileName,
      data: processedBuffer,
      mime: `image/${metadata.format}`,
    });

    const url = `${this.downloadUrl}/file/${this.bucketName}/${fileName}`;

    const result: UploadResult = {
      url,
      publicId: uploadResponse.data.fileId,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: processedBuffer.length,
    };

    // Generate thumbnail if requested
    if (options.generateThumbnail) {
      const thumbnailBuffer = await sharp(buffer)
        .resize(options.thumbnailWidth || 300, options.thumbnailHeight || 400, {
          fit: 'cover',
        })
        .jpeg({ quality: 70 })
        .toBuffer();

      const thumbnailFileName = `${fileName}-thumbnail`;
      const thumbnailUploadUrl = await this.b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      await this.b2.uploadFile({
        uploadUrl: thumbnailUploadUrl.data.uploadUrl,
        uploadAuthToken: thumbnailUploadUrl.data.authorizationToken,
        fileName: thumbnailFileName,
        data: thumbnailBuffer,
        mime: 'image/jpeg',
      });

      result.thumbnailUrl = `${this.downloadUrl}/file/${this.bucketName}/${thumbnailFileName}`;
    }

    return result;
  }

  async uploadMany(files: Buffer[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const promises = files.map((buffer, index) => {
      const fileOptions = { ...options };
      if (options.filename) {
        fileOptions.filename = `${options.filename}-${index + 1}`;
      }
      return this.upload(buffer, fileOptions);
    });

    return Promise.all(promises);
  }

  async delete(publicId: string): Promise<void> {
    await this.authorize();

    await this.b2.deleteFileVersion({
      fileId: publicId,
      fileName: publicId,
    });

    // Try to delete thumbnail
    try {
      await this.b2.deleteFileVersion({
        fileId: `${publicId}-thumbnail`,
        fileName: `${publicId}-thumbnail`,
      });
    } catch (error) {
      // Thumbnail may not exist, ignore error
    }
  }

  async deleteMany(publicIds: string[]): Promise<void> {
    await this.authorize();

    const deletePromises = publicIds.map((id) => this.delete(id));
    await Promise.all(deletePromises);
  }

  getUrl(publicId: string): string {
    return `${this.downloadUrl}/file/${this.bucketName}/${publicId}`;
  }

  getThumbnailUrl(publicId: string): string {
    return `${this.downloadUrl}/file/${this.bucketName}/${publicId}-thumbnail`;
  }
}
