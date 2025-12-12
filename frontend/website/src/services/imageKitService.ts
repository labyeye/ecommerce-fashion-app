import ImageKit from 'imagekit-javascript';

// Lazy ImageKit initialization to avoid throwing during module load when
// environment variables are missing (e.g. local dev without secrets).
let imagekit: any | null = null;
let imageKitInitError: string | null = null;

const initImageKit = () => {
  if (imagekit || imageKitInitError) return;
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '';
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '';

  if (!publicKey || !urlEndpoint) {
    imageKitInitError = 'Missing ImageKit configuration: VITE_IMAGEKIT_PUBLIC_KEY and/or VITE_IMAGEKIT_URL_ENDPOINT';
    console.warn(imageKitInitError);
    return;
  }

  try {
    imagekit = new ImageKit({ publicKey, urlEndpoint });
  } catch (err: any) {
    imageKitInitError = err?.message || String(err);
    console.warn('Failed to initialize ImageKit SDK:', imageKitInitError);
    imagekit = null;
  }
};

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

interface ImageKitUploadResult {
  url: string;
  fileId: string;
  filePath: string;
  name: string;
  size: number;
  versionInfo?: {
    id: string;
    name: string;
  };
}

interface AuthParams {
  signature: string;
  expire: number;
  token: string;
}

/**
 * Get authentication parameters from backend
 */
const getAuthParams = async (authToken: string): Promise<AuthParams> => {
  const apiBase = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${apiBase}/api/customer/imagekit-auth`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to get auth params: ${response.status}`);
  }

  const data = await response.json();
  
  console.log('Received auth params from backend:', data);
  
  if (!data.success) {
    throw new Error(data.message || 'Authentication failed');
  }

  return {
    signature: data.signature,
    expire: data.expire,
    token: data.token,
  };
};

/**
 * Upload an image file to ImageKit
 * @param file - The image file to upload
 * @param fileName - Optional custom filename
 * @param authToken - User authentication token for backend
 * @returns Promise with upload result
 */
export const uploadImageToImageKit = async (
  file: File,
  authToken: string,
  fileName?: string
): Promise<UploadResponse> => {
  try {
    // Validate environment variables
    const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;

    if (!publicKey) {
      throw new Error('ImageKit public key is not configured');
    }

    if (!authToken) {
      throw new Error('Authentication token is required');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }

    // Initialize ImageKit if possible
    initImageKit();
    if (!imagekit) {
      throw new Error(imageKitInitError || 'ImageKit is not configured');
    }

    // Get authentication parameters from backend
    const authParams = await getAuthParams(authToken);

    // Upload to ImageKit (no folder specified)
    const uploadResponse = await imagekit.upload({
      file: file,
      fileName: fileName || `profile-${Date.now()}`,
      signature: authParams.signature,
      expire: authParams.expire,
      token: authParams.token,
    });

    console.log('ImageKit upload response:', uploadResponse);

    if (!uploadResponse || !uploadResponse.url) {
      console.error('ImageKit upload returned unexpected response:', uploadResponse);
      throw new Error('Upload succeeded but no URL returned');
    }

    return {
      success: true,
      url: uploadResponse.url,
    };

  } catch (error) {
    console.error('ImageKit upload error:', error);
    
    // Return user-friendly error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to upload image to ImageKit';

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Generate a transformation URL for an ImageKit image
 * @param imageUrl - The original ImageKit image URL
 * @param transformations - Object with transformation parameters
 * @returns Transformed image URL
 */
export const getTransformedImageUrl = (
  imageUrl: string,
  transformations: {
    width?: number;
    height?: number;
    cropMode?: 'pad_resize' | 'crop' | 'pad_extract';
    quality?: number;
    format?: 'jpg' | 'png' | 'webp';
  }
): string => {
  try {
    const { width, height, cropMode, quality, format } = transformations;
    
    const transformParams: string[] = [];
    
    if (width) transformParams.push(`w-${width}`);
    if (height) transformParams.push(`h-${height}`);
    if (cropMode) transformParams.push(`cm-${cropMode}`);
    if (quality) transformParams.push(`q-${quality}`);
    if (format) transformParams.push(`f-${format}`);
    
    if (transformParams.length === 0) {
      return imageUrl;
    }
    
    const transformString = transformParams.join(',');
    
    // Insert transformations into ImageKit URL if it matches the ImageKit pattern.
    // ImageKit URL format: https://ik.imagekit.io/your_imagekit_id/tr:transformations/path/to/image
    const match = imageUrl.match(/(https:\/\/ik\.imagekit\.io\/[^\/]+)(\/.*)/);
    if (match) {
      return imageUrl.replace(match[0], `${match[1]}/tr:${transformString}${match[2]}`);
    }
    return imageUrl;
  } catch (error) {
    console.warn('Failed to generate transformed URL:', error);
    return imageUrl;
  }
};

export default { uploadImageToImageKit, getTransformedImageUrl };