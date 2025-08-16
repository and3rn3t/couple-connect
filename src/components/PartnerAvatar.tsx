/**
 * 💕 Optimized Partner Avatar Component
 * Beautiful, fast-loading partner avatars with Cloudflare Images! ✨
 */

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CoupleProfileImage } from '@/components/CoupleImageComponents';
import { cn } from '@/lib/utils';

export interface PartnerAvatarProps {
  partner: {
    id: string;
    name: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

/**
 * 🌟 Smart partner avatar that uses Cloudflare Images when available,
 * falls back to beautiful initials when not
 */
export function PartnerAvatar({
  partner,
  size = 'md',
  className,
  showOnlineStatus = false,
  isOnline = false,
}: PartnerAvatarProps) {
  const hasImageAvatar = partner.avatar && !partner.avatar.match(/^[A-Z]{1,2}$/); // Not just initials

  return (
    <div className={cn('relative', className)}>
      <Avatar className={cn(sizeClasses[size], 'border-2 border-white shadow-sm')}>
        {hasImageAvatar ? (
          <CoupleProfileImage
            imageId={partner.avatar!}
            alt={`${partner.name}'s avatar`}
            preset={size === 'sm' ? 'profileThumbnail' : 'profileMedium'}
            className="w-full h-full"
            showLoadingAnimation={false}
          />
        ) : (
          <AvatarFallback
            className={cn(
              'bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold',
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
            )}
          >
            {partner.avatar || partner.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Online status indicator */}
      {showOnlineStatus && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5',
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}

/**
 * 💝 Couple avatar showing both partners together
 */
export function CoupleAvatar({
  partner1,
  partner2,
  size = 'lg',
  className,
}: {
  partner1: PartnerAvatarProps['partner'];
  partner2: PartnerAvatarProps['partner'];
  size?: PartnerAvatarProps['size'];
  className?: string;
}) {
  return (
    <div className={cn('relative flex', className)}>
      <PartnerAvatar partner={partner1} size={size} className="z-10" />
      <PartnerAvatar partner={partner2} size={size} className="-ml-2 border-2 border-white" />

      {/* Love heart overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs transform translate-x-1 translate-y-1">
          💕
        </div>
      </div>
    </div>
  );
}

/**
 * 🎯 Partner selector with optimized avatars
 */
export function PartnerSelector({
  partners,
  selectedPartnerId,
  onSelect,
  size = 'md',
  showNames = true,
}: {
  partners: PartnerAvatarProps['partner'][];
  selectedPartnerId?: string;
  onSelect: (partnerId: string) => void;
  size?: PartnerAvatarProps['size'];
  showNames?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {partners.map((partner) => (
        <button
          key={partner.id}
          onClick={() => onSelect(partner.id)}
          className={cn(
            'flex flex-col items-center gap-2 p-2 rounded-lg transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20',
            selectedPartnerId === partner.id &&
              'bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-500'
          )}
        >
          <PartnerAvatar
            partner={partner}
            size={size}
            showOnlineStatus={true}
            isOnline={Math.random() > 0.5} // Mock online status
          />
          {showNames && (
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {partner.name}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
