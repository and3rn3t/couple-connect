/**
 * 🖼️ Cloudflare Images Demo Page
 * See the magic of optimized couple photos! ✨💕
 */

import React from 'react';
import { ImageOptimizationDemo } from '@/components/CoupleImageComponents';

export function CloudflareImagesDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🚀 Cloudflare Images in Action!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Watch how Cloudflare Images makes your couple photos load lightning-fast while looking
            absolutely stunning on every device! ⚡📱💕
          </p>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">80%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Smaller File Sizes</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">⚡ 2x</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Faster Loading</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">📱 100%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Mobile Optimized</div>
          </div>
        </div>

        {/* Demo Components */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8">
          <ImageOptimizationDemo />
        </div>

        {/* Technical Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              🎯 Automatic Optimization
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>✅ WebP/AVIF format conversion</li>
              <li>✅ Responsive image sizing</li>
              <li>✅ Quality optimization</li>
              <li>✅ Lossless compression</li>
            </ul>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">🌍 Global Delivery</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>✅ 200+ edge locations worldwide</li>
              <li>✅ Sub-50ms response times</li>
              <li>✅ Intelligent caching</li>
              <li>✅ DDoS protection</li>
            </ul>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-12 bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm overflow-x-auto">
          <div className="text-gray-400 mb-2">
            {/* Using optimized couple images is this easy! 💕 */}
          </div>
          <div>
            <span className="text-blue-400">import</span> {`{ useCoupleImage }`}{' '}
            <span className="text-blue-400">from</span>{' '}
            <span className="text-yellow-400">'@/services/cloudflareImages'</span>;
          </div>
          <br />
          <div>
            <span className="text-blue-400">function</span>{' '}
            <span className="text-green-400">CoupleProfile</span>({`{ couple }`}) {`{`}
          </div>
          <div className="ml-4">
            <span className="text-blue-400">const</span> image ={' '}
            <span className="text-green-400">useCoupleImage</span>(couple.photoId,{' '}
            <span className="text-yellow-400">'profileMedium'</span>);
          </div>
          <br />
          <div className="ml-4">
            <span className="text-blue-400">return</span>{' '}
            <span className="text-yellow-400">&lt;img {`{...image}`} alt="Couple" /&gt;</span>;
          </div>
          <div>{`}`}</div>
          <br />
          <div className="text-gray-400">{/* That's it! Automatic optimization! ⚡✨ */}</div>
        </div>
      </div>
    </div>
  );
}
