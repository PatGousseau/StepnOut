export const isVideo = (filePath: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.webm'];
  const extension = filePath.toLowerCase().split('.').pop();
  return extension ? videoExtensions.includes(`.${extension}`) : false;
}; 