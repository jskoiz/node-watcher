import { Injectable } from '@nestjs/common';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { appConfig } from '../config/app.config';

function extensionForMimeType(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}

@Injectable()
export class PhotoStorageService {
  async saveProfilePhoto(file: Express.Multer.File) {
    const extension = extensionForMimeType(file.mimetype);
    const fileName = `${randomUUID()}.${extension}`;
    const absoluteDir = join(process.cwd(), appConfig.uploads.profileDir);
    const absolutePath = join(absoluteDir, fileName);

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absolutePath, file.buffer);

    return {
      storageKey: `${appConfig.uploads.profilePublicBaseUrl}/${fileName}`,
      fileName,
    };
  }

  async removeProfilePhoto(storageKey?: string | null) {
    if (!storageKey) return;

    const fileName = storageKey.split('/').pop();
    if (!fileName) return;

    const absolutePath = join(process.cwd(), appConfig.uploads.profileDir, fileName);
    await rm(absolutePath, { force: true });
  }
}
