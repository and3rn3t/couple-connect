import { lazy, Suspense } from 'react';
import type { ComponentType, SVGProps } from 'react';

// Type definitions for icon props
interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

// Icon loading placeholder component
export const IconPlaceholder = ({ size = 16 }: { size?: number }) => {
  const sizeClass = size <= 16 ? 'w-4 h-4' : size <= 24 ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div
      className={`inline-block bg-current opacity-30 rounded-sm ${sizeClass}`}
      data-size={size}
      aria-hidden="true"
    />
  );
};

// HOC for lazy icon loading
export const withLazyIcon = (IconComponent: ComponentType<IconProps>, fallbackSize = 16) => {
  const LazyIconWrapper = (props: IconProps) => (
    <Suspense fallback={<IconPlaceholder size={fallbackSize} />}>
      <IconComponent {...props} />
    </Suspense>
  );

  LazyIconWrapper.displayName = `LazyIcon(${IconComponent.displayName || IconComponent.name || 'Component'})`;
  return LazyIconWrapper;
};

// Essential icons (inline SVGs for critical path)
export const EssentialIcons = {
  Heart: ({ size = 16, weight = 'regular', ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.69,146.26,196.16,128,206.8Z" />
    </svg>
  ),

  CheckCircle: ({ size = 16, weight = 'regular', ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
    </svg>
  ),

  X: ({ size = 16, weight = 'regular', ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
    </svg>
  ),

  Plus: ({ size = 16, weight = 'regular', ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
    </svg>
  ),
};

// Lazy-loaded phosphor icons
export const LazyPhosphorIcons = {
  Heart: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Heart }))),
  UserPlus: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.UserPlus }))),
  Users: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Users }))),
  TrendUp: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.TrendUp }))),
  CheckCircle: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.CheckCircle }))
  ),
  Target: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Target }))),
  Calendar: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Calendar }))),
  ChartBar: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.ChartBar }))),
  ArrowClockwise: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.ArrowClockwise }))
  ),
  WifiSlash: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.WifiSlash }))),
  CloudArrowUp: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.CloudArrowUp }))
  ),
  X: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.X }))),
  Download: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Download }))),
  Clock: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Clock }))),
  Warning: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Warning }))),
  MagicWand: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.MagicWand }))),
  ArrowRight: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.ArrowRight }))),
  User: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.User }))),
  SignOut: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.SignOut }))),
  Gear: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Gear }))),
  Bell: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Bell }))),
  Plus: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Plus }))),
  Trophy: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Trophy }))),
  Star: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Star }))),
  Gift: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Gift }))),
  PencilSimple: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.PencilSimple }))
  ),
  MagnifyingGlass: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.MagnifyingGlass }))
  ),
  Check: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Check }))),
  Rocket: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Rocket }))),
  Lightbulb: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Lightbulb }))),
  FireSimple: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.FireSimple }))),
  Coins: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Coins }))),
  Medal: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Medal }))),
  Crown: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Crown }))),
  Sparkle: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Sparkle }))),
  Lightning: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Lightning }))),
  GameController: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.GameController }))
  ),
  Confetti: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Confetti }))),
  Smiley: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Smiley }))),
  HandsClapping: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.HandsClapping }))
  ),
  ThumbsUp: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.ThumbsUp }))),
  Flame: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Flame }))),
  Certificate: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.Certificate }))
  ),
  BookOpen: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.BookOpen }))),
  PaintBrush: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.PaintBrush }))),
  MusicNote: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.MusicNote }))),
  Camera: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Camera }))),
  Airplane: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Airplane }))),
  MapPin: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.MapPin }))),
  Coffee: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Coffee }))),
  Wine: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Wine }))),
  Hamburger: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Hamburger }))),
  Bicycle: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Bicycle }))),
  Car: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Car }))),
  Train: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Train }))),
  Mountains: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Mountains }))),
  Tree: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Tree }))),
  FlowerLotus: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.FlowerLotus }))
  ),
  Sun: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Sun }))),
  Moon: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Moon }))),
  CloudRain: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.CloudRain }))),
  Snowflake: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Snowflake }))),
  Thermometer: lazy(() =>
    import('@phosphor-icons/react').then((m) => ({ default: m.Thermometer }))
  ),
};

// Export commonly used icons with lazy wrapper
export const Heart = withLazyIcon(LazyPhosphorIcons.Heart, 16);
export const UserPlus = withLazyIcon(LazyPhosphorIcons.UserPlus, 16);
export const Users = withLazyIcon(LazyPhosphorIcons.Users, 16);
export const TrendUp = withLazyIcon(LazyPhosphorIcons.TrendUp, 16);
export const CheckCircle = withLazyIcon(LazyPhosphorIcons.CheckCircle, 16);
export const Target = withLazyIcon(LazyPhosphorIcons.Target, 16);
export const Calendar = withLazyIcon(LazyPhosphorIcons.Calendar, 16);
export const ChartBar = withLazyIcon(LazyPhosphorIcons.ChartBar, 16);
export const ArrowClockwise = withLazyIcon(LazyPhosphorIcons.ArrowClockwise, 16);
export const WifiSlash = withLazyIcon(LazyPhosphorIcons.WifiSlash, 16);
export const CloudArrowUp = withLazyIcon(LazyPhosphorIcons.CloudArrowUp, 16);
export const X = withLazyIcon(LazyPhosphorIcons.X, 16);
export const Download = withLazyIcon(LazyPhosphorIcons.Download, 16);
export const Clock = withLazyIcon(LazyPhosphorIcons.Clock, 16);
export const Warning = withLazyIcon(LazyPhosphorIcons.Warning, 16);
export const MagicWand = withLazyIcon(LazyPhosphorIcons.MagicWand, 16);
export const ArrowRight = withLazyIcon(LazyPhosphorIcons.ArrowRight, 16);
export const User = withLazyIcon(LazyPhosphorIcons.User, 16);
export const SignOut = withLazyIcon(LazyPhosphorIcons.SignOut, 16);
export const Gear = withLazyIcon(LazyPhosphorIcons.Gear, 16);
export const Bell = withLazyIcon(LazyPhosphorIcons.Bell, 16);
export const Plus = withLazyIcon(LazyPhosphorIcons.Plus, 16);
export const Trophy = withLazyIcon(LazyPhosphorIcons.Trophy, 16);
export const Star = withLazyIcon(LazyPhosphorIcons.Star, 16);
export const Gift = withLazyIcon(LazyPhosphorIcons.Gift, 16);
export const PencilSimple = withLazyIcon(LazyPhosphorIcons.PencilSimple, 16);
export const MagnifyingGlass = withLazyIcon(LazyPhosphorIcons.MagnifyingGlass, 16);
export const Check = withLazyIcon(LazyPhosphorIcons.Check, 16);
export const Rocket = withLazyIcon(LazyPhosphorIcons.Rocket, 16);
export const Lightbulb = withLazyIcon(LazyPhosphorIcons.Lightbulb, 16);
export const FireSimple = withLazyIcon(LazyPhosphorIcons.FireSimple, 16);
export const Coins = withLazyIcon(LazyPhosphorIcons.Coins, 16);
export const Medal = withLazyIcon(LazyPhosphorIcons.Medal, 16);
export const Crown = withLazyIcon(LazyPhosphorIcons.Crown, 16);
export const Sparkle = withLazyIcon(LazyPhosphorIcons.Sparkle, 16);
export const Lightning = withLazyIcon(LazyPhosphorIcons.Lightning, 16);
export const GameController = withLazyIcon(LazyPhosphorIcons.GameController, 16);
export const Confetti = withLazyIcon(LazyPhosphorIcons.Confetti, 16);
export const Smiley = withLazyIcon(LazyPhosphorIcons.Smiley, 16);
export const HandsClapping = withLazyIcon(LazyPhosphorIcons.HandsClapping, 16);
export const ThumbsUp = withLazyIcon(LazyPhosphorIcons.ThumbsUp, 16);
export const Flame = withLazyIcon(LazyPhosphorIcons.Flame, 16);
export const Certificate = withLazyIcon(LazyPhosphorIcons.Certificate, 16);
export const BookOpen = withLazyIcon(LazyPhosphorIcons.BookOpen, 16);
export const PaintBrush = withLazyIcon(LazyPhosphorIcons.PaintBrush, 16);
export const MusicNote = withLazyIcon(LazyPhosphorIcons.MusicNote, 16);
export const Camera = withLazyIcon(LazyPhosphorIcons.Camera, 16);
export const Airplane = withLazyIcon(LazyPhosphorIcons.Airplane, 16);
export const MapPin = withLazyIcon(LazyPhosphorIcons.MapPin, 16);
export const Coffee = withLazyIcon(LazyPhosphorIcons.Coffee, 16);
export const Wine = withLazyIcon(LazyPhosphorIcons.Wine, 16);
export const Hamburger = withLazyIcon(LazyPhosphorIcons.Hamburger, 16);
export const Bicycle = withLazyIcon(LazyPhosphorIcons.Bicycle, 16);
export const Car = withLazyIcon(LazyPhosphorIcons.Car, 16);
export const Train = withLazyIcon(LazyPhosphorIcons.Train, 16);
export const Mountains = withLazyIcon(LazyPhosphorIcons.Mountains, 16);
export const Tree = withLazyIcon(LazyPhosphorIcons.Tree, 16);
export const FlowerLotus = withLazyIcon(LazyPhosphorIcons.FlowerLotus, 16);
export const Sun = withLazyIcon(LazyPhosphorIcons.Sun, 16);
export const Moon = withLazyIcon(LazyPhosphorIcons.Moon, 16);
export const CloudRain = withLazyIcon(LazyPhosphorIcons.CloudRain, 16);
export const Snowflake = withLazyIcon(LazyPhosphorIcons.Snowflake, 16);
export const Thermometer = withLazyIcon(LazyPhosphorIcons.Thermometer, 16);

// Export all icons as default
export default {
  ...EssentialIcons,
  ...LazyPhosphorIcons,
  Heart,
  UserPlus,
  Users,
  TrendUp,
  CheckCircle,
  Target,
  Calendar,
  ChartBar,
  ArrowClockwise,
  WifiSlash,
  CloudArrowUp,
  X,
  Download,
  Clock,
  Warning,
  MagicWand,
  ArrowRight,
  User,
  SignOut,
  Gear,
  Bell,
  Plus,
  Trophy,
  Star,
  Gift,
  PencilSimple,
  MagnifyingGlass,
  Check,
  Rocket,
  Lightbulb,
  FireSimple,
  Coins,
  Medal,
  Crown,
  Sparkle,
  Lightning,
  GameController,
  Confetti,
  Smiley,
  HandsClapping,
  ThumbsUp,
  Flame,
  Certificate,
  BookOpen,
  PaintBrush,
  MusicNote,
  Camera,
  Airplane,
  MapPin,
  Coffee,
  Wine,
  Hamburger,
  Bicycle,
  Car,
  Train,
  Mountains,
  Tree,
  FlowerLotus,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Thermometer,
};
