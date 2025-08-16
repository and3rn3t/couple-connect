import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, MagicWand, Heart, Gift } from '@/components/ui/InlineIcons';

interface CelebrationAnimationProps {
  show: boolean;
  type: 'achievement' | 'streak' | 'reward' | 'challenge';
  title: string;
  points?: number;
  onComplete: () => void;
}

export default function CelebrationAnimation({
  show,
  type,
  title,
  points,
  onComplete,
}: CelebrationAnimationProps) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    if (show) {
      // Generate particles for confetti effect
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);

      // Auto-hide after animation
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-16 h-16 text-yellow-500" weight="fill" />;
      case 'streak':
        return <MagicWand className="w-16 h-16 text-orange-500" weight="fill" />;
      case 'reward':
        return <Gift className="w-16 h-16 text-purple-500" weight="fill" />;
      case 'challenge':
        return <Star className="w-16 h-16 text-blue-500" weight="fill" />;
      default:
        return <Heart className="w-16 h-16 text-pink-500" weight="fill" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'achievement':
        return ['#fbbf24', '#f59e0b', '#d97706'];
      case 'streak':
        return ['#f97316', '#ea580c', '#dc2626'];
      case 'reward':
        return ['#a855f7', '#9333ea', '#7c3aed'];
      case 'challenge':
        return ['#3b82f6', '#2563eb', '#1d4ed8'];
      default:
        return ['#ec4899', '#db2777', '#be185d'];
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Confetti Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 0,
                scale: 0,
                x: '50vw',
                y: '50vh',
                rotate: 0,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                x: `${particle.x}vw`,
                y: `${particle.y}vh`,
                rotate: 360,
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: getColors()[particle.id % getColors().length],
              }}
            />
          ))}

          {/* Main Celebration Card */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.2,
            }}
            className="bg-card border border-border rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4"
          >
            {/* Pulsing Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotateY: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="mb-4 flex justify-center"
            >
              {getIcon()}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-foreground mb-2"
            >
              {title}
            </motion.h2>

            {/* Points */}
            {points && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.7,
                  type: 'spring',
                  stiffness: 500,
                }}
                className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4"
              >
                <Star className="w-5 h-5" weight="fill" />
                <span className="font-semibold">+{points} points</span>
              </motion.div>
            )}

            {/* Celebration Text */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-muted-foreground mb-6"
            >
              {type === 'achievement' && 'Amazing achievement unlocked!'}
              {type === 'streak' && 'Keep the momentum going!'}
              {type === 'reward' && 'Enjoy your well-earned reward!'}
              {type === 'challenge' && 'Challenge completed successfully!'}
            </motion.p>

            {/* Animated Border */}
            <motion.div
              animate={{
                background: [
                  `linear-gradient(45deg, ${getColors()[0]}, ${getColors()[1]})`,
                  `linear-gradient(45deg, ${getColors()[1]}, ${getColors()[2]})`,
                  `linear-gradient(45deg, ${getColors()[2]}, ${getColors()[0]})`,
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-2xl opacity-20 -z-10"
            />
          </motion.div>

          {/* Click to dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 text-white/70 text-sm"
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
