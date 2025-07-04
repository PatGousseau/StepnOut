import { uploadMediaInBackground } from '../utils/handleMediaUpload';
import { MediaSelectionResult } from '../utils/handleMediaUpload';

interface UploadQueueItem {
  id: string;
  mediaId: number;
  pendingUpload: MediaSelectionResult['pendingUpload'];
  postId?: number;
  retryCount: number;
  onProgress?: (progress: number) => void;
  onComplete?: (success: boolean, mediaUrl?: string) => void;
}

class BackgroundUploadService {
  private uploadQueue: UploadQueueItem[] = [];
  private isProcessing = false;
  private activeUploads = new Set<string>();
  private maxRetries = 3;
  private maxConcurrentUploads = 2;

  // Add an upload to the queue
  addToQueue(
    mediaId: number,
    pendingUpload: MediaSelectionResult['pendingUpload'],
    postId?: number,
    onProgress?: (progress: number) => void,
    onComplete?: (success: boolean, mediaUrl?: string) => void
  ): string {
    const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queueItem: UploadQueueItem = {
      id,
      mediaId,
      pendingUpload,
      postId,
      retryCount: 0,
      onProgress,
      onComplete,
    };

    this.uploadQueue.push(queueItem);
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    console.log(`Added upload to queue: ${id}, queue size: ${this.uploadQueue.length}`);
    return id;
  }

  // Remove an upload from the queue
  removeFromQueue(uploadId: string): boolean {
    const index = this.uploadQueue.findIndex(item => item.id === uploadId);
    if (index !== -1) {
      this.uploadQueue.splice(index, 1);
      this.activeUploads.delete(uploadId);
      return true;
    }
    return false;
  }

  // Get the current queue status
  getQueueStatus() {
    return {
      queueSize: this.uploadQueue.length,
      activeUploads: this.activeUploads.size,
      isProcessing: this.isProcessing,
    };
  }

  // Process the upload queue
  private async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('Starting upload queue processing');

    while (this.uploadQueue.length > 0 && this.activeUploads.size < this.maxConcurrentUploads) {
      const item = this.uploadQueue.shift();
      if (!item) continue;

      this.activeUploads.add(item.id);
      
      // Process upload without blocking the queue
      this.processUpload(item).finally(() => {
        this.activeUploads.delete(item.id);
        
        // Continue processing if there are more items
        if (this.uploadQueue.length > 0) {
          setTimeout(() => this.processQueue(), 100);
        } else if (this.activeUploads.size === 0) {
          this.isProcessing = false;
          console.log('Upload queue processing completed');
        }
      });
    }

    // If no items were processed, stop processing
    if (this.activeUploads.size === 0) {
      this.isProcessing = false;
    }
  }

  // Process a single upload
  private async processUpload(item: UploadQueueItem) {
    console.log(`Processing upload: ${item.id}, attempt ${item.retryCount + 1}`);
    
    try {
      const mediaUrl = await uploadMediaInBackground(
        item.mediaId,
        item.pendingUpload,
        item.onProgress
      );
      
      console.log(`Upload completed successfully: ${item.id}`);
      item.onComplete?.(true, mediaUrl);
    } catch (error) {
      console.error(`Upload failed: ${item.id}`, error);
      
      // Retry logic
      if (item.retryCount < this.maxRetries) {
        item.retryCount++;
        const retryDelay = Math.pow(2, item.retryCount) * 1000; // Exponential backoff
        
        console.log(`Retrying upload ${item.id} in ${retryDelay}ms (attempt ${item.retryCount + 1})`);
        
        setTimeout(() => {
          this.uploadQueue.unshift(item); // Add back to front of queue
          if (!this.isProcessing) {
            this.processQueue();
          }
        }, retryDelay);
      } else {
        console.error(`Upload failed after ${this.maxRetries} retries: ${item.id}`);
        item.onComplete?.(false);
      }
    }
  }

  // Clear all uploads (useful for cleanup)
  clearQueue() {
    this.uploadQueue = [];
    this.activeUploads.clear();
    this.isProcessing = false;
  }

  // Get pending uploads for a specific post
  getPendingUploadsForPost(postId: number): UploadQueueItem[] {
    return this.uploadQueue.filter(item => item.postId === postId);
  }
}

// Export singleton instance
export const backgroundUploadService = new BackgroundUploadService();
export type { UploadQueueItem }; 