/**
 * 💕 Optimized Couple Image Components
 * Making love photos load faster than lightning! ⚡📸
 */

import React, { useState } from 'react';
import { useCoupleImage, imageService, COUPLE_IMAGE_PRESETS } from '@/services/cloudflareImages';
import { cn } from '@/lib/utils';

export interface CoupleImageProps {
  imageId: string;
  alt: string;
  className?: string;
  preset?: keyof typeof COUPLE_IMAGE_PRESETS;
  showLoadingAnimation?: boolean;
  fallbackSrc?: string;
}

/**
 * 🌟 Optimized couple profile image with automatic optimization
 */
export function CoupleProfileImage({
  imageId,
  alt,
  className,
  preset = 'profileMedium',
  showLoadingAnimation = true,
  fallbackSrc = '/placeholder-couple.jpg',
}: CoupleImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const optimizedImage = useCoupleImage(imageId, preset);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading animation - love hearts floating! 💕 */}
      {isLoading && showLoadingAnimation && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="animate-pulse">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-300 mt-2 text-center">
              Loading love... 💕
            </p>
          </div>
        </div>
      )}

      {/* Optimized image */}
      <img
        {...optimizedImage}
        alt={alt}
        src={hasError ? fallbackSrc : optimizedImage.src}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />

      {/* Optimization badge - show how awesome the optimization is! */}
      {!isLoading && !hasError && (
        <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          ⚡ Optimized
        </div>
      )}
    </div>
  );
}

/**
 * 🎨 Gallery of couple photos with different optimization presets
 */
export function CouplePhotoGallery({
  images,
  onImageClick,
}: {
  images: Array<{ id: string; alt: string; caption?: string }>;
  onImageClick?: (imageId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="group cursor-pointer transform transition-transform hover:scale-105"
          onClick={() => onImageClick?.(image.id)}
        >
          <div className="aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CoupleProfileImage
              imageId={image.id}
              alt={image.alt}
              preset="galleryThumbnail"
              className="w-full h-full"
            />
          </div>

          {image.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">
              {image.caption}
            </p>
          )}

          {/* Show index for demonstration */}
          <div className="absolute top-2 left-2 bg-purple-500/80 text-white text-xs px-2 py-1 rounded-full">
            #{index + 1}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 🏆 Achievement badge with optimized image
 */
export function AchievementBadge({
  imageId,
  title,
  description,
  isUnlocked = false,
  className,
}: {
  imageId: string;
  title: string;
  description: string;
  isUnlocked?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative group transition-all duration-300',
        isUnlocked ? 'transform hover:scale-110 cursor-pointer' : 'opacity-50 grayscale',
        className
      )}
    >
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-1 rounded-full">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-white">
          <CoupleProfileImage
            imageId={imageId}
            alt={`Achievement: ${title}`}
            preset="achievementBadge"
            className="w-full h-full"
          />
        </div>
      </div>

      {isUnlocked && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
          ✓
        </div>
      )}

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/80 text-white p-2 rounded text-xs whitespace-nowrap">
          <div className="font-semibold">{title}</div>
          <div className="text-gray-300">{description}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * 🎯 Hero banner with optimized background image
 */
export function CoupleHeroBanner({
  imageId,
  title,
  subtitle,
  children,
  className,
}: {
  imageId: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const heroImageUrl = imageService.getCoupleImageUrl(imageId, 'heroImage');

  return (
    <div
      className={cn('relative h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden', className)}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{title}</h1>
        {subtitle && <p className="text-lg md:text-xl mb-4 opacity-90">{subtitle}</p>}
        {children}
      </div>

      {/* Optimization indicator */}
      <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
        🚀 Cloudflare Optimized
      </div>
    </div>
  );
}

/**
 * 📱 Responsive image with multiple breakpoints
 */
export function ResponsiveCoupleImage({
  imageId,
  alt,
  sizes = [320, 640, 1024, 1280],
  className,
}: {
  imageId: string;
  alt: string;
  sizes?: number[];
  className?: string;
}) {
  const srcSet = imageService.generateSrcSet(imageId, sizes, {
    quality: 85,
    format: 'webp',
  });

  return (
    <img
      src={imageService.getOptimizedUrl(imageId, { width: 640, quality: 85, format: 'webp' })}
      srcSet={srcSet}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

/**
 * 🎪 Image upload component with Cloudflare Images integration
 */
export function CoupleImageUpload({
  onImageUploaded,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
}: {
  onImageUploaded?: (imageId: string, url: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      alert(`File too large! Please select an image under ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress (replace with actual Cloudflare Images API call)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // In a real implementation, you'd upload to Cloudflare Images here
      const result = await imageService.uploadImage(file, {
        couple_upload: 'true',
        upload_timestamp: new Date().toISOString(),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onImageUploaded?.(result.id, result.url);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Upload failed! Please try again.');
    }
  };

  return (
    <div className={cn('relative', className)}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
        id="couple-image-upload"
      />

      <label
        htmlFor="couple-image-upload"
        className={cn(
          'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          isUploading
            ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-purple-50 dark:bg-gray-800 dark:hover:bg-purple-900/20'
        )}
      >
        {isUploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-purple-600 dark:text-purple-300">
              Uploading love photo... {uploadProgress}% 💕
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Click to upload couple photo</p>
            <p className="text-xs text-gray-400">Will be automatically optimized! ✨</p>
          </div>
        )}
      </label>
    </div>
  );
}

/**
 * 💝 Example usage demonstrations
 */
export function ImageOptimizationDemo() {
  const demoImages = [
    { id: 'demo-couple-1', alt: 'Happy couple at sunset', caption: 'Sunset Love 🌅' },
    { id: 'demo-couple-2', alt: 'Couple cooking together', caption: 'Cooking Together 👨‍🍳👩‍🍳' },
    { id: 'demo-couple-3', alt: 'Anniversary celebration', caption: 'Anniversary 🎉' },
    { id: 'demo-couple-4', alt: 'Beach vacation', caption: 'Beach Day 🏖️' },
  ];

  const achievements = [
    {
      id: 'badge-first-date',
      title: 'First Date',
      description: 'Completed your first relationship activity!',
    },
    {
      id: 'badge-week-streak',
      title: 'Week Streak',
      description: '7 days of consistent activities',
    },
    {
      id: 'badge-communication',
      title: 'Great Communicator',
      description: 'Excellent communication skills',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">🖼️ Cloudflare Images Demo</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          All images below are automatically optimized by Cloudflare Images! Notice how fast they
          load and how perfect they look on every device! ⚡📱
        </p>
      </div>

      {/* Profile Images */}
      <div>
        <h3 className="text-lg font-semibold mb-3">👫 Profile Images</h3>
        <div className="flex gap-4">
          <CoupleProfileImage
            imageId="demo-couple-profile"
            alt="Couple profile"
            preset="profileThumbnail"
            className="w-16 h-16 rounded-full"
          />
          <CoupleProfileImage
            imageId="demo-couple-profile"
            alt="Couple profile"
            preset="profileMedium"
            className="w-32 h-32 rounded-lg"
          />
          <CoupleProfileImage
            imageId="demo-couple-profile"
            alt="Couple profile"
            preset="profileLarge"
            className="w-48 h-48 rounded-xl"
          />
        </div>
      </div>

      {/* Photo Gallery */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📸 Photo Gallery</h3>
        <CouplePhotoGallery
          images={demoImages}
          onImageClick={(imageId) => console.log('Clicked image:', imageId)}
        />
      </div>

      {/* Achievement Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-3">🏆 Achievement Badges</h3>
        <div className="flex gap-4">
          {achievements.map((achievement, index) => (
            <AchievementBadge
              key={achievement.id}
              imageId={achievement.id}
              title={achievement.title}
              description={achievement.description}
              isUnlocked={index < 2} // First two are unlocked
            />
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div>
        <h3 className="text-lg font-semibold mb-3">🌟 Hero Banner</h3>
        <CoupleHeroBanner
          imageId="demo-hero-couple"
          title="Your Love Story"
          subtitle="Building stronger relationships together"
        >
          <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/30 transition-colors">
            Start Your Journey 💕
          </button>
        </CoupleHeroBanner>
      </div>

      {/* Image Upload */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📤 Image Upload</h3>
        <CoupleImageUpload
          onImageUploaded={(imageId, url) => {
            console.log('Image uploaded:', { imageId, url });
            alert(`Image uploaded successfully! ID: ${imageId}`);
          }}
          className="max-w-md"
        />
      </div>
    </div>
  );
}
