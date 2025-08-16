import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function mobileCSSOptimization(): Plugin {
  return {
    name: 'mobile-css-optimization',
    generateBundle(options, bundle) {
      // Find CSS files in bundle
      const cssFiles = Object.keys(bundle).filter(fileName => 
        fileName.endsWith('.css')
      );
      
      for (const fileName of cssFiles) {
        const file = bundle[fileName];
        if (file.type === 'asset' && typeof file.source === 'string') {
          // Remove unused CSS for mobile
          let css = file.source;
          
          // Remove backdrop-filter utilities (not well supported on mobile)
          css = css.replace(/\.backdrop-[^\s{]+[^}]*}/g, '');
          
          // Remove complex grid utilities for mobile
          css = css.replace(/\.grid-cols-(?:[5-9]|1[0-9])[^}]*}/g, '');
          
          // Remove large spacing utilities for mobile
          css = css.replace(/\.(p|m)[lrxy]?-(?:2[4-9]|[3-9][0-9])[^}]*}/g, '');
          
          // Remove unused responsive variants
          css = css.replace(/@media[^{]+\([^)]*xl[^)]*\)[^}]*{[^}]*}/g, '');
          
          // Compress whitespace
          css = css.replace(/\s+/g, ' ').trim();
          
          file.source = css;
          
          console.log(`📱 Optimized ${fileName}: ${(css.length / 1024).toFixed(1)}KB`);
        }
      }
    },
  };
}
