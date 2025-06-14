export interface CameraOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    facingMode?: 'user' | 'environment';
  }
  
  export const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  export const isIOS = (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };
  
  export const isAndroid = (): boolean => {
    return /Android/i.test(navigator.userAgent);
  };
  
  export const createMobileCameraInput = (
    onFileSelect: (file: File) => void,
    options: CameraOptions = {}
  ): HTMLInputElement => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    // Enhanced mobile camera settings
    if (isMobileDevice()) {
      // For mobile devices, add capture attribute to trigger camera
      input.setAttribute('capture', 'environment'); // Use rear camera by default
      
      // iOS specific optimizations
      if (isIOS()) {
        input.accept = 'image/*;capture=camera';
      }
      
      // Android specific optimizations
      if (isAndroid()) {
        input.accept = 'image/*';
        input.setAttribute('capture', 'camera');
      }
    }
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      // Clean up
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };
    
    // Handle cancellation
    input.oncancel = () => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };
    
    return input;
  };
  
  export const triggerMobileCamera = (
    onFileSelect: (file: File) => void,
    options: CameraOptions = {}
  ): void => {
    const input = createMobileCameraInput(onFileSelect, options);
    document.body.appendChild(input);
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      input.click();
    }, 100);
  };
  
  // Enhanced file validation for mobile uploads
  export const validateMobileImage = (file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Please select an image file.' };
    }
    
    // Check file size (35MB limit)
    if (file.size > 35 * 1024 * 1024) {
      return { isValid: false, error: 'Please select an image smaller than 35MB.' };
    }
    
    // Additional mobile-specific validations
    if (isMobileDevice()) {
      // Check if file was actually captured/selected
      if (file.size === 0) {
        return { isValid: false, error: 'Image capture failed. Please try again.' };
      }
    }
    
    return { isValid: true };
  };