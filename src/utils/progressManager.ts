type ProgressCallback = (progress: number) => void;

class ProgressManager {
  private creepInterval: NodeJS.Timeout | null = null;
  private setProgress: ProgressCallback;

  constructor(setProgress: ProgressCallback) {
    this.setProgress = setProgress;
  }

  private startCreeping(start: number, end: number) {
    let current = start;
    if (this.creepInterval) {
      clearInterval(this.creepInterval);
    }
    
    this.creepInterval = setInterval(() => {
      current += 0.2;
      if (current >= end) {
        if (this.creepInterval) {
          clearInterval(this.creepInterval);
        }
      } else {
        this.setProgress(current);
      }
    }, 200);
  }

  public startUpload() {
    this.setProgress(60); // Start at 60%
    this.startCreeping(60, 70); // Start creeping from 60 to 70
  }

  public updateProgress(progress: number) {
    if (this.creepInterval) {
      clearInterval(this.creepInterval);
    }

    if (progress < 20) {
      this.startCreeping(70, 80);
    } else if (progress < 90) {
      this.startCreeping(80, 90);
    } else {
      this.setProgress(progress);
    }
  }

  public complete() {
    if (this.creepInterval) {
      clearInterval(this.creepInterval);
    }
    this.setProgress(100);
  }

  public reset() {
    if (this.creepInterval) {
      clearInterval(this.creepInterval);
    }
    this.setProgress(0);
  }

  public cleanup() {
    if (this.creepInterval) {
      clearInterval(this.creepInterval);
    }
  }
}

export const createProgressManager = (setProgress: ProgressCallback) => {
  return new ProgressManager(setProgress);
}; 