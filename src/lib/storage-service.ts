import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage, auth, isFirebaseConfigured } from './firebase';
import { createMediaAssetRecord } from './firestore-service';
import { MediaAsset } from '../types/portfolio';

export type StorageFolder = 'thumbnails' | 'images' | 'videos' | 'gallery' | 'profile';

export interface UploadResult {
  url: string;
  storagePath: string;
  mediaAsset: MediaAsset;
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
}

/**
 * Uploads an image or video file to Firebase Storage with progress tracking
 * and records its metadata in Firestore's `media` collection.
 */
export async function uploadPortfolioMedia(
  file: File,
  folder: StorageFolder,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (!isFirebaseConfigured || !storage) {
    throw new Error('Firebase Storage is not configured.');
  }

  const currentUser = auth?.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to upload media.');
  }

  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');
  if (!isVideo && !isImage) {
    throw new Error('Unsupported file format. Please upload an image or video file.');
  }

  if (isImage && file.size > 15 * 1024 * 1024) {
    throw new Error('Image exceeds maximum allowed size of 15MB.');
  }

  if (isVideo && file.size > 150 * 1024 * 1024) {
    throw new Error('Video exceeds maximum allowed size of 150MB.');
  }

  const safeName = sanitizeFileName(file.name);
  const uniqueName = `${Date.now()}_${safeName}`;
  const storagePath = `portfolio/${folder}/${uniqueName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<UploadResult>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / Math.max(snapshot.totalBytes, 1)) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(new Error(error.message || 'Upload failed. Verify admin permissions and Storage rules.'));
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const mediaAsset = await createMediaAssetRecord({
            name: file.name.slice(0, 256),
            storagePath,
            url,
            mediaType: isVideo ? 'video' : 'image',
            contentType: file.type || 'application/octet-stream',
            size: file.size,
            uploadedBy: currentUser.uid,
          });
          resolve({ url, storagePath, mediaAsset });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Deletes a file from Firebase Storage given its storagePath.
 */
export async function deleteStorageFileByPath(storagePath: string): Promise<void> {
  if (!storage || !storagePath) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (err) {
    // Ignore object-not-found during cleanup
    console.warn('Storage delete notice:', err);
  }
}

/**
 * Extracts a Firebase Storage path from a download URL and deletes it if hosted in our bucket.
 */
export async function deleteStorageFileByUrl(url?: string): Promise<void> {
  if (!storage || !url) return;
  if (!url.includes('firebasestorage.googleapis.com')) return;

  try {
    const match = url.match(/\/o\/([^?]+)/);
    if (match && match[1]) {
      const decodedPath = decodeURIComponent(match[1]);
      if (decodedPath.startsWith('portfolio/')) {
        await deleteStorageFileByPath(decodedPath);
      }
    }
  } catch (err) {
    console.warn('Could not clean up storage URL:', err);
  }
}
