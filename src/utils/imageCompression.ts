
import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  initialQuality?: number;
}

export const compressImage = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const defaultOptions = {
    maxSizeMB: 0.4, // More aggressive initial compression
    maxWidthOrHeight: 1280, // Smaller initial size for faster processing
    useWebWorker: true,
    initialQuality: 0.7, // Lower initial quality for speed
    ...options
  };

  try {
    console.log('Original file size:', file.size / 1024 / 1024, 'MB');
    
    const compressedFile = await imageCompression(file, defaultOptions);
    
    console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');
    
    // If still too large, compress more aggressively
    if (compressedFile.size > 400 * 1024) { // 400KB threshold
      const aggressiveOptions = {
        ...defaultOptions,
        maxSizeMB: 0.3,
        initialQuality: 0.5,
        maxWidthOrHeight: 1024
      };
      
      const secondPass = await imageCompression(file, aggressiveOptions);
      console.log('Second pass file size:', secondPass.size / 1024 / 1024, 'MB');
      
      // Final pass if still too large
      if (secondPass.size > 300 * 1024) {
        const finalOptions = {
          ...defaultOptions,
          maxSizeMB: 0.25,
          initialQuality: 0.4,
          maxWidthOrHeight: 800
        };
        
        const finalPass = await imageCompression(file, finalOptions);
        console.log('Final pass file size:', finalPass.size / 1024 / 1024, 'MB');
        return finalPass;
      }
      
      return secondPass;
    }
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image. Please try a smaller image.');
  }
};
