/**
 * 🖼️ Cloudflare Images Service
 * Making couple photos as beautiful as their love! 💕📸
 */

export interface ImageTransforms {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  blur?: number;
  sharpen?: number;
  brightness?: number;
  contrast?: number;
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  gravity?: 'auto' | 'side' | 'left' | 'right' | 'top' | 'bottom';
  dpr?: number; // Device pixel ratio for retina displays
}

export interface CoupleImagePresets {
  profileThumbnail: ImageTransforms;
  profileMedium: ImageTransforms;
  profileLarge: ImageTransforms;
  achievementBadge: ImageTransforms;
  galleryThumbnail: ImageTransforms;
  galleryFull: ImageTransforms;
  heroImage: ImageTransforms;
}

/**
 * 💝 Pre-configured image presets for couple-focused optimization
 */
export const COUPLE_IMAGE_PRESETS: CoupleImagePresets = {
  // Profile pictures - optimized for mobile and desktop viewing
  profileThumbnail: {
    width: 64,
    height: 64,
    quality: 85,
    format: 'webp',
    fit: 'cover',
    gravity: 'auto',
  },

  profileMedium: {
    width: 150,
    height: 150,
    quality: 90,
    format: 'webp',
    fit: 'cover',
    gravity: 'auto',
  },

  profileLarge: {
    width: 300,
    height: 300,
    quality: 90,
    format: 'webp',
    fit: 'cover',
    gravity: 'auto',
  },

  // Achievement badges - crisp and celebratory!
  achievementBadge: {
    width: 80,
    height: 80,
    quality: 95,
    format: 'webp',
    fit: 'contain',
  },

  // Gallery images - balance quality and loading speed
  galleryThumbnail: {
    width: 200,
    height: 200,
    quality: 80,
    format: 'webp',
    fit: 'cover',
    gravity: 'auto',
  },

  galleryFull: {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp',
    fit: 'scale-down',
  },

  // Hero/banner images - high quality for emotional impact
  heroImage: {
    width: 1200,
    height: 600,
    quality: 90,
    format: 'webp',
    fit: 'cover',
    gravity: 'auto',
  },
};

export class CloudflareImageService {
  private accountHash: string;
  private baseUrl: string;

  constructor(accountHash: string = 'plxxk0i1H1TUBzR_HC65xQ') {
    this.accountHash = accountHash;
    this.baseUrl = `https://imagedelivery.net/${accountHash}`;
  }

  /**
   * 🎨 Generate optimized image URL with transforms
   * @param imageId The Cloudflare Images ID
   * @param transforms Image transformation options
   * @returns Optimized image URL
   */
  getOptimizedUrl(imageId: string, transforms: ImageTransforms = {}): string {
    const variant = this.createVariant(transforms);
    return `${this.baseUrl}/${imageId}/${variant}`;
  }

  /**
   * 💕 Get preset-optimized image for couple photos
   * @param imageId The image ID
   * @param preset The optimization preset
   * @returns Optimized URL for the specific use case
   */
  getCoupleImageUrl(imageId: string, preset: keyof CoupleImagePresets): string {
    return this.getOptimizedUrl(imageId, COUPLE_IMAGE_PRESETS[preset]);
  }

  /**
   * 📱 Get responsive image set for different device sizes
   * @param imageId The image ID
   * @param baseTransforms Base transforms to apply
   * @returns Object with URLs for different screen densities
   */
  getResponsiveImageSet(imageId: string, baseTransforms: ImageTransforms) {
    return {
      '1x': this.getOptimizedUrl(imageId, { ...baseTransforms, dpr: 1 }),
      '2x': this.getOptimizedUrl(imageId, { ...baseTransforms, dpr: 2 }),
      '3x': this.getOptimizedUrl(imageId, { ...baseTransforms, dpr: 3 }),
    };
  }

  /**
   * 🎯 Generate srcset string for responsive images
   * @param imageId The image ID
   * @param sizes Array of width sizes for responsive images
   * @param transforms Base transforms
   * @returns Formatted srcset string
   */
  generateSrcSet(
    imageId: string,
    sizes: number[],
    transforms: Omit<ImageTransforms, 'width'> = {}
  ): string {
    return sizes
      .map((width) => {
        const url = this.getOptimizedUrl(imageId, { ...transforms, width });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * 🔄 Upload image to Cloudflare Images (requires API key)
   * Note: This would typically be done server-side for security
   * @param file The image file to upload
   * @param metadata Optional metadata
   * @returns Promise with upload result
   */
  async uploadImage(
    file: File,
    metadata?: Record<string, string>
  ): Promise<{
    id: string;
    url: string;
    variants: string[];
  }> {
    // This is a placeholder - actual implementation would require:
    // 1. Cloudflare API key
    // 2. Server-side endpoint or Worker for security
    // 3. Proper error handling

    console.log('🚀 Upload would happen here:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      metadata,
    });

    // Mock response for now
    return {
      id: 'mock-image-id',
      url: this.getOptimizedUrl('mock-image-id', COUPLE_IMAGE_PRESETS.profileMedium),
      variants: Object.keys(COUPLE_IMAGE_PRESETS),
    };
  }

  /**
   * 🛠️ Create variant string from transforms
   * @private
   */
  private createVariant(transforms: ImageTransforms): string {
    const params = Object.entries(transforms)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    return params || 'public';
  }
}

/**
 * 🌟 Default service instance
 * Configure with your actual Cloudflare account hash!
 */
export const imageService = new CloudflareImageService();

/**
 * 🎨 React hook for optimized couple images
 * @param imageId The image ID
 * @param preset The optimization preset
 * @returns Optimized image URL and loading utilities
 */
export function useCoupleImage(imageId: string, preset: keyof CoupleImagePresets) {
  const optimizedUrl = imageService.getCoupleImageUrl(imageId, preset);
  const responsiveSet = imageService.getResponsiveImageSet(imageId, COUPLE_IMAGE_PRESETS[preset]);

  return {
    src: optimizedUrl,
    srcSet: `${responsiveSet['1x']} 1x, ${responsiveSet['2x']} 2x, ${responsiveSet['3x']} 3x`,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}

/**
 * 💕 Example usage in React components:
 *
 * ```tsx
 * import { useCoupleImage, imageService } from '@/services/cloudflareImages';
 *
 * function CoupleProfile({ couple }: { couple: Couple }) {
 *   const profileImage = useCoupleImage(couple.profileImageId, 'profileMedium');
 *
 *   return (
 *     <img
 *       {...profileImage}
 *       alt={`${couple.name1} and ${couple.name2}`}
 *       className="rounded-full border-2 border-purple-200"
 *     />
 *   );
 * }
 *
 * // For custom transforms:
 * const customUrl = imageService.getOptimizedUrl('image-id', {
 *   width: 400,
 *   quality: 90,
 *   format: 'webp',
 *   brightness: 1.1, // Slightly brighter for that love glow! ✨
 * });
 * ```
 */
