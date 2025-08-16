import { PurgeCSS } from 'purgecss';
import fs from 'fs';
import path from 'path';

export async function purgeUnusedCSS(cssFilePath, contentPaths) {
  const purgeCSSResult = await new PurgeCSS().purge({
    content: contentPaths,
    css: [cssFilePath],
    defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
    safelist: [
      // Keep essential classes
      /^(html|body)/,
      /^(touch-target|ios-)/,
      /^(safe-area)/,
      /^(bg-|text-|border-)/,
      /^(flex|grid|block|inline)/,
      /^(w-|h-|p-|m-)/,
      /^(rounded|shadow)/,
      // Keep responsive variants for mobile
      /^(sm:|md:|lg:)/,
      // Keep state variants
      /^(hover:|focus:|active:)/,
    ],
  });

  return purgeCSSResult[0].css;
}
