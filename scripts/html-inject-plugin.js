/**
 * Vite plugin to ensure the main script tag is injected into the HTML
 * This fixes the blank screen issue caused by missing script injection
 */
export function htmlInjectPlugin() {
  return {
    name: 'html-inject',
    generateBundle(options, bundle) {
      console.log('🔍 Available bundle files:', Object.keys(bundle));

      // Find the main JavaScript entry
      const mainEntry = Object.keys(bundle).find(
        (fileName) =>
          fileName.includes('index') && fileName.endsWith('.js') && fileName.startsWith('assets/')
      );

      if (!mainEntry) {
        console.warn('⚠️ Main entry script not found for HTML injection');
        console.log(
          'Available JS files:',
          Object.keys(bundle).filter((f) => f.endsWith('.js'))
        );
        return;
      }

      // Find the HTML file
      const htmlFile = Object.keys(bundle).find((fileName) => fileName.endsWith('.html'));
      if (!htmlFile) {
        console.warn('⚠️ HTML file not found for script injection');
        console.log('Available files:', Object.keys(bundle));
        return;
      }

      const htmlBundle = bundle[htmlFile];
      if (htmlBundle && htmlBundle.type === 'asset' && typeof htmlBundle.source === 'string') {
        // Check if script tag is already present
        if (!htmlBundle.source.includes(`src="/${mainEntry}"`)) {
          // Inject the script tag before closing body tag
          htmlBundle.source = htmlBundle.source.replace(
            '</body>',
            `    <script type="module" crossorigin src="/${mainEntry}"></script>\n  </body>`
          );
          console.log(`✅ Injected script tag for ${mainEntry} into ${htmlFile}`);
        } else {
          console.log(`✅ Script tag for ${mainEntry} already present in ${htmlFile}`);
        }
      }
    },
  };
}
