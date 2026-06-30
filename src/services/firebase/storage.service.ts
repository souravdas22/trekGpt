import { getStorage, ref, putFile, getDownloadURL, deleteObject } from '@react-native-firebase/storage';
import { Image } from 'react-native-compressor';

export enum StoragePath {
  PROFILE = 'profiles',
  COMMUNITY = 'community_images',
}

export interface UploadOptions {
  compress?: boolean;
  onProgress?: (progress: number) => void;
}

export class StorageError extends Error {
  constructor(public message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'StorageError';
  }
}

const uploadFile = async (
  path: string,
  localFilePath: string,
  options?: UploadOptions
): Promise<string> => {
  try {
    let filePathToUpload = localFilePath;

    // Apply compression if requested
    if (options?.compress) {
      try {
        filePathToUpload = await Image.compress(localFilePath, {
          compressionMethod: 'auto',
          quality: 0.8,
        });
      } catch (compressionError) {
        console.warn(`[StorageService] Compression failed for ${localFilePath}. Falling back to original.`, compressionError);
        // Fallback to original if compression fails
      }
    }

    const storage = getStorage();
    const reference = ref(storage, path);
    const task = putFile(reference, filePathToUpload);

    if (options?.onProgress) {
      task.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        options.onProgress!(progress);
      });
    }

    // Wait for the upload task to complete
    await task;

    // Return the generated download URL
    return await getDownloadURL(reference);
  } catch (error: any) {
    console.error(`[StorageService] Upload error at ${path}:`, error);
    throw new StorageError(
      error?.message || 'Failed to upload image',
      error?.code || 'upload_failed',
      error
    );
  }
};

export const uploadProfileImage = async (
  userId: string,
  localFilePath: string,
  options?: UploadOptions
): Promise<string> => {
  const extension = localFilePath.split('.').pop() || 'jpg';
  const path = `${StoragePath.PROFILE}/${userId}/avatar_${Date.now()}.${extension}`;
  return uploadFile(path, localFilePath, { compress: true, ...options });
};

export const uploadCommunityImage = async (
  postId: string,
  localFilePath: string,
  options?: UploadOptions
): Promise<string> => {
  const extension = localFilePath.split('.').pop() || 'jpg';
  const path = `${StoragePath.COMMUNITY}/${postId}/img_${Date.now()}.${extension}`;
  return uploadFile(path, localFilePath, { compress: true, ...options });
};

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storage = getStorage();
    const reference = ref(storage, path);
    await deleteObject(reference);
  } catch (error: any) {
    console.error(`[StorageService] Delete error at ${path}:`, error);
    throw new StorageError(
      error?.message || 'Failed to delete image',
      error?.code || 'delete_failed',
      error
    );
  }
};

export const getDownloadUrl = async (path: string): Promise<string> => {
  try {
    const storage = getStorage();
    const reference = ref(storage, path);
    return await getDownloadURL(reference);
  } catch (error: any) {
    console.error(`[StorageService] Get URL error at ${path}:`, error);
    throw new StorageError(
      error?.message || 'Failed to get download URL',
      error?.code || 'url_failed',
      error
    );
  }
};
