
// Input sanitization utilities to prevent XSS attacks
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags and potentially dangerous characters but preserve spaces
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, (char) => { // Escape dangerous characters
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    });
  // Don't trim here to preserve spaces
};

export const sanitizeName = (input: string): string => {
  if (!input) return '';
  
  // For names, we want to preserve spaces and allow common name characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, (char) => { // Escape dangerous characters
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .replace(/[^a-zA-Z\s'-]/g, ''); // Only allow letters, spaces, hyphens, and apostrophes
    // Removed .trim() to preserve spaces!
};

export const sanitizeNumericInput = (input: string): string => {
  return input.replace(/[^0-9.]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@sst\.scaler\.com$/;
  return emailRegex.test(email);
};

export const validatePrice = (price: number, marketPrice?: number): boolean => {
  if (price <= 0) return false;
  if (marketPrice && price > marketPrice) return false;
  return true;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateUPIId = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/;
  return upiRegex.test(upiId);
};
