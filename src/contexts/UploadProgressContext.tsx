import React, { createContext, useContext, useState } from 'react';

interface UploadProgressContextType {
  uploadProgress: number | null;
  setUploadProgress: (progress: number | null) => void;
  uploadMessage: string | null;
  setUploadMessage: (message: string | null) => void;
}

const UploadProgressContext = createContext<UploadProgressContextType | undefined>(undefined);

export const UploadProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  return (
    <UploadProgressContext.Provider value={{ 
      uploadProgress, 
      setUploadProgress,
      uploadMessage,
      setUploadMessage
    }}>
      {children}
    </UploadProgressContext.Provider>
  );
};

export const useUploadProgress = () => {
  const context = useContext(UploadProgressContext);
  if (context === undefined) {
    throw new Error('useUploadProgress must be used within a UploadProgressProvider');
  }
  return context;
}; 